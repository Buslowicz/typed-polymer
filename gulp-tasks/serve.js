var gulp = require("gulp");
var browserSync = require("browser-sync").create();

var BUILD_DIR = "dist";

function testWatch() {
  gulp.watch("test/**/*.ts", ["build:test"]);

  gulp.watch(["test/**/*.js", "test/**/*.html"], browserSync.reload);
}

function devWatch() {
  gulp.watch("src/**/*.scss", ["sass:dev"]);
  gulp.watch("src/**/*.ts", ["webpack"]);

  gulp.watch([
    BUILD_DIR + "/**/*.js",
    BUILD_DIR + "/**/*.css"
  ], browserSync.reload);

  gulp.watch([
    "**/*.html"
  ], ["copy:assets", browserSync.reload]);
}

gulp.task("serve:demo", function () {
  browserSync.init({
    server: {
      baseDir: [BUILD_DIR, "bower_components", "./"],
      index: "demo.html"
    }
  });
});

gulp.task("dev:test", ["build:test"], function () {
  browserSync.init({
    server: {
      baseDir: [BUILD_DIR, "bower_components", "./", "test"]
    }
  });

  testWatch();
});

gulp.task("watch", ["build:dev"], devWatch);

gulp.task("serve:dev", ["build:dev"], function () {
  browserSync.init({
    server: {
      baseDir: [BUILD_DIR, "bower_components", "./"],
      index: "demo.html"
    }
  });

  devWatch();
});