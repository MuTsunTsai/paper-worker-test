
# paper-worker-test

This project is a proof-of-concept for [paper.js](https://github.com/paperjs/paper.js) to work completely off the DOM thread. The idea consists of several ingredients:

- Create several stub objects (src/worker/worker.ts, line 4-22) to trick paper.js into thinking that it is running in the DOM, so that it would create `CanvasView` and perform rendering.
- If the browser supports `OffscreenCanvas`, pass the object to the web worker to let paper.js directly render on it.
- If the browser doesn't support `OffscreenCanvas`, use our `CanvasProxy` instead, which will capture all manipulations by paper.js on the canvas, and then notify the main thread to repeat the exact same manipulations. This minimize the work load of the main thread (as opposed to the method of using `exportJSON()` and `importJSON()` to transfer rendering result to the main thread).
- In either case, the canvas object is wrapped with extra members (src/worker/CanvasProxy.ts, line 84-92) in order to correctly response to the calling from paper.js.

Needless to say, in this setup paper.js won't be able to react to user interactions. It might be possible to similarly pass the details of user interactions to paper.js on the worker, but for now the main goal of the project is simply to boost the rendering performance. On the demo web page, it repeatedly draws 2000 random lines and 100 circles, and still the rendering speed is quite satisfying.