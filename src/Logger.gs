function ensureLogSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(AUTOMATION.LOG_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTOMATION.LOG_SHEET);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Status',
      'Function',
      'Report Date',
      'Recipients',
      'Message',
      'Execution Seconds'
    ]);

    sheet.getRange('A1:G1')
      .setFontWeight('bold')
      .setBackground('#d9ead3');
  }

  return sheet;
}


function writeAutomationLog_(details) {
  const sheet = ensureLogSheet_();

  sheet.appendRow([
    new Date(),
    details.status || '',
    details.functionName || '',
    details.reportDate || '',
    details.recipients || '',
    details.message || '',
    details.executionSeconds || ''
  ]);
}


function openAutomationLogs() {
  const sheet = ensureLogSheet_();

  SpreadsheetApp
    .getActiveSpreadsheet()
    .setActiveSheet(sheet);
}
