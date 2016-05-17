var gulp = require("gulp");
var del = require("del");

var BUILD_DIR = ".build";

gulp.task("clean:inline", function () {
  return del([
    "docs",
    BUILD_DIR + "/*.css",
    BUILD_DIR + "/*.js"
  ]);
});

gulp.task("clean:all", function () {
  return del([
    ".tmp",
    "docs",
    "docs.html",
    BUILD_DIR
  ]);
});

gulp.task("clean:docs", function () {
  return del([
    "docs"
  ]);
});