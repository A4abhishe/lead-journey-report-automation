function normalizeText_(value) {
  return String(value == null ? '' : value)
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}


function requireSheet_(sheetName) {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found.`);
  }

  return sheet;
}


function getReportDate_(config) {
  if (config.testDate) {
    return parseUkDate_(config.testDate);
  }

  const date = new Date();

  date.setHours(12, 0, 0, 0);
  date.setDate(
    date.getDate() - Number(config.reportDateOffset || 1)
  );

  return date;
}


function parseUkDate_(value) {
  if (
    Object.prototype.toString.call(value) === '[object Date]' &&
    !isNaN(value.getTime())
  ) {
    return value;
  }

  const text = String(value || '').trim();

  const match = text.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
  );

  if (!match) {
    throw new Error(
      'Test Date must be in DD/MM/YYYY format. Example: 10/07/2026'
    );
  }

  return new Date(
    Number(match[3]),
    Number(match[2]) - 1,
    Number(match[1]),
    12,
    0,
    0
  );
}


function formatReportDate_(date, timezone) {
  return Utilities.formatDate(
    date,
    timezone,
    'dd/MM/yyyy'
  );
}


function formatMailDate_(date, timezone) {
  return Utilities.formatDate(
    date,
    timezone,
    'dd-MMM-yyyy'
  );
}


function buildHeaderMap_(headers) {
  const map = {};

  headers.forEach(function (header, index) {
    const normalized = normalizeText_(header);

    if (normalized && map[normalized] === undefined) {
      map[normalized] = index;
    }
  });

  return map;
}


function findHeaderIndex_(headerMap, possibleHeaders, required) {
  for (let i = 0; i < possibleHeaders.length; i++) {
    const key = normalizeText_(possibleHeaders[i]);

    if (headerMap[key] !== undefined) {
      return headerMap[key];
    }
  }

  if (required !== false) {
    throw new Error(
      `Required column not found: ${possibleHeaders.join(' / ')}`
    );
  }

  return -1;
}


function hasValue_(value) {
  return value !== '' &&
    value !== null &&
    value !== undefined;
}


function textEquals_(value, expected) {
  return normalizeText_(value) === normalizeText_(expected);
}


function escapeHtml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


function trimEmptyRows_(data) {
  const output = data.slice();

  while (
    output.length &&
    output[output.length - 1].every(function (cell) {
      return !hasValue_(cell);
    })
  ) {
    output.pop();
  }

  return output;
}


function trimEmptyColumns_(data) {
  if (!data.length) {
    return data;
  }

  let lastUsedColumn = -1;

  data.forEach(function (row) {
    row.forEach(function (cell, index) {
      if (hasValue_(cell)) {
        lastUsedColumn = Math.max(lastUsedColumn, index);
      }
    });
  });

  if (lastUsedColumn < 0) {
    return [];
  }

  return data.map(function (row) {
    return row.slice(0, lastUsedColumn + 1);
  });
}


function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}
