const assert = require('assert');
const { JSDOM } = require('jsdom');
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

describe('Multi-line test name columns', () => {
  it('Should have "test-name" class set', () => {
    const report = createReport(true);

    const reportDOM = new JSDOM(report);

    const columns = reportDOM.window.document.querySelectorAll('table tbody tr td:nth-child(3)');

    columns.forEach((column) => {
      assert.strict(column.classList.value, 'test-name');
    });
  });

  it('Should have style "white-space: pre;" set', () => {
    const report = createReport(true);

    const reportDOM = new JSDOM(report);

    const columns = reportDOM.window.document.querySelectorAll('table tbody tr td:nth-child(3)');

    columns.forEach((column) => {
      assert.strict(reportDOM.window.getComputedStyle(column).whiteSpace, 'pre');
    });
  });
});
