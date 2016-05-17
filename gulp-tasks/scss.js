var gulp = require("gulp");

var sourceMaps = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");

var BUILD_DIR = ".build";

gulp.task("sass:dev", ["lint:scss"], function () {
  return gulp
    .src("src/**/*.scss")
    .pipe(sourceMaps.init())
    .pipe(sass({
      outputStyle: "expanded",
      sourceComments: true
    }).on("error", sass.logError))
    .pipe(autoprefixer({
      browsers: ["> 1%", "last 2 versions", "Firefox ESR"],
      cascade: false
    }))
    .pipe(sourceMaps.write())
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task("sass:prod", function () {
  return gulp
    .src("src/**/*.scss")
    .pipe(sass({
      outputStyle: "compressed"
    }).on("error", sass.logError))
    .pipe(autoprefixer({
      browsers: ["> 1%", "last 2 versions", "Firefox ESR"],
      cascade: false
    }))
    .pipe(gulp.dest(BUILD_DIR));
});