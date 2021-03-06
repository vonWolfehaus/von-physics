var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var src = '../src/';
var bundles = {
	two: [
		src+'vgp.js',
		src+'utils.js',
		src+'lib/Vec2.js',
		src+'lib/LinkedList.js',
		src+'lib/Signal.js',
		src+'physics/Manifold.js',
		src+'physics/physics2.js',
		src+'physics/AABB2.js',
		src+'physics/Radial2.js',
		src+'ObjectPool.js',
		src+'WorldBrute.js'
	],
	three: [
		src+'vgp.js',
		src+'utils.js',
		src+'lib/Vec3.js', // before you build this, change it to whatever 3d library's vector or copy Threejs's!
		src+'lib/LinkedList.js',
		src+'lib/Signal.js',
		src+'physics/Manifold.js',
		src+'physics/physics3.js',
		src+'physics/AABB3.js',
		src+'physics/Radial3.js',
		src+'ObjectPool.js',
		src+'WorldBrute.js'
	]
};


gulp.task('default', ['2d', '3d']);

gulp.task('2d', function() {
  return gulp.src(bundles.two)
	.pipe(concat('von-physics2.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('../'));
});

gulp.task('3d', function() {
  return gulp.src(bundles.three)
	.pipe(concat('von-physics3.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('../'));
});

gulp.task('dev', function() {
	browserSync.init({
		notify: false,
		server: {
			baseDir: ['../', '../examples'],
			index: '../index.html'
		}
	});

	browserSync.watch('../examples/**/*.{html,css,js}').on('change', reload);
	gulp.watch(bundles.two, ['two', reload]);
	gulp.watch(bundles.three, ['three', reload]);
});
