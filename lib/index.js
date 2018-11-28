"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

/* eslint global-require: 0 */

/* eslint import/no-dynamic-require: 0 */
var fs = require('fs');

var path = require('path');

var dirname = path.dirname(__dirname); // default values for config

var config = {
  fileName: 'report.html',
  outputPath: '../../'
};

if (process.env.NODE_ENV === 'test') {
  config.outputPath = './';
} // add values for config from config file tcr-html.config.js


if (fs.existsSync("".concat(dirname, "/../../tcr-html.config.js"))) {
  var newConfig = require("".concat(dirname, "/../../tcr-html.config.js"));

  config.fileName = newConfig.fileName ? newConfig.fileName : config.fileName;
  config.outputPath = newConfig.outputPath ? newConfig.outputPath : config.outputPath;
}

function _default() {
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

      var heading = "".concat(this.currentTestNumber, ". ").concat(this.currentFixtureName, " - ").concat(name);
      this.report += this.indentString("<h4 id=\"test-".concat(this.currentTestNumber, "\">").concat(heading, "</h4>\n"));
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
      } // Number


      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.currentTestNumber;
      this.tableReports += '</td>\n'; // Fixture

      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.currentFixtureName;
      this.tableReports += '</td>\n'; // Test

      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += name;
      this.tableReports += '</td>\n'; // Browsers

      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.uaList;
      this.tableReports += '</td>\n'; // Duration

      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.moment.duration(testRunInfo.durationMs).format('h[h] mm[m] ss[s]');
      this.tableReports += '</td>\n'; // Result

      this.tableReports += this.indentString('<td>', 2);

      if (testRunInfo.skipped) {
        this.tableReports += 'skipped';
      } else if (result === 'failed') {
        this.tableReports += "<a href=\"#test-".concat(this.currentTestNumber, "\">failed</a>");
      } else {
        this.tableReports += result;
      }

      this.tableReports += '</td>\n';
      this.tableReports += this.indentString('</tr>\n');
    },
    reportTaskDone: function reportTaskDone(endTime, passed
    /* , warnings */
    ) {
      var durationMs = endTime - this.startTime;
      var durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
      var failed = this.testCount - passed; // Opening html

      var html = "\n      <html lang=\"en\">\n        <head>\n          <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">\n          <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css\" integrity=\"sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp\" crossorigin=\"anonymous\">\n          <link rel=\"stylesheet\" href=\"https://cdn.rawgit.com/drvic10k/bootstrap-sortable/ff650fd1/Contents/bootstrap-sortable.css\">\n          <script\n                  src=\"https://code.jquery.com/jquery-3.3.1.min.js\"\n                  integrity=\"sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=\"\n                  crossorigin=\"anonymous\"></script>\n          <script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>\n          <script src=\"https://cdn.rawgit.com/drvic10k/bootstrap-sortable/ff650fd1/Scripts/bootstrap-sortable.js\"></script>\n          <script src=\"https://cdn.rawgit.com/drvic10k/bootstrap-sortable/ff650fd1/Scripts/moment.min.js\"></script>\n        </head>\n        <body>\n          <div class=\"container\">\n      "; // Now add a summary

      html += "\n            <h1 class=\"text-primary\">TestCafe Test Summary</h1>\n            <br>\n            <div class=\"client-logo\" style=\"padding:15px\"></div>\n            <div class=\"bg-primary\" style=\"padding:15px\">\n              <h3>Summary</h3><br>\n              <p class=\"lead\">Start Time: ".concat(this.startTime, "</p>\n              <p class=\"lead\">Browsers: ").concat(this.uaList, "</p>\n              <p class=\"lead\">Duration: ").concat(durationStr, "</p>\n              <p class=\"lead\">Tests Failed: ").concat(failed, " out of ").concat(this.testCount, "</p>\n              <p class=\"lead\">Tests Skipped: ").concat(this.skipped, "</p>\n            </div><br>\n      "); // Summary table

      html += "\n            <table class=\"table sortable\">\n              <thead>\n                <tr>\n                  <th>#</th>\n                  <th>Fixture</th>\n                  <th>Test Name</th>\n                  <th>Browsers</th>\n                  <th>Duration</th>\n                  <th>Result</th>\n                </tr>\n              </thead>\n              <tbody>\n               ".concat(this.tableReports, "\n              </tbody>\n            </table>\n            <br><br>\n      "); // Error details

      html += "\n            <h3>Error Details</h3>\n            <br>\n            ".concat(this.report, "\n      "); // closing html

      html += "\n          </div>\n        </body>\n      </html>\n      ";
      this.write(html);

      try {
        fs.writeFileSync("".concat(config.outputPath, "/").concat(config.fileName), html);
      } catch (e) {
        console.log('Cannot write file ', e);
      }
    }
  };
}