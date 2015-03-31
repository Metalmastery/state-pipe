var gulp = require('gulp');
var concat = require('gulp-concat');
var wrap = require('gulp-wrap-umd');
var runSequence = require('run-sequence');

gulp.task('scripts', function() {
    return gulp.src(['src/flowhandler.js', 'src/pipestep.js', 'src/pipe.js', 'src/flow.js'])
        .pipe(concat('flow.pipe.js'))
        .pipe(wrap({
            namespace : 'Flow',
            exports : 'Flow'
        }))
        .pipe(gulp.dest('./bin'));
});

gulp.task('default', function() {
    runSequence(['scripts'])
});