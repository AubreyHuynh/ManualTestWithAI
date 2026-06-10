/**
 * Google Sheets Writer - Write data / test results to Google Sheets
 *
 * Supports:
 *   - Write automation test results (Playwright JSON report)
 *   - Upload Excel files (.xlsx/.xls) to Google Sheets
 *   - Append new rows to the end of a sheet
 *   - Overwrite data in a specific range
 *   - Auto-create a new sheet if it does not exist
 *   - Color coding: PASS = green, FAIL = red, SKIP = yellow
 *
 * Usage:
 *   node sheet_writer.js --excel ./file.xlsx --sheet "SheetName"           Upload Excel
 *   node sheet_writer.js --excel ./file.xlsx --sheet "SheetName" --sheet-index 1  Select Excel tab
 *   node sheet_writer.js --results ./test-results.json                      Import Playwright
 *   node sheet_writer.js --results ./test-results.json --sheet "Results"
 *   node sheet_writer.js --append "Sheet1" --data '[{"Name":"John"}]'
 *   node sheet_writer.js --clear "Sheet1" --range "A2:Z1000"
 *   node sheet_writer.js --create "New Sheet"
 */

const path = require('path');
const fs = require('fs');
const {
  loadEnv,
  validateEnvVars,
  buildSheetsClient,
  objectsToRows,
  buildRange,
  formatTestResultRow,
  readJsonFile,
  getTimestamp,
  log,
  handleApiError,
  colIndexToLetter,
} = require('./utils');

let SPREADSHEET_ID;

function initEnv() {
  loadEnv();
  validateEnvVars(['GOOGLE_SPREADSHEET_ID']);
  SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
}

/**
 * Create a sheet if it does not already exist
 * @param {string} sheetName
 * @returns {boolean} true if created or already exists
 */
async function ensureSheetExists(sheetName) {
  try {
    const sheetsClient = await buildSheetsClient();

    const metaRes = await sheetsClient.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets.properties.title',
    });

    const existing = (metaRes.data.sheets || []).map((s) => s.properties.title);

    if (existing.includes(sheetName)) {
      log('LOG', `Sheet "${sheetName}" already exists.`);
      return true;
    }

    log('LOG', `Creating new sheet: "${sheetName}"...`);
    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: sheetName,
              gridProperties: { rowCount: 1000, columnCount: 26 },
            },
          },
        }],
      },
    });

    log('LOG', `✅ Sheet created: "${sheetName}"`);
    return true;
  } catch (error) {
    handleApiError(error, `Ensure Sheet "${sheetName}"`);
    return false;
  }
}

/**
 * Clear the contents of a range
 * @param {string} sheetName
 * @param {string} [range] - Range e.g. "A2:Z1000" (defaults to all data rows)
 */
async function clearRange(sheetName, range = 'A2:Z10000') {
  const fullRange = buildRange(sheetName, range);
  log('LOG', `Clearing range: ${fullRange}...`);

  try {
    const sheetsClient = await buildSheetsClient();
    await sheetsClient.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: fullRange,
    });
    log('LOG', `✅ Cleared range: ${fullRange}`);
  } catch (error) {
    handleApiError(error, `Clear Range "${fullRange}"`);
  }
}

/**
 * Write headers to the first row of a sheet
 * @param {string} sheetName
 * @param {string[]} headers
 */
async function writeHeaders(sheetName, headers) {
  const range = buildRange(sheetName, 'A1');
  log('LOG', `Writing headers to "${sheetName}"...`);

  try {
    const sheetsClient = await buildSheetsClient();
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });
    log('LOG', `✅ Wrote ${headers.length} column headers`);
  } catch (error) {
    handleApiError(error, `Write Headers "${sheetName}"`);
  }
}

/**
 * Append rows to the end of a sheet (after existing data)
 * @param {string} sheetName
 * @param {string[][]} rows - 2D array of values
 * @returns {number} Number of rows appended
 */
