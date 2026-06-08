/**
 * Google Sheets Reader - Read data from Google Sheets
 *
 * Supports:
 *   - Read an entire sheet or a specific range
 *   - Read multiple sheets/ranges at once (batch)
 *   - Export to JSON or Markdown
 *   - Use as a Test Data source for automation
 *
 * Usage:
 *   node sheet_reader.js --sheet "Test Cases"
 *   node sheet_reader.js --sheet "Sheet1" --range "A1:F50"
 *   node sheet_reader.js --batch "Sheet1,Sheet2,Test Data"
 *   node sheet_reader.js --sheet "Test Cases" --format md
 *   node sheet_reader.js --sheet "Requirements" --output ./requirements
 *   node sheet_reader.js --list                         # List all sheets
 */

const path = require('path');
const fs = require('fs');
const {
  loadEnv,
  validateEnvVars,
  buildSheetsClient,
  rowsToObjects,
  buildRange,
  saveJsonToFile,
  saveTextToFile,
  getTimestamp,
  log,
  handleApiError,
} = require('./utils');

let SPREADSHEET_ID;

function initEnv() {
  loadEnv();
  validateEnvVars(['GOOGLE_SPREADSHEET_ID']);
  SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
}

/**
 * List all sheets in the Spreadsheet
 * @returns {object[]} Array of sheet metadata
 */
async function listSheets() {
  log('LOG', 'Fetching sheet list...');

  try {
    const sheets = await buildSheetsClient();
    const res = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'properties.title,sheets.properties',
    });

    const sheetList = (res.data.sheets || []).map((s) => ({
      id: s.properties.sheetId,
      title: s.properties.title,
      rows: s.properties.gridProperties?.rowCount || 0,
      cols: s.properties.gridProperties?.columnCount || 0,
      index: s.properties.index,
    }));

    log('LOG', `Found ${sheetList.length} sheet(s) in "${res.data.properties?.title}"`);
    return sheetList;
  } catch (error) {
    handleApiError(error, 'List Sheets');
    return [];
  }
}

/**
 * Read data from a specific sheet or range
 * @param {string} sheetName - Sheet tab name
 * @param {string} [range] - Range e.g. "A1:Z100" (optional)
 * @returns {{ headers: string[], rows: string[][], data: object[] }}
 */
async function readSheet(sheetName, range) {
  const fullRange = buildRange(sheetName, range);
  log('LOG', `Reading: ${fullRange} ...`);

  try {
    const sheets = await buildSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: fullRange,
      valueRenderOption: 'FORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    });

    const rows = res.data.values || [];
    if (rows.length === 0) {
      log('WARN', `Sheet "${sheetName}" is empty or has no data in this range.`);
      return { headers: [], rows: [], data: [] };
    }

    const headers = rows[0].map((h) => String(h).trim());
    const dataRows = rows.slice(1);
    const data = rowsToObjects(rows);

    log('LOG', `Read successful: ${data.length} row(s), ${headers.length} col(s)`);
    return { headers, rows: dataRows, data };
  } catch (error) {
    handleApiError(error, `Read Sheet "${sheetName}"`);
    return { headers: [], rows: [], data: [] };
  }
}

/**
 * Read multiple sheets at once (batch read)
 * @param {string[]} sheetNames - Array of sheet names
 * @returns {object} Map: { sheetName: { headers, rows, data } }
 */
async function readBatch(sheetNames) {
  log('LOG', `Batch reading ${sheetNames.length} sheet(s): ${sheetNames.join(', ')}`);

  try {
    const sheets = await buildSheetsClient();
    const ranges = sheetNames.map((name) => buildRange(name));

    const res = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges,
      valueRenderOption: 'FORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    });

    const result = {};
    const valueRanges = res.data.valueRanges || [];

    valueRanges.forEach((vr, idx) => {
      const sheetName = sheetNames[idx];
      const rows = vr.values || [];

      if (rows.length === 0) {
        log('WARN', `Sheet "${sheetName}": empty`);
        result[sheetName] = { headers: [], rows: [], data: [] };
      } else {
        const headers = rows[0].map((h) => String(h).trim());
        const data = rowsToObjects(rows);
        result[sheetName] = { headers, rows: rows.slice(1), data };
        log('LOG', `  "${sheetName}": ${data.length} row(s), ${headers.length} col(s)`);
      }
    });

    return result;
  } catch (error) {
    handleApiError(error, 'Batch Read');
    return {};
  }
}

/**
 * Convert sheet data to a Markdown table
 * @param {string} sheetName
 * @param {{ headers: string[], data: object[] }} sheetData
 * @returns {string} Markdown content
 */
function sheetToMarkdown(sheetName, sheetData) {
  const { headers, data } = sheetData;

  if (!data || data.length === 0) {
    return `# Sheet: ${sheetName}\n\n_No data found_\n`;
  }

  let md = `# Sheet: ${sheetName}\n\n`;
  md += `> Total: **${data.length} row(s)** | Columns: **${headers.length}** | Read at: ${new Date().toISOString()}\n\n`;

  md += `| ${headers.join(' | ')} |\n`;
  md += `| ${headers.map(() => '---').join(' | ')} |\n`;

  data.forEach((row) => {
    const values = headers.map((h) => {
      const val = row[h] || '';
      return String(val).replace(/\|/g, '\\|').replace(/\n/g, ' ');
    });
    md += `| ${values.join(' | ')} |\n`;
  });

  return md;
}

