/**
 * Builds Day-1 Full Payment Summary using
 * the shared Application Fee Paid data.
 *
 * Output:
 * Date
 * 1st Semester Fee Full Paid
 * 1yr Hostel Fee Full Paid
 */
function buildDailyFullPaidReport(
  config,
  reportDate,
  feeData
) {
  const data =
    resolveFeeData_(
      config,
      feeData
    );

  const rows = data.rows;
  const map = data.headerMap;

  /*
   * 1st Semester columns
   */
  const firstSemesterAmountIndex =
    findHeaderIndex_(
      map,
      [
        '1st Sem',
        '1st Semester Amount'
      ],
      true
    );

  const semesterTxn1DateIndex =
    findHeaderIndex_(
      map,
      ['Sem 1 Txn 1 Date'],
      true
    );

  const semesterTxn2DateIndex =
    findHeaderIndex_(
      map,
      ['Sem 1 Txn 2 Date'],
      true
    );

  const remainingFeeIndex =
    findHeaderIndex_(
      map,
      [
        'Reamining Fee',
        'Remaining Fee'
      ],
      true
    );

  /*
   * Hostel columns
   */
  const totalHostelFeeIndex =
    findHeaderIndex_(
      map,
      [
        'Total Hostel Fee(Including SDA)',
        'Total Hostel Fee (Including SDA)'
      ],
      true
    );

  const hostelTokenPaidDateIndex =
    findHeaderIndex_(
      map,
      [
        'Hostel Token Amount Paid date',
        'Hostel Token Amount Paid Date'
      ],
      true
    );

  const hostelTxn2DateIndex =
    findHeaderIndex_(
      map,
      [
        '2nd Transection Date',
        '2nd Transaction Date',
        '2nd transection Date'
      ],
      true
    );

  const hostelTxn3DateIndex =
    findHeaderIndex_(
      map,
      [
        '3rd Transection Date',
        '3rd Transaction Date',
        '3rd transection Date'
      ],
      true
    );

  const hostelRemainingFeeIndex =
    findHeaderIndex_(
      map,
      ['Hostel Remaining Fee'],
      true
    );

  const reportDateKey =
    dashboardDateKey_(
      reportDate,
      config.timezone
    );

  let semesterFullPaidCount = 0;
  let hostelFullPaidCount = 0;

  rows.forEach(function (row) {
    /*
     * 1st Semester Full Paid.
     */
    const firstSemesterAmount =
      matrixNumber_(
        row[firstSemesterAmountIndex]
      );

    const remainingFee =
      matrixNumber_(
        row[remainingFeeIndex]
      );

    if (
      firstSemesterAmount !== null &&
      remainingFee !== null &&
      remainingFee <= 0
    ) {
      const completionDateKey =
        getLatestDateKey_(
          [
            row[
              semesterTxn1DateIndex
            ],
            row[
              semesterTxn2DateIndex
            ]
          ],
          config.timezone
        );

      if (
        completionDateKey ===
        reportDateKey
      ) {
        semesterFullPaidCount++;
      }
    }

    /*
     * 1-year Hostel Fee Full Paid.
     */
    const totalHostelFee =
      matrixNumber_(
        row[totalHostelFeeIndex]
      );

    const hostelRemainingFee =
      matrixNumber_(
        row[
          hostelRemainingFeeIndex
        ]
      );

    if (
      totalHostelFee !== null &&
      hostelRemainingFee !== null &&
      hostelRemainingFee <= 0
    ) {
      const completionDateKey =
        getLatestDateKey_(
          [
            row[
              hostelTokenPaidDateIndex
            ],
            row[
              hostelTxn2DateIndex
            ],
            row[
              hostelTxn3DateIndex
            ]
          ],
          config.timezone
        );

      if (
        completionDateKey ===
        reportDateKey
      ) {
        hostelFullPaidCount++;
      }
    }
  });

  return {
    title:
      'Daily Full Payment Summary',

    rows: [
      [
        'Date',
        '1st Semester Fee Full Paid',
        '1yr Hostel Fee Full Paid'
      ],
      [
        formatReportDate_(
          reportDate,
          config.timezone
        ),
        semesterFullPaidCount,
        hostelFullPaidCount
      ]
    ]
  };
}


/**
 * Returns the latest valid date as yyyy-MM-dd.
 */
function getLatestDateKey_(
  dateValues,
  timezone
) {
  const validDateKeys =
    dateValues
      .map(function (value) {
        return dashboardDateKey_(
          value,
          timezone
        );
      })
      .filter(Boolean)
      .sort();

  if (!validDateKeys.length) {
    return '';
  }

  return validDateKeys[
    validDateKeys.length - 1
  ];
}
