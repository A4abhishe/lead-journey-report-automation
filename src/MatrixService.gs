/**
 * Builds Matrix Count from the already loaded
 * Application Fee Paid data.
 *
 * Performance:
 * Application Fee Paid data is loaded once in Code.gs
 * and passed through feeData.
 */
function buildMatrixReport(
  config,
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
   * Required column indexes
   */

  const registeredNameIndex =
    findHeaderIndex_(
      map,
      ['Registered Name'],
      true
    );

  const stageIndex =
    findHeaderIndex_(
      map,
      ['Stage'],
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

  const refundDropIndex =
    findHeaderIndex_(
      map,
      ['Refund & Drop'],
      false
    );

  const refundFormulaIndex =
    findHeaderIndex_(
      map,
      ['Refund (Formula)'],
      false
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

  const semesterStatusIndex =
    findHeaderIndex_(
      map,
      ['Semester Status'],
      true
    );

  /*
   * Header name = Total Amount Paid
   *
   * Full Hostel Paid condition:
   * Total Amount Paid must equal config.fullHostelFee
   * (Full Hostel Fee in Automation_Settings).
   */
  const totalAmountPaidIndex =
    findHeaderIndex_(
      map,
      ['Total Amount Paid'],
      true
    );

  /*
   * Matrix counters
   */
  const counts = {
    applicationFee: 0,
    testDone: 0,
    interviewDone: 0,
    offerLetterShared: 0,
    paid15K: 0,
    paid75K: 0,
    hostelToken: 0,
    paid75KNotPaidAndHostelPaid: 0,
    refund15KAndDrop: 0,
    refund75K: 0,
    firstSemesterFullPaid: 0,
    partiallyPaid: 0,
    fullHostelPaid: 0
  };

  /*
   * Process every Application Fee Paid row.
   */
  rows.forEach(function (row) {
    /*
     * Application Fee
     */
    if (
      hasValue_(
        row[registeredNameIndex]
      )
    ) {
      counts.applicationFee++;
    }

    /*
     * Test Done
     */
    if (
      textEquals_(
        row[stageIndex],
        'Exam Done'
      )
    ) {
      counts.testDone++;
    }

    /*
     * Interview Done
     */
    if (
      textEquals_(
        row[interviewIndex],
        'Interview done'
      )
    ) {
      counts.interviewDone++;
    }

    /*
     * Offer Letter Shared
     */
    if (
      hasValue_(
        row[finalStatusIndex]
      )
    ) {
      counts.offerLetterShared++;
    }

    /*
     * 15K Paid
     */
    if (
      hasValue_(
        row[payment15KIndex]
      )
    ) {
      counts.paid15K++;
    }

    /*
     * 75K Paid
     */
    if (
      hasValue_(
        row[payment75KIndex]
      )
    ) {
      counts.paid75K++;
    }

    /*
     * Hostel Token
     */
    if (
      hasValue_(
        row[hostelPaidDateIndex]
      )
    ) {
      counts.hostelToken++;
    }

    /*
     * 75K Not Paid but Hostel Token Paid
     */
    if (
      !hasValue_(
        row[payment75KIndex]
      ) &&
      hasValue_(
        row[hostelPaidDateIndex]
      )
    ) {
      counts
        .paid75KNotPaidAndHostelPaid++;
    }

    /*
     * Refund values may be available in:
     *
     * Refund & Drop
     * Refund (Formula)
     */
    const refundDropValue =
      refundDropIndex >= 0
        ? normalizeText_(
            row[refundDropIndex]
          )
        : '';

    const refundFormulaValue =
      refundFormulaIndex >= 0
        ? normalizeText_(
            row[refundFormulaIndex]
          )
        : '';

    /*
     * 15K Refund & Drop
     *
     * Count the row only once, even when
     * both refund columns contain Refund.
     */
    if (
      refundDropValue === 'refund' ||
      refundFormulaValue === 'refund'
    ) {
      counts.refund15KAndDrop++;
    }

    /*
     * 75K Refund
     */
    if (
      refundDropValue === '75k refund' ||
      refundDropValue === '75 k refund' ||
      refundFormulaValue === '75k refund' ||
      refundFormulaValue === '75 k refund'
    ) {
      counts.refund75K++;
    }

    /*
     * 1st Semester Full Paid
     */
    const remainingFee =
      matrixNumber_(
        row[remainingFeeIndex]
      );

    if (
      remainingFee !== null &&
      remainingFee <= 0
    ) {
      counts.firstSemesterFullPaid++;
    }

    /*
     * Partially Paid
     */
    if (
      textEquals_(
        row[semesterStatusIndex],
        'Partially Paid'
      )
    ) {
      counts.partiallyPaid++;
    }

    /*
     * Full Hostel Paid
     *
     * Valid values supported:
     * 192000
     * 192,000
     * ₹192,000
     *
     * matrixNumber_ converts all of them
     * into a plain number before comparing.
     */
    const totalAmountPaid =
      matrixNumber_(
        row[totalAmountPaidIndex]
      );

    if (
      totalAmountPaid ===
      config.fullHostelFee
    ) {
      counts.fullHostelPaid++;
    }
  });

  /*
   * Final Matrix output
   */
  return {
    title: 'Matrix Count',

    rows: [
      [
        'Matrix',
        'Count'
      ],
      [
        'Application Fee',
        counts.applicationFee
      ],
      [
        'Test Done',
        counts.testDone
      ],
      [
        'Interview Done',
        counts.interviewDone
      ],
      [
        'Offer Letter Shared',
        counts.offerLetterShared
      ],
      [
        '15K Paid',
        counts.paid15K
      ],
      [
        '75K Paid',
        counts.paid75K
      ],
      [
        'Hostel Token',
        counts.hostelToken
      ],
      [
        '75K NP & HT Paid',
        counts
          .paid75KNotPaidAndHostelPaid
      ],
      [
        '15K Refund & Drop',
        counts.refund15KAndDrop
      ],
      [
        '75K Refund',
        counts.refund75K
      ],
      [
        '1st Sem Full Paid',
        counts.firstSemesterFullPaid
      ],
      [
        'Partially Paid',
        counts.partiallyPaid
      ],
      [
        'Full Hostel Paid',
        counts.fullHostelPaid
      ]
    ]
  };
}


/**
 * Converts sheet numbers or formatted currency
 * text into a JavaScript number.
 *
 * Examples:
 *
 * 192000      → 192000
 * 192,000     → 192000
 * ₹192,000    → 192000
 * blank       → null
 */
function matrixNumber_(value) {
  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value === 'number'
  ) {
    return isNaN(value)
      ? null
      : value;
  }

  const cleaned =
    String(value)
      .replace(/,/g, '')
      .replace(/[₹\s]/g, '')
      .trim();

  if (!cleaned) {
    return null;
  }

  const number =
    Number(cleaned);

  return isNaN(number)
    ? null
    : number;
}
