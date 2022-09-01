let gulp = require('gulp');
let ts = require('gulp-typescript');
let newer = require('gulp-newer');

let projMain = ts.createProject('src/main/tsconfig.json');
let projWorker = ts.createProject('src/worker/tsconfig.json');

gulp.task('buildMain', () =>
	projMain.src()
		.pipe(newer("dist/main.js"))
		.pipe(projMain())
		.pipe(gulp.dest('docs'))
);

gulp.task('buildWorker', () =>
	projWorker.src()
		.pipe(newer("dist/worker.js"))
		.pipe(projWorker())
		.pipe(gulp.dest('docs'))
);

gulp.task('default', gulp.series('buildMain', 'buildWorker'));
