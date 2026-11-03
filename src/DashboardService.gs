/**
 * Creates the Source-wise Lead Journey report.
 *
 * Mastersheet columns used:
 *
 * P  = Publisher Name
 * X  = User Registration Date (M)
 * Y  = 1K Payment Date (M)
 * Z  = 15K Payment Date (M)
 * AA = 75K Payment Date
 * AB = Hostel Token
 */
function buildDashboardReport(
  config,
  reportDate
) {
  const dashboardSheet =
    requireSheet_(config.dashboardSheet);

  const masterSheet =
    requireSheet_(config.masterSheet);

  /*
   * Update Dashboard B2 only when the date differs.
   *
   * SpreadsheetApp.flush() is intentionally not used.
   * The report is calculated directly from Mastersheet,
   * so Dashboard formulas do not need to finish before
   * email generation.
   */
  const dateCell =
    dashboardSheet.getRange('B2');

  const currentDateKey =
    dashboardDateKey_(
      dateCell.getValue(),
      config.timezone
    );

  const reportDateKey =
    dashboardDateKey_(
      reportDate,
      config.timezone
    );

  if (currentDateKey !== reportDateKey) {
    dateCell
      .setValue(reportDate)
      .setNumberFormat('dd/MM/yyyy');
  }

  const lastRow =
    masterSheet.getLastRow();

  if (lastRow < 2) {
    throw new Error(
      'Mastersheet contains no data rows.'
    );
  }

  const dataRowCount =
    lastRow - 1;

  /*
   * Read only required columns.
   *
   * P = one column
   */
  const sourceValues =
    masterSheet
      .getRange(
        2,
        16,
        dataRowCount,
        1
      )
      .getValues();

  /*
   * X:AB = five columns:
   * Registration, 1K, 15K, 75K, Hostel Token
   */
  const dateValues =
    masterSheet
      .getRange(
        2,
        24,
        dataRowCount,
        5
      )
      .getValues();

  const sourceNames =
    dashboardSheet
      .getRange('A4:A23')
      .getDisplayValues()
      .flat()
      .map(function (value) {
        return String(value || '').trim();
      })
      .filter(Boolean);

  const resultBySource = {};

  sourceNames.forEach(function (sourceName) {
    resultBySource[
      normalizeText_(sourceName)
    ] = {
      source: sourceName,
      leadCount: 0,
      daywise1K: 0,
      datewise1K: 0,
      paid15K: 0,
      paid75K: 0,
      hostelToken: 0
    };
  });

  for (
    let rowIndex = 0;
    rowIndex < dataRowCount;
    rowIndex++
  ) {
    const sourceKey =
      normalizeText_(
        sourceValues[rowIndex][0]
      );

    const result =
      resultBySource[sourceKey];

    if (!result) {
      continue;
    }

    const rowDates =
      dateValues[rowIndex];

    const registrationDateKey =
      dashboardDateKey_(
        rowDates[0],
        config.timezone
      );

    const payment1KDateKey =
      dashboardDateKey_(
        rowDates[1],
        config.timezone
      );

    const payment15KDateKey =
      dashboardDateKey_(
        rowDates[2],
        config.timezone
      );

    const payment75KDateKey =
      dashboardDateKey_(
        rowDates[3],
        config.timezone
      );

    const hostelTokenDateKey =
      dashboardDateKey_(
        rowDates[4],
        config.timezone
      );

    /*
     * Lead Count:
     * Lead registration date = report date.
     */
    if (
      registrationDateKey ===
      reportDateKey
    ) {
      result.leadCount++;
    }

    /*
     * Daywise 1K:
     * Lead creation and 1K payment are both
     * on the report date.
     */
    if (
      registrationDateKey ===
        reportDateKey &&
      payment1KDateKey ===
        reportDateKey
    ) {
      result.daywise1K++;
    }

    /*
     * Datewise 1K:
     * 1K payment date = report date.
     */
    if (
      payment1KDateKey ===
      reportDateKey
    ) {
      result.datewise1K++;
    }

    if (
      payment15KDateKey ===
      reportDateKey
    ) {
      result.paid15K++;
    }

    if (
      payment75KDateKey ===
      reportDateKey
    ) {
      result.paid75K++;
    }

    if (
      hostelTokenDateKey ===
      reportDateKey
    ) {
      result.hostelToken++;
    }
  }

  const output = [[
    'Source',
    'Lead Count',
    'Daywise - 1K',
    'Datewise - 1K',
    '15K',
    '75K',
    'Hostel Token'
  ]];

  const totals = {
    leadCount: 0,
    daywise1K: 0,
    datewise1K: 0,
    paid15K: 0,
    paid75K: 0,
    hostelToken: 0
  };

  sourceNames.forEach(function (sourceName) {
    const result =
      resultBySource[
        normalizeText_(sourceName)
      ];

    output.push([
      result.source,
      result.leadCount,
      result.daywise1K,
      result.datewise1K,
      result.paid15K,
      result.paid75K,
      result.hostelToken
    ]);

    totals.leadCount +=
      result.leadCount;

    totals.daywise1K +=
      result.daywise1K;

    totals.datewise1K +=
      result.datewise1K;

    totals.paid15K +=
      result.paid15K;

    totals.paid75K +=
      result.paid75K;

    totals.hostelToken +=
      result.hostelToken;
  });

  output.push([
    'Total',
    totals.leadCount,
    totals.daywise1K,
    totals.datewise1K,
    totals.paid15K,
    totals.paid75K,
    totals.hostelToken
  ]);

  return {
    title:
      'Source-wise Lead Journey',

    reportDate:
      formatReportDate_(
        reportDate,
        config.timezone
      ),

    rows: output
  };
}


/**
 * Converts dates into yyyy-MM-dd.
 *
 * Handles:
 * - Google Sheets Date objects
 * - dd/MM/yyyy
 * - dd-MM-yyyy
 * - 13-Jul-2026
 */
function dashboardDateKey_(
  value,
  timezone
) {
  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return '';
  }

  if (
    Object.prototype.toString.call(value) ===
      '[object Date]' &&
    !isNaN(value.getTime())
  ) {
    return Utilities.formatDate(
      value,
      timezone,
      'yyyy-MM-dd'
    );
  }

  const text =
    String(value).trim();

  /*
   * UK numeric date.
   */
  let match = text.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
  );

  if (match) {
    const parsed = new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
      12,
      0,
      0
    );

    return Utilities.formatDate(
      parsed,
      timezone,
      'yyyy-MM-dd'
    );
  }

  /*
   * Text date such as 13-Jul-2026.
   */
  match = text.match(
    /^(\d{1,2})[\s\-]([A-Za-z]{3,9})[\s\-](\d{4})$/
  );

  if (match) {
    const months = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11
    };

    const monthKey =
      match[2]
        .substring(0, 3)
        .toLowerCase();

    if (
      months[monthKey] !== undefined
    ) {
      const parsed = new Date(
        Number(match[3]),
        months[monthKey],
        Number(match[1]),
        12,
        0,
        0
      );

      return Utilities.formatDate(
        parsed,
        timezone,
        'yyyy-MM-dd'
      );
    }
  }

  return '';
}
