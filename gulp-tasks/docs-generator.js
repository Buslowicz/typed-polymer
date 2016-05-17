//var gulp = require("gulp");
//var runSequence = require("run-sequence");
//
//var typeDoc = require("gulp-typedoc");
//
//gulp.task("typedoc", function () {
//  return gulp
//    .src(["src/**/*.ts", "typings/tsd.d.ts"])
//    .pipe(typeDoc({
//      target: "es5",
//      module: "commonjs",
//      experimentalDecorators: true,
//      hideGenerator: true,
//      mode: "file",
//      out: "docs",
//      theme: "minimal"
//    }));
//});
//
//gulp.task("generate-docs", function (cb) {
//  runSequence("clean:docs", "typedoc", cb);
//});