async function appendRows(sheetName, rows) {
  if (!rows || rows.length === 0) {
    log('WARN', 'No rows to append.');
    return 0;
  }

  const range = buildRange(sheetName);
  log('LOG', `Appending ${rows.length} row(s) to "${sheetName}"...`);

  try {
    const sheetsClient = await buildSheetsClient();
    const res = await sheetsClient.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rows,
      },
    });

    const updates = res.data.updates;
    log('LOG', `✅ Appended ${rows.length} row(s) to ${updates?.updatedRange || sheetName}`);
    return rows.length;
  } catch (error) {
    handleApiError(error, `Append Rows "${sheetName}"`);
    return 0;
  }
}

/**
 * Overwrite data in a specific range
 * @param {string} sheetName
 * @param {string} range - Range e.g. "A1:G100"
 * @param {string[][]} rows - 2D array of values
 */
async function writeRange(sheetName, range, rows) {
  const fullRange = buildRange(sheetName, range);
  log('LOG', `Writing ${rows.length} row(s) to ${fullRange}...`);

  try {
    const sheetsClient = await buildSheetsClient();
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: fullRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    });
    log('LOG', `✅ Wrote ${rows.length} row(s) to ${fullRange}`);
  } catch (error) {
    handleApiError(error, `Write Range "${fullRange}"`);
  }
}

/**
 * Apply color coding to the Status column in a test results sheet
 * PASS = green, FAIL = red, SKIP = yellow
 * @param {string} sheetName
 * @param {number} sheetId - Numeric sheet ID
 * @param {number} startRow - Starting row (0-indexed, skips header)
 * @param {Array<{status: string}>} results - Test result list
 * @param {number} statusColIndex - Status column index (0-indexed)
 */
async function applyStatusColors(sheetName, sheetId, startRow, results, statusColIndex = 2) {
  if (!results || results.length === 0) return;

  log('LOG', `Applying color coding to ${results.length} row(s)...`);

  const colorMap = {
    PASS:    { red: 0.149, green: 0.800, blue: 0.376 },
    FAILED:  { red: 0.918, green: 0.263, blue: 0.208 },
    FAIL:    { red: 0.918, green: 0.263, blue: 0.208 },
    SKIP:    { red: 1.0,   green: 0.757, blue: 0.027 },
    SKIPPED: { red: 1.0,   green: 0.757, blue: 0.027 },
  };

  const requests = results.map((result, idx) => {
    const rowIndex = startRow + idx;
    const statusKey = (result.status || '').toUpperCase();
    const color = colorMap[statusKey] || { red: 0.9, green: 0.9, blue: 0.9 };

    return {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: rowIndex,
          endRowIndex: rowIndex + 1,
          startColumnIndex: statusColIndex,
          endColumnIndex: statusColIndex + 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: color,
            textFormat: {
              bold: true,
              foregroundColor: { red: 1, green: 1, blue: 1 },
            },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    };
  });

  try {
    const sheetsClient = await buildSheetsClient();
    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests },
    });
    log('LOG', `✅ Color coding applied to Status column`);
  } catch (error) {
    log('WARN', `Could not apply color coding: ${error.message}. Continuing without colors.`);
  }
}

/**
 * Convert a Playwright JSON report to rows for writing
 * @param {object} playwrightReport - Content of test-results.json
 * @returns {{ headers: string[], rows: string[][], results: object[] }}
 */
