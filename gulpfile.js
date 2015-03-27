var gulp = require('gulp');
var concat = require('gulp-concat');
var wrap = require('gulp-wrap-umd');
var runSequence = require('run-sequence');

gulp.task('scripts', function() {
    return gulp.src(['src/flowhandler.js', 'src/pipestep.js', 'src/pipe.js', 'src/sequencer.js'])
        .pipe(concat('state.pipe.js'))
        .pipe(wrap({
            namespace : 'Sequencer',
            exports : 'Sequencer'
        }))
        .pipe(gulp.dest('./bin'));
});

gulp.task('default', function() {
    runSequence(['scripts'])
});