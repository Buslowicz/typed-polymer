var gulp = require("gulp");

var tslint = require("gulp-tslint");
var sassLint = require('gulp-sass-lint');

gulp.task("lint:ts", function () {
  return gulp.src("src/**/*.ts")
    .pipe(tslint())
    .pipe(tslint.report("prose"));
});

gulp.task("lint:scss", function () {
  gulp.src("src/**/*.scss")
    .pipe(sassLint(require("../sasslint.json")))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
});