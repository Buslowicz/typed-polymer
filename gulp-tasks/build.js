var gulp = require("gulp");
var runSequence = require("run-sequence");
var gulpWebpack = require("gulp-webpack");
var named = require('vinyl-named');

function webpack() {
  return gulp.src("src/*.ts")
    .pipe(named())
    .pipe(gulpWebpack(require("../webpack.config.js")))
    .pipe(gulp.dest("dist"));
}

gulp.task("build:dev", ["clean:all", "lint:scss", "lint:ts"], function (cb) {
  runSequence(["tsc:dev", "sass:dev"], "copy:assets", cb);
});

gulp.task("build:prod", ["clean:all", "lint:scss", "lint:ts"], function (cb) {
  runSequence(
    ["copy:assets", "tsc:prod", "sass:prod"],
    cb);
});