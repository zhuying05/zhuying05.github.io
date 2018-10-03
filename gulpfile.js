var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    watch = require('gulp-watch'),
    browserSync = require('browser-sync').create(),
    imagemin = require('gulp-imagemin'),
    runSequence = require('run-sequence'),
    plumber = require('gulp-plumber'),
    notify = require("gulp-notify"),
    sourcemaps = require('gulp-sourcemaps'),
    inject = require('gulp-inject'),
    rename = require('gulp-rename'),
    nunjucksRender = require('gulp-nunjucks-render'),
    mainBowerFiles = require('main-bower-files'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify');

gulp.task('style', function () {
  return gulp.src('src/scss/*.scss')
    .pipe(plumber({errorHandler: notify.onError("Style Build Error: <%= error.message %>")}))
    .pipe(sourcemaps.init())
      .pipe(sass({ style: 'expanded' }))
      .pipe(autoprefixer('last 2 version'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'))
});

gulp.task('style-build', function () {
  return gulp.src('src/scss/*.scss')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sass({ style: 'expanded' }))
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssnano({safe: true}))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('browserSync', function() {
  browserSync.init({
    open: false,
    server: {
      baseDir: './dist'
    }
  })
});

gulp.task('build-html', function(){
  return gulp.src('./src/pages/**/*.+(html|njk)')
    .pipe(plumber({errorHandler: notify.onError("HTML Build Error: <%= error.message %>")}))
    .pipe(nunjucksRender({
        path: ['src/templates']
    }))
    //.pipe(inject(gulp.src(['./dist/components/jquery.min.js', './dist/js/moment.min.js', './dist/components/*.js', './dist/components/*.css', './dist/**/*.js'], {read: false}), { addRootSlash: false, ignorePath: ['/src', '/dist']}))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('main-bower-files', function(){
  return gulp.src(mainBowerFiles())
    .pipe(gulp.dest('./dist/components'))
});

gulp.task('scripts', function() {
  return gulp.src('src/js/**/*.js')
    .pipe(gulp.dest('dist/js'))
});

gulp.task('images', function(){
  return gulp.src('src/img/**/*.+(png|jpg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(imagemin({
       optimizationLevel: 3,
       progressive: true,
       interlaced: true
    }))
  .pipe(gulp.dest('dist/img'))
});

gulp.task('pictures', function(){
  return gulp.src('src/pic/**/*.+(png|jpg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(imagemin({
    optimizationLevel: 3,
    progressive: true,
    interlaced: true
    }))
  .pipe(gulp.dest('dist/pic'))
});

gulp.task('fonts', function() {
  return gulp.src('src/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

gulp.task('reload', function() {
  return gulp.src('dist/**/*')
  .pipe(browserSync.reload({
    stream: true
  }));
});

/////////////////////////////////////////////////
// Finalization tasks
gulp.task('watch', function() {
  // Watch .scss files
  gulp.watch('src/scss/**/*.scss', ['style']);
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('src/templates/**/*.+(html|njk)', ['build-html']);
  gulp.watch('src/pages/**/*.+(html|njk)', ['build-html']);
  gulp.watch('src/js/**/*.js', ['scripts']);
  gulp.watch('src/pic/**/*', ['pictures']);
  gulp.watch('src/img/**/*', ['images']);
  gulp.watch('src/fonts/**/*', ['fonts']);
  gulp.watch('dist/**/*', ['reload']);
});

// Default watcher
gulp.task('default', function(callback) {
  runSequence(['style', 'scripts', 'build-html', 'browserSync', 'watch'], callback)
});

// Collecting scripts and injecting them into HTML
gulp.task('build-scripts', function(callback) {
  runSequence([ 'scripts', 'main-bower-files', 'build-html'], callback)
});

// Final build
gulp.task('build', function (callback) {
  runSequence(['style-build', 'main-bower-files', 'build-html', 'scripts', 'images', 'pictures', 'fonts'],
    callback
  )
});

/////////////////////////////////////////////////
// Utils
function onError(err) {
  console.log(err);
  this.emit('end');
}
