const AUTOMATION = Object.freeze({
  SETTINGS_SHEET: 'Automation_Settings',
  LOG_SHEET: 'Automation_Logs',

  DEFAULTS: {
    TIME_ZONE: 'Asia/Kolkata',
    SEND_TIME: '00:05',
    DASHBOARD_SHEET: 'Dashboard',
    MASTER_SHEET: 'Mastersheet',
    FEE_SHEET: 'Application Fee Paid',
    PIVOT_SHEET: 'Pivot Table 2',
    REPORT_DATE_OFFSET: 1,
    SUBJECT: 'Lead Journey Report',

    RECIPIENTS: [
      'team@example.com'
    ],

    BRAND_NAME: 'Your Institute',
    BRAND_WEBSITE: 'www.example.com',

    /*
     * Total Amount Paid value that marks
     * a student as Full Hostel Paid.
     */
    FULL_HOSTEL_FEE: 192000,

    LOGO_FILE_ID: ''
  }
});


/**
 * Reads all automation settings from Automation_Settings.
 */
function getConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheet = ss.getSheetByName(
    AUTOMATION.SETTINGS_SHEET
  );

  if (!sheet) {
    throw new Error(
      'Sheet "' +
      AUTOMATION.SETTINGS_SHEET +
      '" not found.'
    );
  }

  const lastRow = Math.max(
    sheet.getLastRow(),
    1
  );

  /*
   * getValues() is required so that:
   * - Send Time can be read as a Date/time value
   * - Test Date can be read as a real date
   */
  const values = sheet
    .getRange(1, 1, lastRow, 2)
    .getValues();

  const settings = {};

  values.forEach(function (row) {
    const key = normalizeText_(row[0]);

    if (key) {
      settings[key] = row[1];
    }
  });

  const recipientsValue =
    getSetting_(
      settings,
      'Recipients'
    ) ||
    AUTOMATION.DEFAULTS.RECIPIENTS.join(',');

  const recipients = String(recipientsValue)
    .split(/[,;\n]/)
    .map(function (email) {
      return email.trim();
    })
    .filter(Boolean);

  return {
    spreadsheetId: ss.getId(),

    spreadsheetUrl: ss.getUrl(),

    timezone:
      getSetting_(
        settings,
        'Time Zone'
      ) ||
      AUTOMATION.DEFAULTS.TIME_ZONE,

    sendTime:
      getSetting_(
        settings,
        'Send Time'
      ) ||
      AUTOMATION.DEFAULTS.SEND_TIME,

    dashboardSheet:
      getSetting_(
        settings,
        'Dashboard Sheet'
      ) ||
      AUTOMATION.DEFAULTS.DASHBOARD_SHEET,

    masterSheet:
      getSetting_(
        settings,
        'Master Sheet'
      ) ||
      AUTOMATION.DEFAULTS.MASTER_SHEET,

    feeSheet:
      getSetting_(
        settings,
        'Fee Sheet'
      ) ||
      AUTOMATION.DEFAULTS.FEE_SHEET,

    pivotSheet:
      getSetting_(
        settings,
        'Pivot Sheet'
      ) ||
      AUTOMATION.DEFAULTS.PIVOT_SHEET,

    reportDateOffset:
      Number(
        getSetting_(
          settings,
          'Report Date Offset'
        ) ||
        AUTOMATION.DEFAULTS.REPORT_DATE_OFFSET
      ),

    recipients: recipients,

    subject:
      getSetting_(
        settings,
        'Subject'
      ) ||
      AUTOMATION.DEFAULTS.SUBJECT,

    testDate:
      getSetting_(
        settings,
        'Test Date'
      ) || '',

    brandName:
      getSetting_(
        settings,
        'Brand Name'
      ) ||
      AUTOMATION.DEFAULTS.BRAND_NAME,

    brandWebsite:
      getSetting_(
        settings,
        'Brand Website'
      ) ||
      AUTOMATION.DEFAULTS.BRAND_WEBSITE,

    fullHostelFee:
      Number(
        getSetting_(
          settings,
          'Full Hostel Fee'
        ) ||
        AUTOMATION.DEFAULTS.FULL_HOSTEL_FEE
      ),

    logoFileId:
      getSetting_(
        settings,
        'Logo File ID'
      ) ||
      AUTOMATION.DEFAULTS.LOGO_FILE_ID
  };
}


/**
 * Returns a setting using normalized key matching.
 */
function getSetting_(settings, key) {
  return settings[
    normalizeText_(key)
  ];
}
