let gulp = require('gulp');
let ts = require('gulp-typescript');
let ifAnyNewer = require('gulp-if-any-newer');

let projMain = ts.createProject('src/main/tsconfig.json');
let projWorker = ts.createProject('src/worker/tsconfig.json');

gulp.task('buildMain', () =>
	projMain.src()
		.pipe(ifAnyNewer("dist", { filter: 'main.js' }))
		.pipe(projMain())
		.pipe(gulp.dest('dist'))
);

gulp.task('buildWorker', () =>
	projWorker.src()
		.pipe(ifAnyNewer("dist", { filter: 'worker.js' }))
		.pipe(projWorker())
		.pipe(gulp.dest('dist'))
);

gulp.task('pause', cb => setTimeout(cb, 1000));

gulp.task('default', gulp.series('buildMain', 'buildWorker', 'pause'));
