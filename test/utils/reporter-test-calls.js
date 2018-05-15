const { TestRunErrorFormattableAdapter } = require('testcafe').embeddingUtils;
const { UncaughtErrorOnPage } = require('testcafe').embeddingUtils.testRunErrors;
const { ActionElementNotFoundError } = require('testcafe').embeddingUtils.testRunErrors;
const testCallsite = require('./test-callsite');

function makeErrors(errDescrs) {
  return errDescrs.map(descr => new TestRunErrorFormattableAdapter(descr.err, descr.metaInfo));
}

module.exports = [
  {
    method: 'reportTaskStart',
    args: [
      new Date('1970-01-01T00:00:00.000Z'),
      [
        'Chrome 41.0.2227 / Mac OS X 10.10.1',
        'Firefox 47 / Mac OS X 10.10.1',
      ],
      6,
    ],
  },
  {
    method: 'reportFixtureStart',
    args: [
      'First fixture',
      './fixture1.js',
    ],
  },
  {
    method: 'reportTestDone',
    args: [
      'First test in first fixture',
      {
        errs: [],
        durationMs: 74000,
        unstable: true,
        screenshotPath: '/screenshots/1445437598847',
      },
    ],
  },
  {
    method: 'reportTestDone',
    args: [
      'Second test in first fixture',
      {
        errs: makeErrors([
          {

            err: new UncaughtErrorOnPage('Some error', 'http://example.org'),

            metaInfo: {
              userAgent: 'Chrome 41.0.2227 / Mac OS X 10.10.1',
              screenshotPath: '/screenshots/1445437598847/errors',
              callsite: testCallsite,
              testRunState: 'inTest',
            },
          },
          {
            err: new ActionElementNotFoundError(),

            metaInfo: {
              userAgent: 'Firefox 47 / Mac OS X 10.10.1',
              callsite: testCallsite,
              testRunState: 'inTest',
            },
          },
        ]),

        durationMs: 74000,
        unstable: false,
        screenshotPath: '/screenshots/1445437598847',
      },
    ],
  },
  {
    method: 'reportTestDone',
    args: [
      'Third test in first fixture',
      {
        errs: [],
        durationMs: 74000,
        unstable: false,
        screenshotPath: null,
      },
    ],
  },
  {
    method: 'reportFixtureStart',
    args: [
      'Second fixture',
      './fixture2.js',
    ],
  },
  {
    method: 'reportTestDone',
    args: [
      'First test in second fixture',
      {
        errs: [],
        durationMs: 74000,
        unstable: false,
        screenshotPath: null,
      },
    ],
  },
  {
    method: 'reportTestDone',
    args: [
      'Second test in second fixture',
      {
        errs: [],
        durationMs: 74000,
        unstable: false,
        screenshotPath: null,
      },
    ],
  },
  {
    method: 'reportTestDone',
    args: [
      'Third test in second fixture',
      {
        errs: [],
        durationMs: 0,
        unstable: false,
        screenshotPath: null,
        skipped: false,
      },
    ],
  },
  {
    method: 'reportFixtureStart',
    args: [
      'Third fixture',
      './fixture3.js',
    ],
  },
  {
    method: 'reportTestDone',
    args: [
      'First test in third fixture',
      {
        errs: makeErrors([
          {
            err: new ActionElementNotFoundError(),

            metaInfo: {
              userAgent: 'Firefox 47 / Mac OS X 10.10.1',
              callsite: testCallsite,
              testRunState: 'inBeforeEach',
            },
          },
        ]),

        durationMs: 74000,
        unstable: true,
        screenshotPath: null,
      },
    ],
  },
  {
    method: 'reportTaskDone',
    args: [
      new Date('1970-01-01T00:15:25.000Z'),
      4,
      [
        'Was unable to take a screenshot due to an error.\n\nReferenceError: someVar is not defined',
        'Was unable to take a screenshot due to an error.\n\nReferenceError: someOtherVar is not defined',
        'Was unable to take screenshots because the screenshot directory is not specified. ' +
                'To specify it, use the "-s" or "--screenshots" command line option or the ' +
                '"screenshots" method of the test runner in case you are using API.',
      ],
    ],
  },
];
