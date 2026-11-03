# Sheet setup

The script expects these tabs. Tab names can be changed in `Automation_Settings`.

## Automation_Settings

Two columns: setting name in column A, value in column B. Names are matched without case or extra spaces.

| Setting | Example | Notes |
| --- | --- | --- |
| Recipients | team@example.com, lead@example.com | Comma, semicolon or new line separated |
| Send Time | 00:05 | 24-hour or `12:05 AM` format |
| Time Zone | Asia/Kolkata | |
| Report Date Offset | 1 | Days back from today (1 = yesterday) |
| Test Date | 10/07/2026 | DD/MM/YYYY. Leave blank in production |
| Subject | Lead Journey Report | Date is appended automatically |
| Dashboard Sheet | Dashboard | |
| Master Sheet | Mastersheet | |
| Fee Sheet | Application Fee Paid | |
| Pivot Sheet | Pivot Table 2 | |
| Brand Name | Your Institute | Shown in header, signature and sender name |
| Brand Website | www.example.com | Shown in the footer |
| Full Hostel Fee | 192000 | Total Amount Paid value that counts as Full Hostel Paid |
| Logo File ID | (Drive file ID) | Optional PNG logo; text header is used when blank |

## Automation_Logs

Created automatically on the first run with these columns:

`Timestamp · Status · Function · Report Date · Recipients · Message · Execution Seconds`

## Dashboard

- `B2`: report date (written by the script).
- `A4:A23`: lead source names, one per row (for example Facebook, Google Ads, Organic, Referral).

## Mastersheet

One row per lead, header in row 1. Columns read by position:

| Column | Field |
| --- | --- |
| P | Lead source (must match a Dashboard source name) |
| X | Registration date |
| Y | 1K payment date |
| Z | 15K payment date |
| AA | 75K payment date |
| AB | Hostel token date |

## Application Fee Paid

One row per applicant. Columns are found by **header name**, so order does not matter.

Registered Name, Application No, Stage, Exam Date, Interview, Final Status, 15K Payment Date, 75K Payment Date, Hostel Token Amount Paid date, Refund & Drop, Refund (Formula), Remaining Fee, Semester Status, Total Amount Paid, Final Tuition Fee, Program Batch, 1st Sem, Sem 1 Txn 1 Date, Sem 1 Txn 2 Date, Total Hostel Fee (Including SDA), 2nd Transaction Date, 3rd Transaction Date, Hostel Remaining Fee.

Dates may be real date cells or text in `dd/MM/yyyy`, `dd-MM-yyyy` or `13-Jul-2026` format.
