var gulp = require("gulp");

require("require-dir")("gulp-tasks");

gulp.task("default", ["serve:dev"]);
gulp.task("build", ["build:prod"]);
