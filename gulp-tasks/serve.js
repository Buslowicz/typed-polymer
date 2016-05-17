var gulp = require("gulp");
var browserSync = require("browser-sync").create();

var BUILD_DIR = ".build";

gulp.task("serve:demo", function () {
  browserSync.init({
    server: {
      baseDir: [BUILD_DIR, "bower_components", "./"],
      index: "demo.html"
    }
  });
});

gulp.task("serve:test", function () {
  browserSync.init({
    server: {
      baseDir: [BUILD_DIR, "bower_components", "./", "test"]
    }
  });
});

gulp.task("serve:docs", function () {
  browserSync.init({
    server: {
      baseDir: ["docs"]
    }
  });
});

function devWatch() {
  gulp.watch("src/**/*.scss", ["sass:dev"]);
  gulp.watch("src/**/*.ts", ["tsc:dev"]);

  gulp.watch([
    BUILD_DIR + "/**/*.js",
    BUILD_DIR + "/**/*.css"
  ], browserSync.reload);

  gulp.watch([
    "**/*.html"
  ], ["copy:assets", browserSync.reload]);
}

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