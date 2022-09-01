
let canvas = document.getElementById("canvas") as HTMLCanvasElement;

canvas.width = 800;
canvas.height = 500;

let worker = new Worker("worker.js");
let channel = new MessageChannel();
channel.port1.onmessage = function(e: MessageEvent) {
	let ctx = canvas.getContext('2d')!;
	let data = e.data as any[][];
	for(let c of data) {
		if(c[0] == "set") (ctx as any)[c[1]] = c[2];
		else(ctx as any)[c.shift()](...c);
	}
	worker.postMessage({ done: true });
};

let option: any = {
	start: true,
	width: canvas.width,
	height: canvas.height
};
let trans: (Transferable | OffscreenCanvas)[] = [channel.port2];
if(typeof (OffscreenCanvas) != "undefined") {
	trans.push(option.canvas = canvas.transferControlToOffscreen());
}
worker.postMessage(option, trans);