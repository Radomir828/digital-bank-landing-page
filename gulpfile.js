const gulp = require('gulp');
const concat = require('gulp-concat-css');
const plumber = require('gulp-plumber');
const del = require('del');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mediaquery = require('postcss-combine-media-query');
const cssnano = require('cssnano');
const sass = require('gulp-sass')(require('sass'));

// ----------------------
// Сервер
// ----------------------
function serve(done) {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
  });
  done(); // важно — сигнализируем gulp, что таск завершён
}

// ----------------------
// HTML
// ----------------------
function html() {
  return gulp
    .src('src/**/*.html')
    .pipe(plumber())
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream()); // stream лучше чем reload
}

// ----------------------
// SCSS → CSS
// ----------------------
function scss() {
  const plugins = [autoprefixer(), mediaquery(), cssnano()];

  return gulp
    .src('src/**/*.scss')
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('bundle.css'))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream()); // поток обновления, без async ошибок
}

// ----------------------
// CSS
// ----------------------
function css() {
  const plugins = [autoprefixer(), mediaquery(), cssnano()];

  return gulp
    .src('src/**/*.css')
    .pipe(plumber())
    .pipe(concat('bundle.css'))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
}

// ----------------------
// IMAGES
// ----------------------
function images() {
  return gulp
    .src('src/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp,avif}', {
      encoding: false,
    })
    .pipe(gulp.dest('dist/images', { encoding: false }))
    .pipe(browserSync.stream());
}

// ----------------------
// CLEAN
// ----------------------
function clean() {
  return del(['dist/**', '!dist']); // чистим содержимое, не удаляя саму папку
}

// ----------------------
// WATCH
// ----------------------
function watchFiles() {
  gulp.watch('src/**/*.html', html);
  gulp.watch('src/**/*.scss', scss);
  gulp.watch('src/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp,avif}', images);
}

// ----------------------
// Основные задачи
// ----------------------
const build = gulp.series(clean, gulp.parallel(html, scss, images));
const watchapp = gulp.series(build, gulp.parallel(watchFiles, serve));

// ----------------------
// Экспорт
// ----------------------
exports.clean = clean;
exports.html = html;
exports.scss = scss;
exports.css = css;
exports.images = images;
exports.build = build;
exports.watchapp = watchapp;
exports.default = watchapp;
