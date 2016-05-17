var gulp = require("gulp");
var runSequence = require("run-sequence");
var gulpWebpack = require("gulp-webpack");
var named = require('vinyl-named');

function webpack() {
  return gulp.src("src/*.ts")
    .pipe(named())
    .pipe(gulpWebpack(require("../webpack.config.js").dev))
    .pipe(gulp.dest("dist"));
}

gulp.task("webpack", webpack);

gulp.task("build:dev", ["clean:all", "lint:scss", "lint:ts"], function (cb) {
  runSequence(["webpack", "sass:dev"], "copy:assets", cb);
});

gulp.task("build:prod", ["clean:all", "lint:scss", "lint:ts"], function (cb) {
  runSequence(
    ["copy:assets", "webpack", "sass:prod"],
    cb);
});