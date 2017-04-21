/**
 * 组件安装
 * npm install gulp gulp-imagemin gulp-sass-china gulp-order gulp-minify-css gulp-jshint gulp-uglify gulp-rename gulp-concat gulp-clean gulp-htmlmin gulp-connect --save-dev
 */

// 引入 gulp及组件
var gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    sass = require('gulp-sass-china'),
    order = require("gulp-order"),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    htmlmin = require('gulp-htmlmin'),
    connect = require('gulp-connect');

// 帮助

gulp.task('default', function() {

    console.log('\n\n')

    console.log(' · gulp build              文件打包\n');

    console.log(' · gulp watch              文件监控打包\n');

    console.log(' · gulp help               gulp参数说明\n');

    console.log(' · gulp server             测试server\n');

    console.log('\n\n')

});


// HTML处理
gulp.task('html', function() {
    var htmlSrc = './src/*.html',
        htmlDst = './dist';
    gulp.src(htmlSrc)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(htmlDst))
});

gulp.task('styles', function() {
    var cssSrc = './src/styles/main.scss',
        cssDst = './dist/styles/';

    return gulp.src(cssSrc)
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(gulp.dest(cssDst))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(cssDst));
});

gulp.task('images', function() {
    var imgSrc = './src/images/**/*',
        imgDst = './dist/images';
    return gulp.src(imgSrc)
        .pipe(imagemin())
        .pipe(gulp.dest(imgDst));
})

gulp.task('scripts', function() {
    var jsSrc = './src/scripts/**/*.js',
        jsDst = './dist/scripts';

    return gulp.src(jsSrc)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(order([
            "vendor/**/*.js",
            "translator/**/*.js",
            "view/**/*.js"
        ]))
        .pipe(concat('main.js'))
        .pipe(gulp.dest(jsDst))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest(jsDst));
});

gulp.task('video', function() {
    var vSrc = './src/video/**/*.*',
        vDst = './dist/video';
    return gulp.src(vSrc)
        .pipe(gulp.dest(vDst));
})

gulp.task('fonts', function() {
    var vSrc = './src/fonts/**/*.*',
        vDst = './dist/fonts';
    return gulp.src(vSrc)
        .pipe(gulp.dest(vDst));
})

gulp.task('clean', function() {
    return gulp.src(['./dist/styles', './dist/scripts', './dist/images'], { read: false })
        .pipe(clean());
});

gulp.task('build', [ 'styles', 'images', 'video', 'fonts', 'scripts', 'html'],function(){
    // gulp.start('server');
});

gulp.task('server', function() {
    var port = 80;
    connect.server({
        root: 'dist/',
        port: port,
        livereload: true
    });
    console.log('--------------------------------------------');
    console.log('Server On : http://127.0.0.1:' + port + '/world.html');
    console.log('--------------------------------------------');
});

gulp.task('watch', function() {
    gulp.watch('./src/*.html', ['html']);
    gulp.watch('./src/styles/**/*.scss', ['styles']);
    gulp.watch('./src/images/**/*', ['images']);
    gulp.watch('./src/scripts/**/*.js', ['scripts']);

});
