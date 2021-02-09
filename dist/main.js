"use strict";
let canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 500;
let worker = new Worker("worker.js");
let channel = new MessageChannel();
channel.port1.onmessage = function (e) {
    let ctx = canvas.getContext('2d');
    let data = e.data;
    for (let c of data) {
        if (c[0] == "set")
            ctx[c[1]] = c[2];
        else
            ctx[c.shift()](...c);
    }
    worker.postMessage({ done: true });
};
let option = {
    start: true,
    width: canvas.width,
    height: canvas.height
};
let trans = [channel.port2];
if (typeof (OffscreenCanvas) != "undefined") {
    trans.push(option.canvas = canvas.transferControlToOffscreen());
}
worker.postMessage(option, trans);
