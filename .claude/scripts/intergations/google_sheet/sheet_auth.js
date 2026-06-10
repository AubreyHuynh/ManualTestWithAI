/**
 * Google Sheets Auth - Verify and test Google Sheets connectivity
 *
 * Supports:
 *   - Service Account (recommended for automation / CI-CD)
 *   - API Key (public Sheets only, read-only)
 *
 * Usage:
 *   node sheet_auth.js --verify                     Check Spreadsheet connection
 *   node sheet_auth.js --verify --sheet "Login"     Verify + test-read a specific sheet
 *   node sheet_auth.js --setup                      Show credentials setup guide
 *   node sheet_auth.js                              Show usage help
 */

const path = require('path');
const fs = require('fs');
const {
  loadEnv,
  buildSheetsClient,
  buildGoogleAuth,
  log,
  handleApiError,
} = require('./utils');

function initEnv() {
  loadEnv();
}

/**
 * Verify connection and access permissions for the Spreadsheet
 * @param {string|null} sheetName - Specific sheet to verify (optional)
 */
async function verifyConnection(sheetName = null) {
  initEnv();

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId || spreadsheetId === 'your-spreadsheet-id-here') {
    log('ERROR', 'GOOGLE_SPREADSHEET_ID is not configured in .env');
    process.exit(1);
  }

  log('LOG', 'Checking Google Sheets API connection...');

  try {
    const sheets = await buildSheetsClient();

    const metaRes = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'spreadsheetId,properties,sheets',
    });

    const meta = metaRes.data;
    log('LOG', `✅ Connection successful!`);
    log('LOG', `📊 Spreadsheet: "${meta.properties?.title}"`);
    log('LOG', `🔗 URL: https://docs.google.com/spreadsheets/d/${meta.spreadsheetId}/edit`);
    log('LOG', `📋 Sheet list:`);

    const sheetList = meta.sheets || [];
    sheetList.forEach((s, i) => {
      const props = s.properties;
      const marker = sheetName && props.title === sheetName ? ' ◀ verifying' : '';
      log('LOG', `   ${i + 1}. "${props.title}" (ID: ${props.sheetId}, Rows: ${props.gridProperties?.rowCount || '?'}, Cols: ${props.gridProperties?.columnCount || '?'})${marker}`);
    });

    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
    if (keyPath) {
      const resolvedPath = path.resolve(__dirname, keyPath);
      const keyData = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
      log('LOG', `🔑 Auth: Service Account (${keyData.client_email})`);
    } else {
      log('LOG', `🔑 Auth: API Key (read-only mode)`);
    }

    if (sheetName) {
      log('LOG', ``);
      log('LOG', `🔍 Verifying sheet: "${sheetName}"...`);

      const sheetExists = sheetList.some((s) => s.properties.title === sheetName);
      if (!sheetExists) {
        log('ERROR', `❌ Sheet "${sheetName}" does not exist in this Spreadsheet.`);
        log('LOG', `💡 Available sheets: ${sheetList.map((s) => `"${s.properties.title}"`).join(', ')}`);
        return false;
      }

      try {
        const readRes = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A1:A5`,
          valueRenderOption: 'FORMATTED_VALUE',
        });
        const rows = readRes.data.values || [];
        if (rows.length === 0) {
          log('WARN', `⚠️  Sheet "${sheetName}" exists but has no data (empty).`);
        } else {
          log('LOG', `✅ Sheet "${sheetName}" is readable — ${rows.length} row(s) found.`);
          log('LOG', `   A1 value: "${rows[0]?.[0] || '(empty)'}"`);
        }
      } catch (readError) {
        log('ERROR', `❌ Cannot read sheet "${sheetName}": ${readError.message}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    handleApiError(error, 'Verify Connection');
    return false;
  }
}

/**
 * Print the credentials setup guide
 */
function printSetupGuide() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║          GOOGLE SHEETS INTEGRATION - Setup Guide                    ║
╚══════════════════════════════════════════════════════════════════════╝

📌 OPTION 1: Service Account (Recommended - full read & write access)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Create a Google Cloud Project
  → Go to: https://console.cloud.google.com/
  → Create a new project or select an existing one

Step 2: Enable the Google Sheets API
  → APIs & Services → Library → Search "Google Sheets API" → Enable

Step 3: Create a Service Account
  → APIs & Services → Credentials → Create Credentials → Service Account
  → Enter a name (e.g. "manual-test-automation") → Create
  → Go to the Service Account → Keys → Add Key → JSON → Download

Step 4: Configure .env
  → Copy the JSON file to this directory (e.g. service-account.json)
  → Open .env → GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account.json

Step 5: Share the Spreadsheet with the Service Account
  → Open the Spreadsheet → Share
  → Enter the Service Account email (from the JSON file: client_email)
  → Grant "Editor" access (for both read and write)
  → Click "Share"

Step 6: Get the Spreadsheet ID
  → From the Google Sheet URL:
    https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
  → Copy the <SPREADSHEET_ID> → Paste into GOOGLE_SPREADSHEET_ID in .env

Step 7: Verify the connection
  → node sheet_auth.js --verify

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 OPTION 2: API Key (Read-only - public Sheets only)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Create an API Key at:
  → https://console.cloud.google.com/apis/credentials
  → Create Credentials → API Key

Step 2: Configure .env
  → GOOGLE_API_KEY=your-api-key-here

Step 3: Set the Google Sheet to "Anyone with the link can view"

NOTE: API Key CANNOT write data to Sheets. Use a Service Account if
you need to write test results.
`);
}

// ============ CLI ============

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

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.verify) {
    const sheetName = args.sheet || null;
    const ok = await verifyConnection(sheetName);
    process.exit(ok ? 0 : 1);
  }

  if (args.setup) {
    printSetupGuide();
    return;
  }

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         GOOGLE SHEETS AUTH - Manual Test with AI          ║
╚═══════════════════════════════════════════════════════════╝

Usage:
  node sheet_auth.js [options]

Options:
  --verify              Check connection and Spreadsheet access
  --verify --sheet NAME Verify + test-read a specific sheet
  --setup               Show detailed credentials setup guide

Examples:
  node sheet_auth.js --verify
  node sheet_auth.js --verify --sheet "Login"
  node sheet_auth.js --verify --sheet "Test Results"
  node sheet_auth.js --setup
  `);
}

if (require.main === module) {
  main().catch((err) => {
    log('ERROR', `Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { verifyConnection };
