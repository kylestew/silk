import "./style.css";

import Sketch from "./src/sketch";
import createState from "./src/state";
import createGUI from "./src/gui";

import Stats from "stats.js";

let state, sketch;
let stats, prevTime;
let capture,
  isCapturing = false;
let saveNextFrame = false;

init();
animate();

function init() {
  sketch = new Sketch();

  window.onresize = onWindowResize;
  onWindowResize(); // set initial size

  state = createState(updateState);
  updateState(); // push initial state

  createGUI(state);

  capture = new CCapture({ format: "png" });

  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

function updateState() {
  sketch.updateState(state);
}

function animate(time) {
  if (isNaN(time)) time = 0;
  if (prevTime === undefined) prevTime = time;
  const deltaTime = Math.max(time - prevTime, 0);
  prevTime = time;

  if (stats) stats.begin();

  sketch.render(time / 1000.0, deltaTime / 1000.0, state);

  if (isCapturing) {
    let canvas = document.getElementById("render-canvas");
    capture.capture(canvas);
  } else if (saveNextFrame) {
    saveFrame();
    saveNextFrame = false;
  }

  if (stats) stats.end();

  requestAnimationFrame(animate);
}

function onWindowResize() {
  sketch.resize({
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio,
  });
}

window.onkeydown = function (evt) {
  if (evt.key == "s") {
    saveNextFrame = true;
  } else if (evt.key == "r" && !evt.metaKey) {
    if (!isCapturing) {
      isCapturing = true;
      capture.start();
      console.log("recording...");
    } else {
      isCapturing = false;
      capture.stop();
      capture.save();
      console.log("recording ended");
    }
  }
};

function download(dataURL, name) {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = name;
  link.click();
}

function saveFrame() {
  let canvas = document.getElementById("render-canvas");
  var dataURL = canvas.toDataURL("image/png");
  download(dataURL, "image");
}
