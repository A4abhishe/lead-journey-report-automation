/**
 * Sends the final Lead Journey HTML email.
 */
function sendLeadJourneyEmail_(
  config,
  reportDate,
  dashboardReport,
  matrixReport,
  pivotReport,
  dailyFullPaidReport
) {
  if (
    !config.recipients ||
    !config.recipients.length
  ) {
    throw new Error(
      'No recipients configured in Automation_Settings.'
    );
  }

  const mailDate = formatMailDate_(
    reportDate,
    config.timezone
  );

  const subject =
    config.subject +
    ' | ' +
    mailDate;

  const logoResult =
    getBrandLogo_(
      config.logoFileId
    );

  const reportData = {
    mailDate: mailDate,

    brandName: config.brandName,

    brandWebsite: config.brandWebsite,

    dashboard: dashboardReport,

    matrix: matrixReport,

    pivot: pivotReport,

    dailyFullPaid: dailyFullPaidReport,

    spreadsheetUrl:
      SpreadsheetApp
        .getActiveSpreadsheet()
        .getUrl(),

    hasLogo: Boolean(
      logoResult &&
      logoResult.blob
    )
  };

  const htmlBody =
    buildEmailHtml(reportData);

  const plainBody = [
    'Lead Journey Report - ' + mailDate,
    '',
    'This report contains:',
    '1. Source-wise Lead Journey',
    '2. Matrix Count',
    '3. Exam Date-wise Journey',
    '4. 75K Paid Date Wise',
    '5. Daily Full Payment Summary',
    '',
    'Open Google Sheet:',
    reportData.spreadsheetUrl,
    '',
    'Regards,',
    config.brandName,
    'Admissions Automation'
  ].join('\n');

  const emailOptions = {
    htmlBody: htmlBody,

    name:
      config.brandName,

    replyTo:
      Session
        .getActiveUser()
        .getEmail()
  };

  if (
    logoResult &&
    logoResult.blob
  ) {
    emailOptions.inlineImages = {
      brandLogo:
        logoResult.blob
    };
  }

  GmailApp.sendEmail(
    config.recipients.join(','),
    subject,
    plainBody,
    emailOptions
  );

  return {
    recipients:
      config.recipients.join(', '),

    subject: subject,

    logoIncluded: Boolean(
      logoResult &&
      logoResult.blob
    )
  };
}


/**
 * Reads the brand logo from Google Drive.
 */
function getBrandLogo_(logoFileIdOrUrl) {
  const fileId =
    extractGoogleDriveFileId_(
      logoFileIdOrUrl
    );

  if (!fileId) {
    console.log(
      'Logo File ID is blank. Using text-only header.'
    );

    return {
      blob: null
    };
  }

  try {
    const file =
      DriveApp.getFileById(fileId);

    const blob = file
      .getBlob()
      .setName(
        'brand-logo.png'
      );

    return {
      blob: blob,
      fileId: fileId,
      fileName: file.getName()
    };

  } catch (error) {
    console.log(
      'Logo could not be loaded: ' +
      error.message
    );

    return {
      blob: null,
      error: error.message
    };
  }
}


/**
 * Extracts a Google Drive file ID.
 */
function extractGoogleDriveFileId_(value) {
  const text = String(
    value || ''
  ).trim();

  if (!text) {
    return '';
  }

  let match = text.match(
    /\/d\/([a-zA-Z0-9_-]+)/
  );

  if (match) {
    return match[1];
  }

  match = text.match(
    /[?&]id=([a-zA-Z0-9_-]+)/
  );

  if (match) {
    return match[1];
  }

  if (
    /^[a-zA-Z0-9_-]+$/.test(text)
  ) {
    return text;
  }

  return '';
}
