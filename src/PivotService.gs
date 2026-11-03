/**
 * Builds the two pivot-style reports using
 * the shared Application Fee Paid data.
 *
 * 1. Exam Date-wise Journey
 * 2. 75K Paid Date Wise
 */
function buildPivotReport(
  config,
  feeData
) {
  const data =
    resolveFeeData_(
      config,
      feeData
    );

  return {
    title: 'Journey Reports',

    examDateRows:
      buildExamDatePivot_(
        data.rows,
        data.headerMap,
        config.timezone
      ),

    tuitionBatchRows:
      buildTuitionBatchPivot_(
        data.rows,
        data.headerMap
      )
  };
}


/**
 * Builds Exam Date-wise Journey.
 */
function buildExamDatePivot_(
  rows,
  map,
  timezone
) {
  const applicationNoIndex =
    findHeaderIndex_(
      map,
      ['Application No'],
      true
    );

  const examDateIndex =
    findHeaderIndex_(
      map,
      ['Exam Date'],
      true
    );

  const interviewIndex =
    findHeaderIndex_(
      map,
      ['Interview'],
      true
    );

  const finalStatusIndex =
    findHeaderIndex_(
      map,
      ['Final Status'],
      true
    );

  const payment15KIndex =
    findHeaderIndex_(
      map,
      ['15K Payment Date'],
      true
    );

  const payment75KIndex =
    findHeaderIndex_(
      map,
      ['75K Payment Date'],
      true
    );

  const hostelPaidDateIndex =
    findHeaderIndex_(
      map,
      [
        'Hostel Token Amount Paid date',
        'Hostel Token Amount Paid Date'
      ],
      true
    );

  const groups = {};

  const grandTotal = [
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];

  rows.forEach(function (row) {
    if (
      !hasValue_(
        row[applicationNoIndex]
      )
    ) {
      return;
    }

    const examDate =
      row[examDateIndex];

    const dateKey =
      pivotDateKey_(
        examDate,
        timezone
      );

    const groupKey =
      dateKey || '__BLANK__';

    if (!groups[groupKey]) {
      groups[groupKey] = {
        key: groupKey,

        sortValue:
          dateKey || '',

        label:
          dateKey
            ? formatPivotDate_(
                examDate,
                timezone
              )
            : '',

        counts: [
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ]
      };
    }

    const counts =
      groups[groupKey].counts;

    /*
     * Application No
     */
    counts[0]++;
    grandTotal[0]++;

    /*
     * Exam Date
     */
    if (
      hasValue_(
        row[examDateIndex]
      )
    ) {
      counts[1]++;
      grandTotal[1]++;
    }

    /*
     * Interview
     */
    if (
      hasValue_(
        row[interviewIndex]
      )
    ) {
      counts[2]++;
      grandTotal[2]++;
    }

    /*
     * Final Status
     */
    if (
      hasValue_(
        row[finalStatusIndex]
      )
    ) {
      counts[3]++;
      grandTotal[3]++;
    }

    /*
     * 15K Payment Date
     */
    if (
      hasValue_(
        row[payment15KIndex]
      )
    ) {
      counts[4]++;
      grandTotal[4]++;
    }

    /*
     * 75K Payment Date
     */
    if (
      hasValue_(
        row[payment75KIndex]
      )
    ) {
      counts[5]++;
      grandTotal[5]++;
    }

    /*
     * Hostel Token Paid Date
     */
    if (
      hasValue_(
        row[hostelPaidDateIndex]
      )
    ) {
      counts[6]++;
      grandTotal[6]++;
    }
  });

  const sortedGroups =
    Object.keys(groups)
      .map(function (key) {
        return groups[key];
      })
      .sort(function (a, b) {
        if (
          a.key === '__BLANK__'
        ) {
          return -1;
        }

        if (
          b.key === '__BLANK__'
        ) {
          return 1;
        }

        return a.sortValue
          .localeCompare(
            b.sortValue
          );
      });

  const output = [[
    'Exam Date',
    'COUNTA of Application No',
    'COUNTA of Exam Date',
    'COUNTA of Interview',
    'COUNTA of Final Status',
    'COUNTA of 15K Payment Date',
    'COUNTA of 75K Payment Date',
    'COUNTA of Hostel Token Amount Paid date'
  ]];

  sortedGroups.forEach(function (group) {
    output.push([
      group.label,
      group.counts[0],
      group.counts[1],
      group.counts[2],
      group.counts[3],
      group.counts[4],
      group.counts[5],
      group.counts[6]
    ]);
  });

  output.push([
    'Grand Total',
    grandTotal[0],
    grandTotal[1],
    grandTotal[2],
    grandTotal[3],
    grandTotal[4],
    grandTotal[5],
    grandTotal[6]
  ]);

  return output;
}


