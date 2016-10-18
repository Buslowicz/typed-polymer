const del = require("del");
const gulp = require("gulp");
const rollup = require("rollup-stream");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const nop = require("gulp-empty");
const rename = require("gulp-rename");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const typescript = require("rollup-plugin-typescript");
const _ = require("lodash");

const tsLint = require("gulp-tslint");

const pkg = require("./package.json");

const entryPoint = "./src/typed-polymer.ts";

const srcDir = "./src/**/*.ts";
const srcDest = "./dist";
const bundles = [
  "es",
  "iife",
  "iife:min",
  "umd",
  "umd:min"
];

const testDir = "./test/**/*.ts";
const testFormat = "iife";
const testDest = "./dist-test";

function lint(src) {
  return () => new Promise((resolve, reject) => gulp.src(src)
    .pipe(tsLint({formatter: "prose"}))
    .pipe(tsLint.report())
    .on("end", resolve)
    .on("error", reject)
  );
}

function build({name, entryPoint, srcDir, outFile, dist = "./dist", format = "umd", minify = false}) {
  return new Promise((resolve) => rollup({
    entry: entryPoint,
    moduleName: _.capitalize(_.camelCase(name)),
    sourceMap: true,
    format: format,
    plugins: [
      typescript({
        typescript: require("typescript"),
        include: srcDir
      })
    ]
  })
    .pipe(source(entryPoint))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(minify ? uglify() : nop())
    .pipe(rename(outFile || `${name}.${format}${minify ? ".min" : ""}.js`))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(dist))
    .on("end", resolve));
}

let tasks = [];
bundles.forEach(function (bundle) {
  let [format, minify] = bundle.split(":");
  tasks.push(build.bind(null, {
    entryPoint, srcDir,
    name: pkg.name,
    format: format,
    minify: minify
  }));
});

gulp.task("build", () => del([`${srcDest}/**`]).then(lint(srcDir))
  .then(() => Promise.all(tasks.map(build => build())))
  .catch(err => console.error(err.message)));

gulp.task("build-tests", () => del([`${testDest}/**`]).then(lint(testDir))
  .then(build.bind(null, {
    entryPoint: "./test/tests.ts",
    testDir,
    name: `tests`,
    format: testFormat,
    dist: testDest,
    outFile: 'tests.js'

  }))
  .then(() => new Promise((resolve, reject) => {
    gulp.src(["./test/!(*.ts)"]).pipe(gulp.dest(testDest)).on("end", resolve).on("error", reject);
  }))
  .catch(err => console.error(err.message)));

// TODO: serve tests
