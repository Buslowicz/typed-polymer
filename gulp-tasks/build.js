var gulp = require("gulp");
var runSequence = require("run-sequence");
var gulpWebpack = require("gulp-webpack");
var named = require('vinyl-named');

gulp.task("webpack:src", function () {
    return gulp.src("src/*.ts")
      .pipe(named())
      .pipe(gulpWebpack(require("../webpack.config.js").dev))
      .pipe(gulp.dest("dist"));
  }
);

gulp.task("webpack:test", function () {
    return gulp.src("test/tests.ts")
      .pipe(named())
      .pipe(gulpWebpack(require("../webpack.config.js").dev))
      .pipe(gulp.dest("test"));
  }
);

gulp.task("build:dev", ["clean:all", "lint:scss", "lint:ts"], function (cb) {
  runSequence(["webpack:src", "sass:dev"], "copy:assets", cb);
});

gulp.task("build:prod", ["clean:all", "lint:scss", "lint:ts"], function (cb) {
  runSequence(
    ["copy:assets", "webpack:src", "sass:prod"],
    cb);
});

gulp.task("build:test", ["clean:test", "webpack:test"]);
