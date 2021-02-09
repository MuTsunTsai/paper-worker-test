
/// <reference path="CanvasProxy.ts" />

interface WorkerGlobalScope {
	window: any;
	document: any;
}

self.window = {
	HTMLCanvasElement: self.OffscreenCanvas || CanvasProxy,
	navigator: {},
	addEventListener: () => { }
};

let doc = {
	createElement: () => wrap(new self.window.HTMLCanvasElement(0, 0)),
	addEventListener: () => { },
	body: {},
	documentElement: {}
};

self.document = doc;

importScripts("paper-core.js");

let project!: paper.Project;

let parent: MessagePort;
let updated: Function;
let updating: Promise<void> = Promise.resolve();

onmessage = function(e: MessageEvent) {
	if(e.data.start) {
		parent = e.ports[0];
		let canvas = wrap(e.data.canvas || new CanvasProxy(e.data.width, e.data.height));
		let scope = new paper.PaperScope();
		scope.setup(canvas);
		(project = scope.project).view.autoUpdate = false;

		setTimeout(run, 0);
	}
	if(e.data.done) updated();
}

function random(max: number, min: number = 0) {
	return Math.random() * (max - min) + min;
}

function rand() {
	return Math.floor(random(256));
}

async function run() {
	let { width, height } = project.view.viewSize;

	project.clear();
	for(let i = 0; i < 2000; i++) {
		project.activeLayer.addChild(new paper.Path.Line({
			from: [random(width), random(height)],
			to: [random(width), random(height)],
			strokeColor: `rgb(${rand()},${rand()},${rand()})`
		}));
	}
	for(let i = 0; i < 100; i++) {
		project.activeLayer.addChild(new paper.Path.Circle({
			center: [random(width), random(height)],
			radius: random(50, 20),
			strokeColor: 'black'
		}));
	}
	project.view.update();

	let canvas = project.view.element;
	if(canvas instanceof CanvasProxy) {
		await updating;
		updating = new Promise(resolve => updated = resolve);
		parent.postMessage(canvas.flush());
	}
	setTimeout(run, 0);
}