function convertPlaywrightReport(playwrightReport) {
  const headers = [
    'Test ID', 'Title', 'Status', 'Duration (ms)',
    'Error', 'Suite', 'File', 'Run At', 'Retries', 'Annotations',
  ];

  const results = [];

  function processSpec(spec, suiteName) {
    if (spec.tests) {
      spec.tests.forEach((test) => {
        const result = test.results?.[0] || {};
        const status = result.status || test.outcome || 'unknown';
        const normalizedStatus = {
          'expected': 'PASS',
          'unexpected': 'FAIL',
          'flaky': 'FAIL',
          'skipped': 'SKIP',
          'passed': 'PASS',
          'failed': 'FAIL',
        }[status.toLowerCase()] || status.toUpperCase();

        results.push({
          id: test.testId || '',
          title: test.title || '',
          status: normalizedStatus,
          duration: result.duration || '',
          error: result.errors?.[0]?.message?.replace(/\n/g, ' ').substring(0, 200) || '',
          suite: suiteName || spec.title || '',
          file: spec.file || '',
          retries: result.retry || '0',
          annotations: (test.annotations || []).map((a) => `${a.type}: ${a.description}`).join('; '),
        });
      });
    }
    if (spec.suites) {
      spec.suites.forEach((sub) => processSpec(sub, suiteName || spec.title));
    }
  }

  const suites = playwrightReport.suites || [];
  suites.forEach((suite) => processSpec(suite, suite.title));

  const rows = results.map((r) => formatTestResultRow(r));

  return { headers, rows, results };
}

/**
 * Import Playwright test results to Google Sheets
 * @param {string} reportPath - Path to test-results.json
 * @param {string} sheetName - Target sheet name
 * @param {object} options - { clearFirst: boolean, addSummaryRow: boolean }
 */
