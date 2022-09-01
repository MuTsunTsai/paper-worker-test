"use strict";
class CanvasProxy {
    constructor(width, height) {
        this.instructions = [];
        this.width = width;
        this.height = height;
        let data = CanvasProxy.CreateContextData(this);
        this.context = new Proxy(data, CanvasProxy.CreateContextHandler(this));
    }
    static CreateContextData(self) {
        return {
            prop: {
                canvas: self,
                direction: "ltr",
                fillStyle: "#000000",
                filter: "none",
                font: "10px sans-serif",
                globalAlpha: 1,
                globalCompositeOperation: "source-over",
                imageSmoothingEnabled: true,
                imageSmoothingQuality: "low",
                lineCap: "butt",
                lineDashOffset: 0,
                lineJoin: "miter",
                lineWidth: 1,
                miterLimit: 10,
                shadowBlur: 0,
                shadowColor: "rgba(0, 0, 0, 0)",
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                strokeStyle: "#000000",
                textAlign: "start",
                textBaseline: "alphabetic",
            },
            method: {
                getImageData() { return { data: [0, 0, 0, 0] }; }
            }
        };
    }
    static CreateContextHandler(self) {
        return {
            get: function (obj, prop) {
                if (prop in obj.prop)
                    return obj.prop[prop];
                return obj.method[prop] = obj.method[prop] || function (...args) {
                    self.instructions.push([prop, ...args]);
                };
            },
            set: function (obj, prop, value) {
                if (prop in obj.prop) {
                    obj.prop[prop] = value;
                    self.instructions.push(["set", prop, value]);
                    return true;
                }
                return false;
            }
        };
    }
    getContext() { return this.context; }
    flush() {
        let result = this.instructions;
        this.instructions = [];
        return result;
    }
}
function wrap(canvas) {
    if (!canvas)
        return undefined;
    canvas.getAttribute = () => undefined;
    canvas.setAttribute = canvas.addEventListener = () => undefined;
    canvas.hasAttribute = () => false;
    canvas.style = {};
    canvas.ownerDocument = doc;
    return canvas;
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
let project;
let parent;
let updated;
let updating = Promise.resolve();
onmessage = function (e) {
    if (e.data.start) {
        parent = e.ports[0];
        let canvas = wrap(e.data.canvas || new CanvasProxy(e.data.width, e.data.height));
        let scope = new paper.PaperScope();
        scope.setup(canvas);
        (project = scope.project).view.autoUpdate = false;
        setTimeout(run, 0);
    }
    if (e.data.done)
        updated();
};
function random(max, min = 0) {
    return Math.random() * (max - min) + min;
}
function rand() {
    return Math.floor(random(256));
}
async function run() {
    let { width, height } = project.view.viewSize;
    project.clear();
    for (let i = 0; i < 2000; i++) {
        project.activeLayer.addChild(new paper.Path.Line({
            from: [random(width), random(height)],
            to: [random(width), random(height)],
            strokeColor: `rgb(${rand()},${rand()},${rand()})`
        }));
    }
    for (let i = 0; i < 100; i++) {
        project.activeLayer.addChild(new paper.Path.Circle({
            center: [random(width), random(height)],
            radius: random(50, 20),
            strokeColor: 'black'
        }));
    }
    project.view.update();
    let canvas = project.view.element;
    if (canvas instanceof CanvasProxy) {
        await updating;
        updating = new Promise(resolve => updated = resolve);
        parent.postMessage(canvas.flush());
    }
    setTimeout(run, 0);
}
