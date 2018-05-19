/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

const fs = require('fs');
const path = require('path');

const dirname = path.dirname(__dirname);

// default values for config
const config = {
  fileName: 'report.html',
  outputPath: dirname,
};

// add values for config from config file tcr-html.config.js
if (fs.existsSync(`${dirname}/tcr-html.config.js`)) {
  const newConfig = require(`${dirname}/tcr-html.config.js`);
  config.fileName = newConfig.fileName ? newConfig.fileName : config.fileName;
  config.outputPath = newConfig.outputPath ? newConfig.outputPath : config.outputPath;
}

export default function () {
  return {
    noColors: true,
    startTime: null,
    afterErrList: false,
    uaList: null,
    report: '',
    table: '',
    tableReports: '',
    testCount: 0,
    skipped: 0,

    reportTaskStart(startTime, userAgents, testCount) {
      this.startTime = startTime;
      this.uaList = userAgents.join(', ');
      this.testCount = testCount;
    },

    reportFixtureStart(name) {
      this.currentFixtureName = name;
    },

    reportTestDone(name, testRunInfo) {
      const hasErr = !!testRunInfo.errs.length;
      const result = hasErr ? 'failed' : 'passed';

      if (testRunInfo.skipped) { this.skipped += 1; }

      this.compileTestTable(name, testRunInfo, hasErr, result);
      if (hasErr) { this.compileErrors(name, testRunInfo); }
    },

    compileErrors(name, testRunInfo) {
      const heading = `${this.currentFixtureName} - ${name}`;

      this.report += this.indentString(`<h4>${heading}</h4>\n`);
      testRunInfo.errs.forEach((error) => {
        this.report += this.indentString('<pre>');
        this.report += this.formatError(error, '');
        this.report += this.indentString('</pre>');
      });
    },

    compileTestTable(name, testRunInfo, hasErr, result) {
      if (hasErr) { this.tableReports += this.indentString('<tr class="danger">\n'); } else if (testRunInfo.skipped) { this.tableReports += this.indentString('<tr class="warning">\n'); } else { this.tableReports += this.indentString('<tr class="success">\n'); }

      // Fixture
      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.currentFixtureName;
      this.tableReports += '</td>\n';
      // Test
      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += name;
      this.tableReports += '</td>\n';
      // Browsers
      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.uaList;
      this.tableReports += '</td>\n';
      // TestCount
      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.testCount;
      this.tableReports += '</td>\n';
      // Duration
      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.moment.duration(testRunInfo.durationMs).format('h[h] mm[m] ss[s]');
      this.tableReports += '</td>\n';
      // Result
      this.tableReports += this.indentString('<td>', 2);
      if (testRunInfo.skipped) { this.tableReports += 'skipped'; } else { this.tableReports += result; }

      this.tableReports += '</td>\n';

      this.tableReports += this.indentString('</tr>\n');
    },

    reportTaskDone(endTime, passed/* , warnings */) {
      const durationMs = endTime - this.startTime;
      const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
      const failed = this.testCount - passed;

      // Opening html
      let html = '<html lang="en">';
      html += '<head>';
      html += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">';
      html += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">';
      html += '</head>';
      html += '<body>';
      html += '<div class="container">';

      // Now add a summary
      html += '<h1 class="text-primary">TestCafe Test Summary</h1>';
      html += '<br>';
      html += '<div class="client-logo" style="padding:15px"></div>';
      html += '<div class="bg-primary" style="padding:15px">';
      html += '<h3>Summary</h3><br>';
      html += `<p class="lead">Start Time: ${this.startTime}</p>`;
      html += `<p class="lead">Browsers: ${this.uaList}</p>`;
      html += `<p class="lead">Duration: ${durationStr}</p>`;
      html += `<p class="lead">Tests Failed: ${failed} out of ${this.testCount}</p>`;
      html += `<p class="lead">Tests Skipped: ${this.skipped}</p>`;
      html += '</div><br>';

      // Summary table
      html += '<table class="table ">';
      html += '<tr>';
      html += '<th>Fixture</th>';
      html += '<th>Test Name</th>';
      html += '<th>Browsers</th>';
      html += '<th>Test Count</th>';
      html += '<th>Duration</th>';
      html += '<th>Result</th>';
      html += '</tr>';
      html += this.tableReports;
      html += '</table>';
      html += '<br><br>';

      // Error details
      html += '<h3>Error Details</h3><br>';
      html += this.report;

      // closing html
      html += '</div></body></html>';

      this.write(html);

      try {
        fs.writeFileSync(`${config.outputPath}/${config.fileName}`, html);
      } catch (e) {
        console.log('Cannot write file ', e);
      }
    },
  };
}
