var gulp = require('gulp');
var concat = require('gulp-concat');
var join = require('path').join;
var OUTPUT = 'dist';
var dest = function(path) {
  var p = path ? join(OUTPUT, path) : OUTPUT;
  return gulp.dest(p);
}

var paths = {
  css: 'app/css/main.styl',
  js: 'app/js/main.js',
  jade: 'app/*.jade',
  img: 'app/images/*',
  vendor: 'app/vendor/*',
};

gulp.task('css', function() {
  var rework = require('gulp-rework');
  var whitespace = require('gulp-css-whitespace');
  var normalize = './node_modules/normalize.css/normalize.css';
  var es = require('event-stream');
  var autoprefixer = require('gulp-autoprefixer');

  var vendorStream = gulp.src([normalize]);

  var cssStream = gulp.src(paths.css)
    .pipe(whitespace())
    .pipe(rework())
    .pipe(autoprefixer('last 1 version', '> 5%', 'ie 8'))
    .pipe(concat('main.css'))

  return es.concat(vendorStream, cssStream)
    .pipe(concat('main.css'))
    .pipe(dest('css/'));
});

gulp.task('js', function() {
  var browserify = require('gulp-browserify');
  var es = require('event-stream');
  var es6ify = require('es6ify');

  var vendorStream = gulp.src([ es6ify.runtime, 'app/js/polyfill.js' ]);

  var jsStream = gulp.src('app/js/main.js')
    .pipe(browserify({
      detectGlobals: true,
      debug: true, // !gulp.env.production
      transform: ['es6ify']
    }));

  return es.concat(vendorStream, jsStream)
    .pipe(concat('main.js'))
    .pipe(dest('js/'));
});

gulp.task('jade', function() {
  var jade = require('gulp-jade');
  var LOCALS = {};

  return gulp.src(paths.jade)
    .pipe(jade({
      locals: LOCALS
    }))
    .pipe(dest());
});

gulp.task('img', function() {
  gulp.src(paths.vendor)
    .pipe(dest('vendor/'));
  return gulp.src(paths.img)
    .pipe(dest('images/'));
});

gulp.task('open', function() {
  var open = require('gulp-open');
  gulp.src('./dist/index.html')
    .pipe(open());
});

gulp.task('watch', function() {
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.jade, ['jade']);
  gulp.watch('app/js/**/*.js', ['js']);
  gulp.watch(paths.img, ['img']);
});

gulp.task('serve', function() {
  //var tlr = require('tiny-lr')();
  var http = require('http');
  var ecstatic = require('ecstatic');
  var PORT = 4040;

  http.createServer(ecstatic({
    root: process.cwd() + '/dist',
    middleware: function(req,res,next) {
      console.log(req);
    }
  })).listen(PORT);
  console.log('Server listening on ' + PORT);

  /*
  tlr.listen(config.livereloadPort);
  gulp.watch('dist/** /*.css', livereload);

  function livereload(event) {
    tlr.changed({
      body: {
        files: path.relative(__dirname, event.path)
      }
    });
  };
  */
});


gulp.task('default', ['css', 'js', 'jade', 'img', 'watch', 'serve']);

var shell = require('gulp-shell');
gulp.task('gh-pages', ['css', 'js', 'jade', 'img'], shell.task([
  'git checkout -b tmp-gh-pages',
  'git add ./dist -f',
  'git commit -m "Build" --no-verify',
  'git push origin :gh-pages &> /dev/null',
  'git subtree push --squash --prefix=dist origin gh-pages',
  'git checkout master',
  'git branch -D tmp-gh-pages',
]));

