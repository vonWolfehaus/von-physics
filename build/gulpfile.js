var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var src = '../src/';

gulp.task('2d', function() {
  return gulp.src([
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
			])
	.pipe(concat('von-physics2.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('../'));
});

gulp.task('3d', function() {
  return gulp.src([
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
			])
	.pipe(concat('von-physics3.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('../'));
});