var gulp = require("gulp");
var del = require("del");

var BUILD_DIR = "dist";

gulp.task("clean:inline", function () {
  return del([
    BUILD_DIR + "/*.css",
    BUILD_DIR + "/*.js"
  ]);
});

gulp.task("clean:all", function () {
  return del([
    ".tmp",
    BUILD_DIR
  ]);
});

gulp.task("clean:test", function () {
  return del([
    "test/*.js"
  ]);
});