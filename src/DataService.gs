/**
 * Loads Application Fee Paid data only once.
 *
 * The returned object is reused by:
 * - MatrixService
 * - PivotService
 * - DailyFullPaidService
 */
function loadFeeSheetData_(config) {
  const sheet = requireSheet_(config.feeSheet);

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow < 2) {
    throw new Error(
      '"' + config.feeSheet + '" contains no data rows.'
    );
  }

  if (lastColumn < 1) {
    throw new Error(
      '"' + config.feeSheet + '" contains no columns.'
    );
  }

  const values = sheet
    .getRange(
      1,
      1,
      lastRow,
      lastColumn
    )
    .getValues();

  if (!values || !values.length) {
    throw new Error(
      'Unable to read data from "' +
      config.feeSheet +
      '".'
    );
  }

  const headers = values[0];
  const rows = values.slice(1);
  const headerMap = buildHeaderMap_(headers);

  return {
    sheetName: config.feeSheet,
    lastRow: lastRow,
    lastColumn: lastColumn,
    headers: headers,
    rows: rows,
    headerMap: headerMap
  };
}


/**
 * Allows individual service functions to still work
 * when run independently during development.
 */
function resolveFeeData_(config, feeData) {
  if (
    feeData &&
    feeData.rows &&
    feeData.headerMap
  ) {
    return feeData;
  }

  return loadFeeSheetData_(config);
}


/**
 * Formats a number using standard comma grouping.
 *
 * Example:
 * 1400000 → 1,400,000
 */
function formatReportNumber_(value) {
  const number = matrixNumber_(value);

  if (number === null) {
    return String(value || '').trim();
  }

  const rounded =
    Math.round(number * 100) / 100;

  const parts = String(rounded).split('.');

  parts[0] = parts[0].replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ','
  );

  return parts.join('.');
}