/**
 * Creates:
 *
 * Final Tuition Fee
 * Batch 1
 * Batch 2
 * Batch 3
 * Batch 4
 * Grand Total
 *
 * Only rows with a 75K Payment Date are counted.
 */
function buildTuitionBatchPivot_(
  rows,
  map
) {
  const finalTuitionFeeIndex =
    findHeaderIndex_(
      map,
      ['Final Tuition Fee'],
      true
    );

  const batchIndex =
    findHeaderIndex_(
      map,
      [
        'Program Batch',
        'Batch'
      ],
      true
    );

  const payment75KIndex =
    findHeaderIndex_(
      map,
      ['75K Payment Date'],
      true
    );

  const preferredBatches = [
    'Batch 1',
    'Batch 2',
    'Batch 3',
    'Batch 4'
  ];

  const groups = {};
  const extraBatches = [];

  rows.forEach(function (row) {
    if (
      !hasValue_(
        row[payment75KIndex]
      )
    ) {
      return;
    }

    const feeNumber =
      matrixNumber_(
        row[finalTuitionFeeIndex]
      );

    if (feeNumber === null) {
      return;
    }

    const feeKey =
      String(feeNumber);

    const batchName =
      normalizeBatchName_(
        row[batchIndex]
      );

    if (!groups[feeKey]) {
      groups[feeKey] = {
        feeNumber: feeNumber,

        feeDisplay:
          formatReportNumber_(
            feeNumber
          ),

        batches: {},

        total: 0
      };
    }

    groups[feeKey]
      .batches[batchName] =
        (
          groups[feeKey]
            .batches[batchName] ||
          0
        ) + 1;

    groups[feeKey].total++;

    if (
      preferredBatches
        .indexOf(batchName) === -1 &&
      extraBatches
        .indexOf(batchName) === -1
    ) {
      extraBatches.push(
        batchName
      );
    }
  });

  extraBatches.sort();

  const batchColumns =
    preferredBatches.concat(
      extraBatches
    );

  const output = [[
    'Final Tuition Fee'
  ].concat(
    batchColumns
  ).concat([
    'Grand Total'
  ])];

  const grandByBatch = {};
  let overallGrandTotal = 0;

  batchColumns.forEach(function (batch) {
    grandByBatch[batch] = 0;
  });

  Object.keys(groups)
    .map(function (key) {
      return groups[key];
    })
    .sort(function (a, b) {
      return (
        a.feeNumber -
        b.feeNumber
      );
    })
    .forEach(function (group) {
      const outputRow = [
        group.feeDisplay
      ];

      batchColumns.forEach(
        function (batch) {
          const count =
            group.batches[batch] ||
            0;

          outputRow.push(count);

          grandByBatch[batch] +=
            count;
        }
      );

      outputRow.push(
        group.total
      );

      overallGrandTotal +=
        group.total;

      output.push(
        outputRow
      );
    });

  const grandRow = [
    'Grand Total'
  ];

  batchColumns.forEach(function (batch) {
    grandRow.push(
      grandByBatch[batch]
    );
  });

  grandRow.push(
    overallGrandTotal
  );

  output.push(
    grandRow
  );

  return output;
}


/**
 * Standardizes batch labels.
 */
function normalizeBatchName_(value) {
  const normalized =
    normalizeText_(value);

  if (
    normalized === 'batch 1' ||
    normalized === 'batch-1' ||
    normalized === 'batch1'
  ) {
    return 'Batch 1';
  }

  if (
    normalized === 'batch 2' ||
    normalized === 'batch-2' ||
    normalized === 'batch2'
  ) {
    return 'Batch 2';
  }

  if (
    normalized === 'batch 3' ||
    normalized === 'batch-3' ||
    normalized === 'batch3'
  ) {
    return 'Batch 3';
  }

  if (
    normalized === 'batch 4' ||
    normalized === 'batch-4' ||
    normalized === 'batch4'
  ) {
    return 'Batch 4';
  }

  return (
    String(value || '')
      .trim() ||
    'Not Found'
  );
}


function pivotDateKey_(
  value,
  timezone
) {
  return dashboardDateKey_(
    value,
    timezone
  );
}


function formatPivotDate_(
  value,
  timezone
) {
  if (
    Object.prototype.toString.call(value) ===
      '[object Date]' &&
    !isNaN(value.getTime())
  ) {
    return Utilities.formatDate(
      value,
      timezone,
      'd-MMM'
    );
  }

  return String(
    value || ''
  ).trim();
}
