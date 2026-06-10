/**
 * Google Sheets Integration - Utility Functions
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

/**
 * Load environment variables from .env file
 * The .env file should be in the same directory as scripts/integrations/google_sheet/
 */
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error(`[ERROR] .env file not found at: ${envPath}`);
    console.error('Copy .env.example to .env and fill in the required values.');
    process.exit(1);
  }
  require('dotenv').config({ path: envPath });
}

/**
 * Validate required environment variables
 * @param {string[]} requiredVars - List of variable names to check
 */
function validateEnvVars(requiredVars) {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`[ERROR] Missing environment variables: ${missing.join(', ')}`);
    console.error('Check your .env file and provide all required values.');
    process.exit(1);
  }
}

/**
 * Build a Google Auth client from Service Account or API Key
 * @returns {object} auth client or apiKey string
 */
function buildGoogleAuth() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (keyPath) {
    const resolvedPath = path.resolve(__dirname, keyPath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`[ERROR] Service Account key file not found: ${resolvedPath}`);
      console.error('Download the JSON credentials file from Google Cloud Console.');
      process.exit(1);
    }
    const auth = new google.auth.GoogleAuth({
      keyFile: resolvedPath,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    });
    return { type: 'serviceAccount', auth };
  }

  if (apiKey) {
    return { type: 'apiKey', apiKey };
  }

  console.error('[ERROR] Missing Google authentication credentials.');
  console.error('Provide GOOGLE_SERVICE_ACCOUNT_KEY_PATH (Service Account) or GOOGLE_API_KEY (read-only).');
  process.exit(1);
}

/**
 * Build a Google Sheets API client
 * @returns {object} sheets API client
 */
async function buildSheetsClient() {
  const authInfo = buildGoogleAuth();

  if (authInfo.type === 'serviceAccount') {
    const authClient = await authInfo.auth.getClient();
    return google.sheets({ version: 'v4', auth: authClient });
  }

  if (authInfo.type === 'apiKey') {
    return google.sheets({ version: 'v4', auth: authInfo.apiKey });
  }
}

/**
 * Convert rows (2D array from Sheets API) to an array of objects
 * First row is treated as headers, remaining rows as data
 * @param {string[][]} rows - Raw data from Sheets API
 * @returns {object[]} Array of objects keyed by column name
 */
function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];

  const headers = rows[0].map((h) => String(h).trim());
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Skip completely empty rows
    if (!row || row.every((cell) => !cell)) continue;

    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx] !== undefined ? String(row[idx]) : '';
    });
    data.push(obj);
  }

  return data;
}

/**
 * Convert an array of objects to rows (2D array) for writing to Sheets
 * @param {object[]} objects - Array of data objects
 * @param {string[]} [columns] - Ordered column list (defaults to object keys)
 * @returns {{ headers: string[], rows: string[][] }}
 */
function objectsToRows(objects, columns) {
  if (!objects || objects.length === 0) return { headers: [], rows: [] };

  const headers = columns || Object.keys(objects[0]);
  const rows = objects.map((obj) => headers.map((h) => {
    const val = obj[h];
    if (val === null || val === undefined) return '';
    return String(val);
  }));

  return { headers, rows };
}

/**
 * Build an A1 notation range string for a sheet
 * @param {string} sheetName - Sheet tab name
 * @param {string} [range] - Range e.g. "A1:Z100" (optional)
 * @returns {string} Full range string e.g. "Sheet1!A1:Z100"
 */
function buildRange(sheetName, range) {
  const escapedName = sheetName.includes(' ') ? `'${sheetName}'` : sheetName;
  return range ? `${escapedName}!${range}` : escapedName;
}

/**
 * Format a test result into a row for writing to Sheets
 * @param {object} testResult - Test result object
 * @returns {string[]} Row values
 */
function formatTestResultRow(testResult) {
  const now = new Date();
  const timezone = process.env.TIMEZONE || 'Asia/Ho_Chi_Minh';
  const timestamp = now.toLocaleString('en-US', { timeZone: timezone });

  return [
    testResult.id || '',
    testResult.title || '',
    testResult.status || '',         // PASS | FAIL | SKIP
    testResult.duration || '',        // ms
    testResult.error || '',
    testResult.suite || '',
    testResult.file || '',
    timestamp,
    testResult.retries || '0',
    testResult.annotations || '',
  ];
}

/**
 * Read a JSON file from disk
 * @param {string} filePath - Path to the file
 * @returns {object|null}
 */
function readJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[ERROR] Could not read file: ${filePath}`, err.message);
    return null;
  }
}

/**
 * Save data as a JSON file
 * @param {string} filePath
 * @param {object} data
 */
function saveJsonToFile(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[OK] File saved: ${filePath}`);
}

/**
 * Save text content to a file
 * @param {string} filePath
 * @param {string} content
 */
function saveTextToFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`[OK] File saved: ${filePath}`);
}

/**
 * Generate a timestamp string in YYYYMMDD_HHmmss format
 * @returns {string}
 */
function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

/**
 * Log a message with a timestamp prefix
 * @param {string} level - LOG | WARN | ERROR
 * @param {string} message
 */
function log(level, message) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level}]`;
  if (level === 'ERROR') {
    console.error(`${prefix} ${message}`);
  } else if (level === 'WARN') {
    console.warn(`${prefix} ${message}`);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Handle errors from the Google Sheets API
 * @param {Error} error
 * @param {string} context
 */
function handleApiError(error, context) {
  const status = error?.response?.status || error?.code;
  const message = error?.response?.data?.error?.message || error?.message;

  log('ERROR', `[${context}] ${status ? `HTTP ${status}: ` : ''}${message}`);

  if (status === 401 || status === 403) {
    log('ERROR', 'Authentication error. Check that the Service Account has access to the Spreadsheet.');
    log('ERROR', 'Make sure the Spreadsheet is shared with the Service Account email.');
  } else if (status === 404) {
    log('ERROR', 'Spreadsheet not found. Check GOOGLE_SPREADSHEET_ID in .env.');
  } else if (String(message).includes('Unable to parse range')) {
    log('ERROR', 'Invalid range. Check the sheet name and range format (e.g. Sheet1!A1:Z100).');
  }
}

/**
 * Convert a 0-indexed column index to A1 notation (A, B, ... Z, AA, AB, ...)
 * @param {number} colIndex - 0-indexed column number
 * @returns {string}
 */
function colIndexToLetter(colIndex) {
  let letter = '';
  let index = colIndex;
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

module.exports = {
  loadEnv,
  validateEnvVars,
  buildGoogleAuth,
  buildSheetsClient,
  rowsToObjects,
  objectsToRows,
  buildRange,
  formatTestResultRow,
  readJsonFile,
  saveJsonToFile,
  saveTextToFile,
  getTimestamp,
  log,
  handleApiError,
  colIndexToLetter,
};
