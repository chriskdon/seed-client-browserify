'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var webserver = require('gulp-webserver');

var config = {
  build: {
    client: {
      browserify: {
        entries: ['./client-src/js/main.js'],
        debug: true
      }
    }
  }
};

var watchifyInstance = (function() {
  var opts = assign({}, watchify.args, config.build.client.browserify);
  return watchify(browserify(opts));
})();

gulp.task('webserver', function() {
  gulp.src('client')
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: true
    }));
});

gulp.task('js', bundleJs);

gulp.task('js-watch', ['js'], function() {
  watchifyInstance.on('update', bundleJs); // on any dep update, runs the bundler
  watchifyInstance.on('log', gutil.log); // output build logs to terminal
});

gulp.task('watch', ['js-watch']);


// add transformations here
// i.e. b.transform(coffeeify);

gulp.task('js', bundleJs); // so you can run `gulp js` to build the file

function bundleJs() {
  return watchifyInstance.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error')) // log errors if they happen
    .pipe(source('app.js'))
    .pipe(buffer()) // optional, remove if you don't need to buffer file contents
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./client/js'));
}
