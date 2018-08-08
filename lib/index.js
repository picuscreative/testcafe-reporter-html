/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var fs = require('fs');
var path = require('path');

var dirname = path.dirname(__dirname);

// default values for config
var config = {
  fileName: 'report.html',
  outputPath: '../../'
};

if (process.env.NODE_ENV === 'test') {
  config.outputPath = './';
}

// add values for config from config file tcr-html.config.js
if (fs.existsSync(dirname + '/../../tcr-html.config.js')) {
  var newConfig = require(dirname + '/../../tcr-html.config.js');
  config.fileName = newConfig.fileName ? newConfig.fileName : config.fileName;
  config.outputPath = newConfig.outputPath ? newConfig.outputPath : config.outputPath;
}

exports['default'] = function () {
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
    currentTestNumber: 1,

    reportTaskStart: function reportTaskStart(startTime, userAgents, testCount) {
      this.startTime = startTime;
      this.uaList = userAgents.join(', ');
      this.testCount = testCount;
    },

    reportFixtureStart: function reportFixtureStart(name) {
      this.currentFixtureName = name;
    },

    reportTestDone: function reportTestDone(name, testRunInfo) {
      var hasErr = !!testRunInfo.errs.length;
      var result = hasErr ? 'failed' : 'passed';

      if (testRunInfo.skipped) {
        this.skipped += 1;
      }

      this.compileTestTable(name, testRunInfo, hasErr, result);
      if (hasErr) {
        this.compileErrors(name, testRunInfo);
      }

      this.currentTestNumber += 1;
    },

    compileErrors: function compileErrors(name, testRunInfo) {
      var _this = this;

      var heading = `${this.currentTestNumber}. ${this.currentFixtureName} - ${name}`;

      this.report += this.indentString(`<h4 id="test-${this.currentTestNumber}">${heading}</h4>\n`);
      testRunInfo.errs.forEach(function (error) {
        _this.report += _this.indentString('<pre>');
        _this.report += _this.formatError(error, '');
        _this.report += _this.indentString('</pre>');
      });
    },

    compileTestTable: function compileTestTable(name, testRunInfo, hasErr, result) {
      if (hasErr) {
        this.tableReports += this.indentString('<tr class="danger">\n');
      } else if (testRunInfo.skipped) {
        this.tableReports += this.indentString('<tr class="warning">\n');
      } else {
        this.tableReports += this.indentString('<tr class="success">\n');
      }

      // Number
      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.currentTestNumber;
      this.tableReports += '</td>\n';

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

      // Duration
      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.moment.duration(testRunInfo.durationMs).format('h[h] mm[m] ss[s]');
      this.tableReports += '</td>\n';
      // Result
      this.tableReports += this.indentString('<td>', 2);
      if (testRunInfo.skipped) {
        this.tableReports += 'skipped';
      } else if (result === 'failed') {
        this.tableReports += `<a href="#test-${this.currentTestNumber}">failed</a>`;
      } else {
        this.tableReports += result;
      }

      this.tableReports += '</td>\n';

      this.tableReports += this.indentString('</tr>\n');
    },

    reportTaskDone: function reportTaskDone(endTime, passed /* , warnings */) {
      var durationMs = endTime - this.startTime;
      var durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
      var failed = this.testCount - passed;

      // Opening html
      let html = `
      <html lang="en">
        <head>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
          <link rel="stylesheet" href="https://cdn.rawgit.com/drvic10k/bootstrap-sortable/ff650fd1/Contents/bootstrap-sortable.css">
          <script
                  src="https://code.jquery.com/jquery-3.3.1.min.js"
                  integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
                  crossorigin="anonymous"></script>
          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
          <script src="https://cdn.rawgit.com/drvic10k/bootstrap-sortable/ff650fd1/Scripts/bootstrap-sortable.js"></script>
          <script src="https://cdn.rawgit.com/drvic10k/bootstrap-sortable/ff650fd1/Scripts/moment.min.js"></script>
        </head>
        <body>
          <div class="container">
      `;

      // Now add a summary
      html += `
            <h1 class="text-primary">TestCafe Test Summary</h1>
            <br>
            <div class="client-logo" style="padding:15px"></div>
            <div class="bg-primary" style="padding:15px">
              <h3>Summary</h3><br>
              <p class="lead">Start Time: ${this.startTime}</p>
              <p class="lead">Browsers: ${this.uaList}</p>
              <p class="lead">Duration: ${durationStr}</p>
              <p class="lead">Tests Failed: ${failed} out of ${this.testCount}</p>
              <p class="lead">Tests Skipped: ${this.skipped}</p>
            </div><br>
      `;

      // Summary table
      html += `
            <table class="table sortable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fixture</th>
                  <th>Test Name</th>
                  <th>Browsers</th>
                  <th>Duration</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
               ${this.tableReports}
              </tbody>
            </table>
            <br><br>
      `;

      // Error details
      html += `
            <h3>Error Details</h3>
            <br>
            ${this.report}
      `;

      // closing html
      html += `
          </div>
        </body>
      </html>
      `;

      this.write(html);

      try {
        fs.writeFileSync(config.outputPath + '/' + config.fileName, html);
      } catch (e) {
        console.log('Cannot write file ', e);
      }
    }
  };
};

module.exports = exports['default'];