async function importPlaywrightResults(reportPath, sheetName, options = {}) {
  const { clearFirst = false, addSummaryRow = true } = options;

  log('LOG', `Reading Playwright report: ${reportPath}`);

  const rawReport = readJsonFile(reportPath);
  if (!rawReport) {
    log('ERROR', `Could not read file: ${reportPath}`);
    return;
  }

  const { headers, rows, results } = convertPlaywrightReport(rawReport);

  if (rows.length === 0) {
    log('WARN', 'No tests found in report.');
    return;
  }

  log('LOG', `Found ${rows.length} test result(s)`);

  await ensureSheetExists(sheetName);

  let sheetId = null;
  try {
    const sheetsClient = await buildSheetsClient();
    const metaRes = await sheetsClient.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets.properties',
    });
    const found = (metaRes.data.sheets || []).find(
      (s) => s.properties.title === sheetName,
    );
    sheetId = found?.properties?.sheetId;
  } catch (_) {}

  if (clearFirst) {
    await clearRange(sheetName);
    await writeHeaders(sheetName, headers);
    await appendRows(sheetName, rows);

    if (sheetId !== null) {
      await applyStatusColors(sheetName, sheetId, 1, results, 2);
    }
  } else {
    const { readSheet } = require('./sheet_reader');
    const existing = await readSheet(sheetName, 'A1:A1');
    if (!existing.headers || existing.headers.length === 0) {
      await writeHeaders(sheetName, headers);
    }

    const currentData = await readSheet(sheetName);
    const existingRowCount = currentData.data.length + 1;

    await appendRows(sheetName, rows);

    if (sheetId !== null) {
      await applyStatusColors(sheetName, sheetId, existingRowCount + 1, results, 2);
    }
  }

  if (addSummaryRow) {
    const passCount = results.filter((r) => r.status === 'PASS').length;
    const failCount = results.filter((r) => r.status === 'FAIL').length;
    const skipCount = results.filter((r) => r.status === 'SKIP').length;
    const totalDuration = results.reduce((s, r) => s + (Number(r.duration) || 0), 0);

    const summaryRow = [
      '--- SUMMARY ---',
      `Total: ${rows.length}`,
      `PASS: ${passCount} | FAIL: ${failCount} | SKIP: ${skipCount}`,
      `${(totalDuration / 1000).toFixed(2)}s`,
      '', '', '',
      new Date().toISOString(),
      '', '',
    ];
    await appendRows(sheetName, [summaryRow]);
  }

  log('LOG', `✅ Import complete: ${rows.length} test(s) → Sheet "${sheetName}"`);

  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  const skipCount = results.filter((r) => r.status === 'SKIP').length;
  console.log('\n--- Import Results ---');
  console.log(`  ✅ PASS: ${passCount}`);
  console.log(`  ❌ FAIL: ${failCount}`);
  console.log(`  ⏭️  SKIP: ${skipCount}`);
  console.log(`  📊 Total: ${rows.length}`);
  console.log(`  🔗 URL: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
}

/**
 * Upload an Excel file (.xlsx/.xls) to Google Sheets
 * @param {string} excelPath - Path to the Excel file
 * @param {string} sheetName - Target sheet name on Google Sheets
 * @param {object} options - { sheetIndex: number, clearFirst: boolean, newlineReplacement: string }
 */
async function importExcel(excelPath, sheetName, options = {}) {
  const { sheetIndex = 0, clearFirst = true, newlineReplacement = ' | ' } = options;

  let XLSX;
  try {
    XLSX = require('xlsx');
  } catch (_) {
    log('ERROR', 'Package "xlsx" is not installed. Run: npm install xlsx');
    process.exit(1);
  }

  if (!fs.existsSync(excelPath)) {
    log('ERROR', `File not found: ${excelPath}`);
    process.exit(1);
  }

  log('LOG', `Reading Excel file: ${excelPath}`);
  const wb = XLSX.readFile(excelPath);

  if (sheetIndex >= wb.SheetNames.length) {
    log('ERROR', `Excel file only has ${wb.SheetNames.length} sheet(s): ${wb.SheetNames.join(', ')}`);
    process.exit(1);
  }

  const excelSheetName = wb.SheetNames[sheetIndex];
  const ws = wb.Sheets[excelSheetName];
  const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  const rows = rawRows.map((row) =>
    row.map((cell) => String(cell).replace(/\r\n|\r|\n/g, newlineReplacement))
  );

  log('LOG', `Excel sheet: "${excelSheetName}" → ${rows.length} rows × ${rows[0]?.length || 0} cols`);
  log('LOG', `Target Google Sheet: "${sheetName}"`);

  await ensureSheetExists(sheetName);

  if (clearFirst) {
    log('LOG', `Clearing existing data in "${sheetName}"...`);
    const sheetsClient = await buildSheetsClient();
    await sheetsClient.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
    });
  }

  log('LOG', `Uploading ${rows.length} rows...`);
  const sheetsClient = await buildSheetsClient();
  await sheetsClient.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });

  log('LOG', `✅ Upload complete: ${rows.length} rows → Sheet "${sheetName}"`);
  console.log('\n--- Excel Upload Results ---');
  console.log(`  📁 File: ${path.basename(excelPath)}`);
  console.log(`  📋 Excel sheet: "${excelSheetName}" (index ${sheetIndex})`);
  console.log(`  📊 Rows: ${rows.length} | Cols: ${rows[0]?.length || 0}`);
  console.log(`  ✅ Google Sheet: "${sheetName}"`);
  console.log(`  🔗 URL: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
}

