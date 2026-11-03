/**
 * Installs one daily trigger for the Lead Journey report.
 *
 * Example:
 * Send Time = 00:05
 * Trigger runs around 12:05 AM in Asia/Kolkata.
 *
 * Important:
 * Apps Script time triggers may run a few minutes before/after
 * the selected minute. Exact 00:05:00 execution is not guaranteed.
 */
function installDailyTrigger() {
  const config = getConfig();

  // Prevent duplicate daily triggers.
  const removedCount = removeDailyTrigger();

  const parsedTime = parseTriggerTime_(
    config.sendTime,
    config.timezone
  );

  const hour = parsedTime.hour;
  const minute = parsedTime.minute;

  const trigger = ScriptApp
    .newTrigger('runLeadJourneyAutomation')
    .timeBased()
    .everyDays(1)
    .atHour(hour)
    .nearMinute(minute)
    .inTimezone(config.timezone)
    .create();

  writeAutomationLog_({
    status: 'TRIGGER INSTALLED',
    functionName: 'installDailyTrigger',
    reportDate: '',
    recipients: config.recipients.join(', '),
    message:
      'Daily trigger installed near ' +
      formatTriggerTime_(hour, minute) +
      ' (' +
      config.timezone +
      '). Previous triggers removed: ' +
      removedCount +
      '. Trigger ID: ' +
      trigger.getUniqueId(),
    executionSeconds: ''
  });

  showTriggerMessage_(
    'Daily trigger installed successfully.\n\n' +
    'Scheduled time: around ' +
    formatTriggerTime_(hour, minute) +
    '\nTime zone: ' +
    config.timezone +
    '\n\n' +
    'The report date will be Day - 1 when Test Date is blank.'
  );
}


/**
 * Removes all triggers connected to runLeadJourneyAutomation.
 *
 * @return {number} Number of triggers removed.
 */
function removeDailyTrigger() {
  const triggers = ScriptApp.getProjectTriggers();

  let removed = 0;

  triggers.forEach(function (trigger) {
    if (
      trigger.getHandlerFunction() ===
      'runLeadJourneyAutomation'
    ) {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  return removed;
}


/**
 * Manual function to remove the trigger and show confirmation.
 *
 * Use this function from the Apps Script dropdown when you want
 * confirmation after removing the production trigger.
 */
function removeDailyTriggerWithConfirmation() {
  const removedCount = removeDailyTrigger();

  writeAutomationLog_({
    status: 'TRIGGER REMOVED',
    functionName: 'removeDailyTriggerWithConfirmation',
    reportDate: '',
    recipients: '',
    message:
      removedCount +
      ' daily trigger(s) removed.',
    executionSeconds: ''
  });

  showTriggerMessage_(
    removedCount > 0
      ? removedCount +
        ' daily trigger(s) removed successfully.'
      : 'No existing daily trigger was found.'
  );
}


/**
 * Returns information about the currently installed automation triggers.
 *
 * Run checkDailyTriggerStatus from the function dropdown to verify
 * whether the trigger is installed.
 */
function checkDailyTriggerStatus() {
  const triggers = ScriptApp.getProjectTriggers();

  const matchingTriggers = triggers.filter(function (trigger) {
    return (
      trigger.getHandlerFunction() ===
      'runLeadJourneyAutomation'
    );
  });

  if (!matchingTriggers.length) {
    showTriggerMessage_(
      'No daily trigger is currently installed.'
    );

    return;
  }

  const details = matchingTriggers.map(function (
    trigger,
    index
  ) {
    return (
      'Trigger ' +
      (index + 1) +
      '\nFunction: ' +
      trigger.getHandlerFunction() +
      '\nEvent type: ' +
      trigger.getEventType() +
      '\nTrigger ID: ' +
      trigger.getUniqueId()
    );
  });

  showTriggerMessage_(
    matchingTriggers.length +
    ' automation trigger(s) found.\n\n' +
    details.join('\n\n')
  );
}


/**
 * Converts the configured Send Time into hour and minute.
 *
 * Supported values:
 * 00:05
 * 12:05 AM
 * 12:05 PM
 * 5:30
 * A Google Sheets time value represented as a Date object
 */
function parseTriggerTime_(sendTime, timezone) {
  if (
    Object.prototype.toString.call(sendTime) ===
      '[object Date]' &&
    !isNaN(sendTime.getTime())
  ) {
    return {
      hour: Number(
        Utilities.formatDate(
          sendTime,
          timezone || 'Asia/Kolkata',
          'H'
        )
      ),
      minute: Number(
        Utilities.formatDate(
          sendTime,
          timezone || 'Asia/Kolkata',
          'm'
        )
      )
    };
  }

  const rawValue = String(sendTime || '').trim();

  if (!rawValue) {
    throw new Error(
      'Send Time is blank in Automation_Settings.'
    );
  }

  // Supports 24-hour time: 00:05, 12:05, 23:30
  let match = rawValue.match(
    /^(\d{1,2}):(\d{2})$/
  );

  if (match) {
    const hour = Number(match[1]);
    const minute = Number(match[2]);

    validateTriggerTime_(hour, minute, rawValue);

    return {
      hour: hour,
      minute: minute
    };
  }

  // Supports 12-hour time: 12:05 AM, 12:05 PM
  match = rawValue.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (match) {
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3].toUpperCase();

    if (hour < 1 || hour > 12) {
      throw new Error(
        'Invalid 12-hour Send Time: ' + rawValue
      );
    }

    if (period === 'AM') {
      hour = hour === 12 ? 0 : hour;
    } else {
      hour = hour === 12 ? 12 : hour + 12;
    }

    validateTriggerTime_(hour, minute, rawValue);

    return {
      hour: hour,
      minute: minute
    };
  }

  throw new Error(
    'Invalid Send Time: "' +
    rawValue +
    '". Use 24-hour format such as 00:05.'
  );
}


/**
 * Validates the parsed hour and minute.
 */
function validateTriggerTime_(
  hour,
  minute,
  originalValue
) {
  if (
    Number.isNaN(hour) ||
    hour < 0 ||
    hour > 23
  ) {
    throw new Error(
      'Invalid hour in Send Time: ' + originalValue
    );
  }

  if (
    Number.isNaN(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error(
      'Invalid minute in Send Time: ' +
      originalValue
    );
  }
}


/**
 * Formats trigger time in 24-hour format.
 */
function formatTriggerTime_(hour, minute) {
  return (
    String(hour).padStart(2, '0') +
    ':' +
    String(minute).padStart(2, '0')
  );
}


/**
 * Shows a popup when run manually.
 *
 * If UI is unavailable, the message is written to the execution log.
 */
function showTriggerMessage_(message) {
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (error) {
    console.log(message);
  }
}
