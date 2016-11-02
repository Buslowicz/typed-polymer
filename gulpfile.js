const fs = require("fs");
const del = require("del");
const gulp = require("gulp");
const open = require("open");
const http = require("http");
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

const CONFIG = require("./package.json").config;

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
  name: "build-tests", config: CONFIG.tests, actions: [() => new Promise((resolve, reject) => {
    gulp.src([`${CONFIG.tests.src}/!(*.ts)`]).pipe(gulp.dest(CONFIG.tests.dist)).on("end", resolve).on("error", reject);
  })]
});

gulp.task("serve-tests", () => {
  http.createServer(function (req, res) {
    let url = req.url;
    url = url.substr(0, url.indexOf("?")) || url;
    if (url === "/") {
      url = "/index.html";
    }
    if (url.startsWith("/bower_components") || url.startsWith("/node_modules")) {
      url = `.${url}`;
    } else {
      url = `${CONFIG.tests.dist}${url.substr(0, url.indexOf("?")) || url}`;
    }
    fs.readFile(url, (err, file) => {
      if (err) {
        if (err.code === "ENOENT") {
          console.log(err, url);
          res.writeHead(404);
        } else {
          res.writeHead(500);
        }
        res.end(err.message);
      }
      res.end(file);
    });
  }).listen(3000);
  open("http://localhost:3000");
});
