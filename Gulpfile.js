/* eslint global-require: 0 */
/* eslint import/no-unresolved: 0 */

const gulp = require('gulp');
const babel = require('gulp-babel');
const mocha = require('gulp-mocha');
const del = require('del');

gulp.task('clean', cb => del('lib', cb));

gulp.task('build', gulp.series('clean', () => gulp
  .src('src/**/*.js')
  .pipe(
    babel({
      presets: ['@babel/env'],
    }),
  )
  .pipe(gulp.dest('lib'))));

gulp.task('test', () => {
  process.env.NODE_ENV = 'test';
  return gulp.src('test/**.js').pipe(
    mocha({
      ui: 'bdd',
      reporter: 'spec',
      timeout: typeof v8debug === 'undefined' ? 2000 : Infinity, // NOTE: disable timeouts in debug
    }),
  );
});

gulp.task('preview', () => {
  const { buildReporterPlugin } = require('testcafe').embeddingUtils;
  const pluginFactory = require('./lib');
  const reporterTestCalls = require('./test/utils/reporter-test-calls');
  const plugin = buildReporterPlugin(pluginFactory);

  reporterTestCalls.forEach((call) => {
    plugin[call.method](...call.args);
  });

  process.exit(0);
});
