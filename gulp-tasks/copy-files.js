var gulp = require("gulp");

var rename = require("gulp-rename");

var BUILD_DIR = "dist";

gulp.task("copy:assets", function () {
  return gulp
    .src(["src/**/*", "!src/**/*.ts", "!src/**/*.scss", "demo.html"])
    .pipe(gulp.dest(BUILD_DIR));
});