// ============ CLI ============

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || Object.keys(args).length === 0) {
    printUsage();
    return;
  }

  initEnv();

  const defaultResultsSheet = process.env.RESULTS_SHEET_NAME || 'Test Results';

  // Mode: Import Playwright results
  if (args.results) {
    const reportPath = path.resolve(process.cwd(), args.results);
    if (!fs.existsSync(reportPath)) {
      log('ERROR', `File not found: ${reportPath}`);
      process.exit(1);
    }
    const sheetName = args.sheet || defaultResultsSheet;
    const clearFirst = args.clear === true || args['clear-first'] === true;
    await importPlaywrightResults(reportPath, sheetName, { clearFirst });
    return;
  }

  // Mode: Upload Excel file
  if (args.excel) {
    const excelPath = path.resolve(process.cwd(), args.excel);
    const sheetName = args.sheet;
    if (!sheetName) {
      log('ERROR', 'Target sheet name is required: --sheet <NAME>');
      process.exit(1);
    }
    const sheetIndex = args['sheet-index'] ? parseInt(args['sheet-index'], 10) : 0;
    const clearFirst = !(args['no-clear'] === true);
    await importExcel(excelPath, sheetName, { sheetIndex, clearFirst });
    return;
  }

  // Mode: Append JSON data
  if (args.append && args.data) {
    const sheetName = args.append;
    let data;
    try {
      data = JSON.parse(args.data);
    } catch (_) {
      log('ERROR', '--data value is invalid (must be a JSON array).');
      process.exit(1);
    }

    if (!Array.isArray(data)) {
      log('ERROR', '--data value must be a JSON array.');
      process.exit(1);
    }

    await ensureSheetExists(sheetName);
    const { headers, rows } = objectsToRows(data);
    await appendRows(sheetName, [headers, ...rows]);
    return;
  }

  // Mode: Clear range
  if (args.clear && args.clear !== true) {
    const sheetName = args.clear;
    const range = args.range || 'A2:Z10000';
    await clearRange(sheetName, range);
    return;
  }

  // Mode: Create new sheet
  if (args.create) {
    await ensureSheetExists(args.create);
    return;
  }

  log('WARN', 'No valid command received. Run --help to see usage.');
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.replace('--', '');
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function printUsage() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║        GOOGLE SHEETS WRITER - Manual Test with AI           ║
║        Write test automation results to Google Sheets       ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  node sheet_writer.js [options]

Options:
  --excel <FILE>        Upload an Excel file (.xlsx/.xls) to Google Sheets
  --sheet <NAME>        Target sheet name on Google Sheets (required with --excel)
  --sheet-index <N>     Excel tab index to read (0 = first tab, default: 0)
  --no-clear            Keep existing data, overwrite from A1 (default: clear first)
  --results <FILE>      Import a Playwright JSON report to Sheets
  --clear-first         Clear existing data before writing (use with --results)
  --append <SHEET>      Append JSON data to the specified sheet
  --data <JSON>         JSON array of data to append (use with --append)
  --clear <SHEET>       Clear data in a sheet (keeps row 1 - headers)
  --range <A1_RANGE>    Range to clear (use with --clear, default: A2:Z10000)
  --create <NAME>       Create a new sheet with the given name
  --help                Show this help

Examples:
  # Upload Excel to Google Sheet
  node sheet_writer.js --excel ./requirements/crm_login.xlsx --sheet "CRM_TC_LOGIN"
  node sheet_writer.js --excel ./data.xlsx --sheet "Sheet1" --sheet-index 1
  node sheet_writer.js --excel ./data.xlsx --sheet "Existing" --no-clear

  # Import Playwright results
  node sheet_writer.js --results ./test-results/results.json
  node sheet_writer.js --results ./results.json --sheet "Sprint 5 Results"
  node sheet_writer.js --results ./results.json --clear-first

  # Append custom data
  node sheet_writer.js --append "Test Data" --data '[{"Name":"John","Score":"95"}]'

  # Clear data
  node sheet_writer.js --clear "Test Results"
  node sheet_writer.js --clear "Sheet1" --range "A5:G100"

  # Create new sheet
  node sheet_writer.js --create "Sprint 6 Results"

Test Results Sheet structure:
  | Test ID | Title | Status | Duration (ms) | Error | Suite | File | Run At | Retries | Annotations |

Color coding:
  🟢 PASS  - Green background
  🔴 FAIL  - Red background
  🟡 SKIP  - Yellow background
  `);
}

module.exports = {
  ensureSheetExists,
  clearRange,
  appendRows,
  writeHeaders,
  writeRange,
  importPlaywrightResults,
  convertPlaywrightReport,
  importExcel,
};

if (require.main === module) {
  main().catch((err) => {
    log('ERROR', `Unexpected error: ${err.message}`);
    process.exit(1);
  });
}
