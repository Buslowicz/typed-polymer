const del = require("del");
const gulp = require("gulp");
const uglify = require("gulp-uglify");
const nop = require("gulp-empty");
const sourcemaps = require("gulp-sourcemaps");
const tsLint = require("gulp-tslint");
const rename = require("gulp-rename");
const buffer = require("vinyl-buffer");
const rollup = require("rollup-stream");
const source = require("vinyl-source-stream");
const typescript = require("rollup-plugin-typescript");
const _ = require("lodash");

const CONFIG = {
  app: {
    entry: "typed-polymer",
    src: "./src",
    dist: "./dist",
    formats: [
      "es",
      "iife",
      "iife:min",
      "umd",
      "umd:min"
    ]
  },
  tests: {
    entry: "tests",
    src: "./test",
    dist: "./dist-test",
    formats: ["iife"],
    outFile: "tests.js"
  }
};

function lint(src) {
  return () => new Promise((resolve, reject) => gulp.src(src)
    .pipe(tsLint({formatter: "prose"}))
    .pipe(tsLint.report())
    .on("end", resolve)
    .on("error", reject)
  );
}

function build({main, src, outFile, dist, format, minify = false}) {
  let mainPath = `${src}/${main}.ts`;

  return new Promise((resolve) => rollup({
    entry: mainPath,
    moduleName: _.capitalize(_.camelCase(main)),
    sourceMap: true,
    format: format,
    plugins: [
      typescript({
        typescript: require("typescript"),
        include: `**/*.ts`
      })
    ]
  })
    .pipe(source(mainPath))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(minify ? uglify() : nop())
    .pipe(rename(outFile || `${main}.${format}${minify ? ".min" : ""}.js`))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(dist))
    .on("end", resolve));
}

function generateBuildTask({name, config, actions}) {
  gulp.task(name, () => del([`${config.dist}/**`]).then(lint(`${config.src}/**/*.ts`))
    .then(() => Promise.all(config.formats.map((bundle) => {
      let [format, minify] = bundle.split(":");

      return build({
        main: config.entry,
        src: config.src,
        dist: config.dist,
        format: format,
        minify: minify,

        outFile: config.outFile
      });
    })))
    .then(actions && (() => Promise.all(actions.map(action => action()))))
    .catch(err => console.error(err.message)));
}

generateBuildTask({name: "build", config: CONFIG.app});

generateBuildTask({
  name: "build-tests", config: CONFIG.tests, actions: [() => {
    return new Promise((resolve, reject) => {
      let config = CONFIG.tests;
      gulp.src([`${config.src}/!(*.ts)`]).pipe(gulp.dest(config.dist)).on("end", resolve).on("error", reject);
    });
  }]
});

// TODO: serve tests
