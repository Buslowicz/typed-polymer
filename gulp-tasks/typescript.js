var gulp = require("gulp");

var sourceMaps = require("gulp-sourcemaps");
var tsc = require("gulp-typescript");
var uglify = require("gulp-uglify");

var BUILD_DIR = ".build";

gulp.task("tsc:dev", ["lint:ts"], function () {

  var tsProject = tsc.createProject("tsconfig.json", { outDir: ".", rootDir: "." });
  return gulp
    .src(["src/**/*.ts", "typings/index.d.ts"])
    .pipe(sourceMaps.init())
    .pipe(tsc(tsProject))
    .pipe(sourceMaps.write())
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task("tsc:prod", function () {

  var tsProject = tsc.createProject("tsconfig.json", { outDir: ".", rootDir: ".", removeComments: true });
  return gulp
    .src(["src/**/*.ts", "typings/index.d.ts"])
    .pipe(tsc(tsProject))
    .pipe(uglify({
      mangle: false
    }))
    .pipe(gulp.dest(BUILD_DIR));
});