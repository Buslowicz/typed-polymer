const fs = require("fs");
const del = require("del");
const gulp = require("gulp");
const nop = require("gulp-empty");
const sourcemaps = require("gulp-sourcemaps");
const tsLint = require("gulp-tslint");
const rename = require("gulp-rename");
const wrapper = require("gulp-wrapper");
const buffer = require("vinyl-buffer");
const rollup = require("rollup-stream");
const source = require("vinyl-source-stream");
const typescript = require("rollup-plugin-typescript");
const uglify = require("rollup-plugin-uglify");
const _ = require("lodash");

const CONFIG = require("./package.json").config;

// TODO: generate html wrappers as separate files pulling iife instead of putting raw code inside

function lint(src) {
  return () => new Promise((resolve, reject) => gulp.src(src)
    .pipe(tsLint({formatter: "prose"}))
    .pipe(tsLint.report())
    .on("end", resolve)
    .on("error", reject)
  );
}

function build({main, src, outFile, dist, format, intro, minify = false}) {
  let mainPath = `${src}/${main}.ts`;

  let rollupOptions = {
    format, intro,
    entry: mainPath,
    moduleName: _.capitalize(_.camelCase(main)),
    sourceMap: true,
    plugins: [
      typescript({
        typescript: require("typescript"),
        include: `**/*.ts`
      })
    ]
  };

  if (minify) {
    rollupOptions.plugins.push(uglify());
  }

  // TODO: room for improvements?
  return new Promise((resolve, reject) =>
    rollup(rollupOptions)
      .pipe(source(mainPath))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(rename(outFile || `${main}.${format}${minify ? ".min" : ""}.js`))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(dist))
      .on("error", reject)
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
        intro: config.intro,
        format: format,
        minify: minify,

        outFile: config.outFile
      });
    })))
    .then(actions && (() => Promise.all(actions.map(action => action()))))
    .catch(err => console.error(err.message)));
}

function generateTestSuite(dom) {
  return () => new Promise((resolve, reject) => {
    let include = [
      "/components/webcomponentsjs/webcomponents-lite.js",
      "/components/web-component-tester/browser.js",
      "/components/polymer/polymer.html",
      "tests.html"
    ];
    let config = `<script>window.Polymer = {dom: '${dom}'}</script>`;
    fs.writeFile(
      `${CONFIG.tests.dist}/${dom}.html`,
      `<!doctype html><html><head><meta charset="utf-8">${config}${include.map(path => {
        if (path.endsWith(".js")) return `<script src="${path}"></script>`;
        if (path.endsWith(".html")) return `<link rel="import" href="${path}">`;
        if (path.endsWith(".css")) return `<link rel="stylesheet" href="${path}">`;
      })}</head></html>`,
      (err) => err && reject(err) || resolve());
  });
}

function copyAssets(from, to) {
  return () => new Promise((resolve, reject) => {
    gulp.src([from]).pipe(gulp.dest(to)).on("end", resolve).on("error", reject);
  });
}

function htmlWrapModule(src) {
  let [, path, name] = src.match(/(.*)\/([^.\/]+)(\.[\w]+)?(\.min)?\.js/) || [];
  if (!path || !name) {
    return () => Promise.reject("html wrapper has no name or path");
  }
  return () => new Promise((resolve, reject) => {
    gulp.src([src])
      .pipe(wrapper({header: '<script>\n', footer: '</script>'}))
      .pipe(rename(`${name}${src.endsWith("min.js") ? ".min" : ""}.html`))
      .pipe(gulp.dest(`${path}/`))
      .on("end", resolve)
      .on("error", reject);
  });
}

generateBuildTask({name: "build", config: CONFIG.app, actions: [
  htmlWrapModule(`${CONFIG.app.dist}/${CONFIG.app.entry}.iife.js`),
  htmlWrapModule(`${CONFIG.app.dist}/${CONFIG.app.entry}.iife.min.js`)
]});

generateBuildTask({
  name: "build-tests", config: CONFIG.tests, actions: [
    copyAssets(`${CONFIG.tests.src}/!(*.ts)`, CONFIG.tests.dist),
    htmlWrapModule(`${CONFIG.tests.dist}/${CONFIG.tests.entry}.js`),
    htmlWrapModule(`${CONFIG.tests.dist}/${CONFIG.tests.entry}.min.js`),
    generateTestSuite("shady"),
    generateTestSuite("shadow")
  ]
});