// ============ CLI ============

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || Object.keys(args).length === 0) {
    printUsage();
    return;
  }

  initEnv();

  // Mode: List sheets
  if (args.list) {
    const sheetList = await listSheets();
    if (sheetList.length === 0) {
      log('WARN', 'No sheets found.');
      return;
    }

    console.log('\n--- Sheet List ---');
    sheetList.forEach((s, i) => {
      console.log(`  ${i + 1}. "${s.title}" (${s.rows} rows × ${s.cols} cols)`);
    });
    console.log(`\nSpreadsheet ID: ${SPREADSHEET_ID}`);
    return;
  }

  const timestamp = getTimestamp();
  const baseOutputDir = args.output
    ? path.resolve(process.cwd(), args.output)
    : path.resolve(__dirname, '..', '..', '..', process.env.OUTPUT_DIR || 'requirements/google_sheet');

  // Mode: Batch read multiple sheets
  if (args.batch) {
    const sheetNames = args.batch.split(',').map((s) => s.trim()).filter(Boolean);
    const batchData = await readBatch(sheetNames);

    const outputDir = path.join(baseOutputDir, `batch_${timestamp}`);

    if (args.format === 'md' || args.format === 'markdown') {
      for (const [sheetName, sheetData] of Object.entries(batchData)) {
        const safeName = sheetName.replace(/[^a-zA-Z0-9]/g, '_');
        const mdContent = sheetToMarkdown(sheetName, sheetData);
        saveTextToFile(path.join(outputDir, `${safeName}.md`), mdContent);
      }

      let overview = `# Google Sheets Export — Overview\n\n`;
      overview += `> Read at: ${new Date().toISOString()} | Spreadsheet: ${SPREADSHEET_ID}\n\n`;
      overview += `| # | Sheet | Rows | Cols |\n`;
      overview += `|---|-------|------|------|\n`;
      Object.entries(batchData).forEach(([name, d], i) => {
        const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
        overview += `| ${i + 1} | [${name}](./${safeName}.md) | ${d.data.length} | ${d.headers.length} |\n`;
      });
      saveTextToFile(path.join(outputDir, '_overview.md'), overview);
    } else {
      const jsonData = {};
      for (const [sheetName, sheetData] of Object.entries(batchData)) {
        jsonData[sheetName] = {
          headers: sheetData.headers,
          totalRows: sheetData.data.length,
          data: sheetData.data,
        };
      }
      saveJsonToFile(path.join(outputDir, `batch_data.json`), {
        readAt: new Date().toISOString(),
        spreadsheetId: SPREADSHEET_ID,
        sheets: Object.keys(batchData),
        data: jsonData,
      });
    }

    log('LOG', `Output: ${outputDir}`);
    return;
  }

  // Mode: Read a single sheet
  if (args.sheet) {
    const sheetName = args.sheet;
    const range = args.range || null;
    const sheetData = await readSheet(sheetName, range);

    if (sheetData.data.length === 0) {
      log('WARN', 'No data to export.');
      return;
    }

    const safeName = sheetName.replace(/[^a-zA-Z0-9]/g, '_');
    const outputDir = path.join(baseOutputDir, safeName);

    if (args.format === 'md' || args.format === 'markdown') {
      const mdContent = sheetToMarkdown(sheetName, sheetData);
      const mdFile = path.join(outputDir, `${safeName}.md`);
      saveTextToFile(mdFile, mdContent);
    } else {
      const jsonFile = path.join(outputDir, `${safeName}_data.json`);
      saveJsonToFile(jsonFile, {
        readAt: new Date().toISOString(),
        spreadsheetId: SPREADSHEET_ID,
        sheetName,
        range: range || 'full',
        totalRows: sheetData.data.length,
        headers: sheetData.headers,
        data: sheetData.data,
      });

      console.log('\n--- Summary ---');
      console.log(`  Sheet: "${sheetName}"`);
      console.log(`  Rows: ${sheetData.data.length}`);
      console.log(`  Columns: ${sheetData.headers.join(', ')}`);
      if (sheetData.data.length > 0) {
        console.log(`  Sample row[0]: ${JSON.stringify(sheetData.data[0])}`);
      }
    }

    log('LOG', `Output: ${outputDir}`);
  }
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
║        GOOGLE SHEETS READER - Manual Test with AI           ║
║        Read data from Google Sheets for Test Automation     ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  node sheet_reader.js [options]

Options:
  --list                  List all sheets in the Spreadsheet
  --sheet <NAME>          Sheet tab name to read
  --range <A1_RANGE>      Specific range e.g. "A1:F100" (optional)
  --batch <NAMES>         Read multiple sheets, comma-separated
  --format <FMT>          Output format: json (default) or md
  --output <DIR>          Directory to save output files
  --help                  Show this help

Examples:
  node sheet_reader.js --list
  node sheet_reader.js --sheet "Test Cases"
  node sheet_reader.js --sheet "Sheet1" --range "A1:G50"
  node sheet_reader.js --sheet "Test Cases" --format md
  node sheet_reader.js --batch "Sheet1,Test Data,Requirements"
  node sheet_reader.js --sheet "Requirements" --output ./requirements
  `);
}

module.exports = {
  listSheets,
  readSheet,
  readBatch,
  sheetToMarkdown,
};

if (require.main === module) {
  main().catch((err) => {
    log('ERROR', `Unexpected error: ${err.message}`);
    process.exit(1);
  });
}
