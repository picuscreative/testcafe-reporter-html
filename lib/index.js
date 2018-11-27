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
    },

    compileErrors: function compileErrors(name, testRunInfo) {
      var _this = this;

      var heading = this.currentFixtureName + ' - ' + name;

      this.report += this.indentString('<h4>' + heading + '</h4>\n');
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
      if (testRunInfo.skipped) {
        this.tableReports += 'skipped';
      } else {
        this.tableReports += result;
      }
      this.tableReports += '</td>\n';
      // Screenshot
      this.tableReports += this.indentString('<td>', 2);
      if (testRunInfo.screenshots.length > 0 && testRunInfo.screenshots[0].takenOnFail) {
        this.tableReports += '<p>outputpath: ' + config.outputPath + '</p>';
        var thumbnailPath = path.relative(config.outputPath, testRunInfo.screenshots[0].thumbnailPath);
        var screenshotPath = path.relative(config.outputPath, testRunInfo.screenshots[0].screenshotPath);
        this.tableReports += '<a href="' + screenshotPath + '"><img src="' + thumbnailPath + '"/></a>';
      }
      this.tableReports += '</td>\n';

      this.tableReports += this.indentString('</tr>\n');
    },

    reportTaskDone: function reportTaskDone(endTime, passed /* , warnings */) {
      var durationMs = endTime - this.startTime;
      var durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
      var failed = this.testCount - passed;

      // Opening html
      var html = '<html lang="en">';
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
      html += '<p class="lead">Start Time: ' + this.startTime + '</p>';
      html += '<p class="lead">Browsers: ' + this.uaList + '</p>';
      html += '<p class="lead">Duration: ' + durationStr + '</p>';
      html += '<p class="lead">Tests Failed: ' + failed + ' out of ' + this.testCount + '</p>';
      html += '<p class="lead">Tests Skipped: ' + this.skipped + '</p>';
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
      html += '<th>Screenshot</th>';
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
        fs.writeFileSync(config.outputPath + '/' + config.fileName, html);
      } catch (e) {
        console.log('Cannot write file ', e);
      }
    }
  };
};

module.exports = exports['default'];