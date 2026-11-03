function buildEmailHtml(
  reportData
) {
  const template =
    HtmlService
      .createTemplateFromFile(
        'Email'
      );

  template.report =
    reportData;

  return template
    .evaluate()
    .getContent();
}


function tableToHtml_(
  rows,
  options
) {
  options = options || {};

  if (
    !rows ||
    !rows.length
  ) {
    return (
      '<p class="empty">' +
      'No data available.' +
      '</p>'
    );
  }

  const headerRows =
    Number(
      options.headerRows || 1
    );

  const tableClass =
    String(
      options.tableClass || ''
    ).trim();

  const classAttribute =
    tableClass
      ? ' class="' +
        escapeHtml_(tableClass) +
        '"'
      : '';

  let html =
    '<div class="table-wrap">' +
    '<table' +
    classAttribute +
    '>';

  rows.forEach(function (
    row,
    rowIndex
  ) {
    const firstCell =
      normalizeText_(row[0]);

    const isTotal =
      firstCell === 'total' ||
      firstCell === 'grand total';

    html += isTotal
      ? '<tr class="total-row">'
      : '<tr>';

    row.forEach(function (cell) {
      const tag =
        rowIndex < headerRows
          ? 'th'
          : 'td';

      html +=
        '<' +
        tag +
        '>' +
        escapeHtml_(cell) +
        '</' +
        tag +
        '>';
    });

    html += '</tr>';
  });

  html +=
    '</table>' +
    '</div>';

  return html;
}
