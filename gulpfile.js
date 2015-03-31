var gulp = require('gulp');
var mocha = require('gulp-mocha');
var fixtures2js = require("gulp-fixtures2js");
var fs = require('fs');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var rename = require('gulp-rename');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');

gulp.task('test', ['fixtures'], function() {
  return gulp.src('test/*.test.js', {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec',
      grep: ''
    }));
});

gulp.task('coverage', ['fixtures'], function (cb) {
  gulp.src(['lib/**/*.js'])
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src(['test/*.test.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports()) // Creating the reports after tests runned
        .on('end', cb);
    });
});

gulp.task('coveralls', ['coverage'], function() {
  gulp.src('./coverage/lcov.info')
  .pipe(coveralls());
});

gulp.task("fixtures", function() {
  fs.readFile('tasks/fixtures.head.js', function(err, head) {
    if (err) throw err;
    fs.readFile('tasks/fixtures.tail.js', function(err, tail) {
      if (err) throw err;

      return gulp.src("./test/fixtures/*")
        .pipe(fixtures2js("fixtures.js", {
          relativeTo: "./test/fixtures",
          head: head,
          tail: tail,
          postProcessors: {
            "**/*.json": "json"
          }
        }))
        .pipe(gulp.dest("./test"))
    });

  });
});

gulp.task('default', ['test']);