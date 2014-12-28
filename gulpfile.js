var gulp = require('gulp');
var mocha = require('gulp-mocha');
var fixtures2js = require("gulp-fixtures2js");
var fs = require('fs');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var rename = require('gulp-rename');

gulp.task('test', ['fixtures'], function() {
  return gulp.src('test/*.test.js', {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec',
      grep: ''
    }));
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

gulp.task('browserify', function() {
  var browserified = transform(function(filename) {
    var b = browserify({});
    b.require(filename,{expose: "jouvence"});
    // var b = browserify(filename);
    return b.bundle();
  });
  return gulp.src(['lib/index.js'])
    .pipe(browserified)
    .pipe(rename('jouvence.js'))
    .pipe(gulp.dest('./build'));
});



gulp.task('default', ['test']);