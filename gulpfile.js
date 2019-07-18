"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var minify = require("gulp-csso");
var run = require("run-sequence");
var wait = require("gulp-wait");
var imagemin = require("gulp-imagemin");
var del = require("del");
var htmlmin = require("gulp-htmlmin");

gulp.task("svg-min", function() {
  return gulp.src("img/svg/*.svg")
  .pipe(imagemin(
      imagemin.svgo()
  ))
  .pipe(gulp.dest("img/svg"));
});

// Регулярно используемые таски идущие в билд и в живой сервер
gulp.task("sprite", function() {
  return gulp.src("img/svg/*.svg")
  .pipe(svgstore({
      inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img/svg"));
});

gulp.task("html", function() {
  return gulp.src("*.html")
  .pipe(posthtml([
      include()
  ]))
  .pipe(gulp.dest("build"))
  .pipe(server.stream());
});

gulp.task("minify-html", function() {
  return gulp.src("build/*.html")
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest("build"));
});

gulp.task("style", function() {
    gulp.src("sass/style.scss")
      .pipe(wait(1000))
      .pipe(plumber())
      .pipe(sass())
      .pipe(postcss([
          autoprefixer()
      ]))
      .pipe(gulp.dest("build/css"))
      .pipe(minify())
      .pipe(rename("style.min.css"))
      .pipe(gulp.dest("build/css"))
      .pipe(server.stream());
});

gulp.task("copy", function() {
  return gulp.src([
      "fonts/**/*",
      "img/**"
  ], {
      base: "."
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("build", function (done) {
  run(
    "clean",
    "copy",
    "style",
    "sprite",
    "html",
    "minify-html",
    done
  );
});

gulp.task("serve", function () {
  server.init({
      server: "build/",
      notify: false,
      open: true,
      cors: true,
      ui: false
  });
  gulp.watch("sass/**/*.scss", ["style"]);
  gulp.watch("*.html", ["html"]);
});
