const assert = require('assert');
const normalizeNewline = require('normalize-newline');
const read = require('read-file-relative').readSync;
const createReport = require('./utils/create-report');

it('Should produce report with colors', () => {
  let report = createReport(true);
  let expected = read('./data/report-with-colors.html');

  report = normalizeNewline(report).trim();
  expected = normalizeNewline(expected).trim();

  assert.strictEqual(report, expected);
});

it('Should produce report without colors', () => {
  let report = createReport(false);
  let expected = read('./data/report-without-colors');

  report = normalizeNewline(report).trim();
  expected = normalizeNewline(expected).trim();

  assert.strictEqual(report, expected);
});
