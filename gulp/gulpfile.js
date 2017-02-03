"use strict";

const gulp = require('gulp'),
    less = require('gulp-less'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber');

gulp.task('less', () => {
    gulp.src('./less/*.less')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(less())
        .pipe(gulp.dest('../public/css'));
});

gulp.task('watch', () => {
   gulp.watch('./less/*.less', ['less']);
});

gulp.task('default', ['watch', 'less']);