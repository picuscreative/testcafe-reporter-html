/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

const fs = require('fs');

module.exports = () => ({
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
    const hasErr = !!testRunInfo.errs.length;
    const result = hasErr ? 'failed' : 'passed';

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
    const heading = `${this.currentTestNumber}. ${this.currentFixtureName} - ${name}`;

    this.report += this.indentString(`<h4 id="test-${this.currentTestNumber}" style="color: red;">${heading}`);
    if (testRunInfo.screenshots) {
      testRunInfo.screenshots.forEach((screenshot) => {
        if(screenshot.screenshotPath.includes("error")) {
          // highlight error screenshot
          this.report += `&nbsp;&nbsp;<img class="thumbImg" style="border-color:#ff0000" src="data:image/png;base64, ${fs.readFileSync(screenshot.screenshotPath, { encoding: 'base64' })}"/>`;
        }else {
          this.report += `&nbsp;&nbsp;<img class="thumbImg" src="data:image/png;base64, ${fs.readFileSync(screenshot.screenshotPath, { encoding: 'base64' })}"/>`;
        }
      });
    }
    this.report += '</h4>\n';
    testRunInfo.errs.forEach((error) => {
      this.report += this.indentString('<pre style="padding:15px;box-shadow: 6px 6px 6px 6px #00000033;border-radius: 10px;">');
      this.report += this.escapeHtml(this.formatError(error, '')).replace('{', '&#123').replace('}', '&#125');
      this.report += this.indentString('</pre><br>');
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
    const durationMs = endTime - this.startTime;
    const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
    const failed = this.testCount - passed;

    // Opening html
    let html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
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
    <style>
      body {font-family: Arial, Helvetica, sans-serif;}

      .thumbImg {
        width: 100%;
        max-width: 35px;
        border-radius: 3px;
        cursor: pointer;
        margin-bottom: 5px;
        border-width: 1px;
        border-color: #f1f1f1;
        border-style: solid;
      }

      .modal {
        display: none;
        position: fixed;
        z-index: 1;
        padding-top: 100px;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.7);
      }

      .modal-content {
        margin: auto;
        display: block;
        width: 80%;
        max-width: 1000px;
      }

      .closeModal {
        position: absolute;
        top: 15px;
        right: 35px;
        color: #f1f1f1;
        font-size: 40px;
        font-weight: bold;
        transition: 0.3s;
      }

      .closeModal:hover,
      .closeModal:focus {
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div id="myModal" class="modal">
      <span class="closeModal">&times;</span>
      <img class="modal-content" id="modelImage">
    </div>
    <div class="container">
`;

    // Now add a summary
    html += `
      <h1 class="text-primary">TestCafe Test Summary</h1>
      <div class="client-logo" style="padding:15px"></div>
      <div class="bg-primary" style="padding:15px;box-shadow: 6px 6px 6px 6px #00000033;border-radius: 10px;">
        <h3>Summary</h3><br>
        <p class="lead">Test Env.: ${process.env.NODE_ENV}</p>
        <p class="lead">Start Time: ${this.startTime}</p>
        <p class="lead">Browsers: ${this.uaList}</p>
        <p class="lead">Duration: ${durationStr}</p>
        <p class="lead">Tests Failed: ${failed} out of ${this.testCount}</p>
        <p class="lead">Tests Skipped: ${this.skipped}</p>
      </div><br>`;

    // Summary table
    html += `
      <table class="table sortable" style="padding:15px;box-shadow: 6px 6px 6px 6px #00000033;border-radius: 10px;">
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
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
      </table>
      <br>`;

    // Error details
    html += `
      <h3>Error Details</h3>
      ${this.report}`;

    // closing html
    html += `
    </div>
    <script>
      const modal = document.getElementById('myModal');
      const modalImage = document.getElementById("modelImage");

      Array.from(document.getElementsByClassName("thumbImg")).forEach(function(el) {
        el.onclick = function() {
          modal.style.display = "block";
          modalImage.src = this.src;
        }
      });

      document.getElementsByClassName("closeModal")[0].onclick = function() {
        modal.style.display = "none";
      }
    </script>
  </body>
  <br>
</html>`;

    this.write(html);
  },
});
