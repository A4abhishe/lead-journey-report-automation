function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(
      'Lead Journey Automation'
    )
    .addItem(
      'Send Report Now',
      'runLeadJourneyAutomation'
    )
    .addItem(
      'Send Test Report',
      'sendTestReport'
    )
    .addSeparator()
    .addItem(
      'Install Daily Trigger',
      'installDailyTrigger'
    )
    .addItem(
      'Remove Daily Trigger',
      'removeDailyTriggerWithConfirmation'
    )
    .addSeparator()
    .addItem(
      'Open Automation Logs',
      'openAutomationLogs'
    )
    .addToUi();
}


/**
 * Main production automation.
 *
 * Performance design:
 * 1. Mastersheet is read only for Dashboard.
 * 2. Application Fee Paid is loaded one time.
 * 3. The same fee data is reused by Matrix, Pivot,
 *    and Daily Full Payment reports.
 */
function runLeadJourneyAutomation() {
  const startTime = new Date();

  let config = null;
  let reportDate = null;

  try {
    config = getConfig();

    reportDate =
      getReportDate_(config);

    /*
     * Dashboard uses Mastersheet.
     */
    const dashboardReport =
      buildDashboardReport(
        config,
        reportDate
      );

    /*
     * Application Fee Paid is loaded ONCE.
     */
    const feeData =
      loadFeeSheetData_(config);

    /*
     * All three services reuse the same feeData object.
     */
    const matrixReport =
      buildMatrixReport(
        config,
        feeData
      );

    const pivotReport =
      buildPivotReport(
        config,
        feeData
      );

    const dailyFullPaidReport =
      buildDailyFullPaidReport(
        config,
        reportDate,
        feeData
      );

    const mailResult =
      sendLeadJourneyEmail_(
        config,
        reportDate,
        dashboardReport,
        matrixReport,
        pivotReport,
        dailyFullPaidReport
      );

    const seconds =
      (
        (new Date() - startTime) /
        1000
      ).toFixed(2);

    writeAutomationLog_({
      status: 'SUCCESS',

      functionName:
        'runLeadJourneyAutomation',

      reportDate:
        formatReportDate_(
          reportDate,
          config.timezone
        ),

      recipients:
        mailResult.recipients,

      message:
        mailResult.subject +
        ' | Fee rows processed: ' +
        feeData.rows.length,

      executionSeconds:
        seconds
    });

    try {
      SpreadsheetApp
        .getActiveSpreadsheet()
        .toast(
          'Report sent successfully in ' +
          seconds +
          ' seconds.',
          'Lead Journey Automation',
          5
        );
    } catch (toastError) {
      console.log(
        'Toast unavailable: ' +
        toastError.message
      );
    }

  } catch (error) {
    const seconds =
      (
        (new Date() - startTime) /
        1000
      ).toFixed(2);

    /*
     * Logging failure must not hide the original error.
     */
    try {
      writeAutomationLog_({
        status: 'FAILED',

        functionName:
          'runLeadJourneyAutomation',

        reportDate:
          config && reportDate
            ? formatReportDate_(
                reportDate,
                config.timezone
              )
            : '',

        recipients:
          config &&
          config.recipients
            ? config.recipients.join(', ')
            : '',

        message:
          error.message +
          '\n' +
          (error.stack || ''),

        executionSeconds:
          seconds
      });

    } catch (logError) {
      console.error(
        'Original error: ' +
        error.message
      );

      console.error(
        'Logging error: ' +
        logError.message
      );
    }

    throw error;
  }
}


/**
 * Uses the Test Date from Automation_Settings
 * when one has been entered.
 */
function sendTestReport() {
  runLeadJourneyAutomation();
}
