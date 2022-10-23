import {
  getSetting,
  updateSetting,
  getSessionSetting,
  updateSessionSetting,
} from "./viewer.settings.js";

var scale = getSetting("zoom");
var scaleMin = 0.35,
  scaleMax = 1;

function setZoom(value) {
  value = parseFloat(value).toFixed(1);
  document.querySelector("#flowchart").style.transform = `scale(${value})`;
  scale = value;
  updateSetting("zoom", value);
}

function zoomIn() {
  // const zoom = getSetting("zoom");
  const step = 0.2;
  let newZoom = parseFloat(scale) + step;
  if (newZoom > scaleMax) {
    newZoom = scaleMax;
  }
  newZoom = parseFloat(newZoom).toFixed(1);
  const flowchart = document.querySelector("#flowchart");
  flowchart.style.transform = `scale(${newZoom})`;
  flowchart.style.transition = "transform 0.2s ease";
  setTimeout(() => {
    flowchart.style.transition = "none";
  }, 200);
  scale = newZoom;
  updateSetting("zoom", newZoom);
}

function zoomOut() {
  // const zoom = getSetting("zoom");
  const step = 0.2;
  let newZoom = parseFloat(scale) - step;
  if (newZoom < scaleMin) {
    newZoom = scaleMin;
  }
  newZoom = parseFloat(newZoom).toFixed(2);
  const flowchart = document.querySelector("#flowchart");
  flowchart.style.transform = `scale(${newZoom})`;
  flowchart.style.transition = "transform 0.2s ease";
  setTimeout(() => {
    flowchart.style.transition = "none";
  }, 200);
  scale = newZoom;
  updateSetting("zoom", newZoom);
}

function getTransformSize(el) {
  var matrix = window.getComputedStyle(el).webkitTransform,
    data;
  if (matrix != "none") {
    data = matrix.split("(")[1].split(")")[0].split(",");
  } else {
    data = [1, null, null, 1];
  }
  return data;
}

var pointerXPercent = 0,
  pointerYPercent = 0;

document.addEventListener("pointermove", (e) => {
  pointerXPercent = -1 + (e.x / window.innerWidth) * 2;
  pointerYPercent = 0 + (e.y / window.innerHeight) * 3;
});

// https://kenneth.io/post/detecting-multi-touch-trackpad-gestures-in-javascript
function enablePinchToZoom() {
  const flowchart = document.querySelector("#flowchart");

  var render = () => {
    window.requestAnimationFrame(() => {
      if (scale < scaleMin) scale = scaleMin;
      if (scale > scaleMax) scale = scaleMax;
      var val = `scale(${scale})`;
      updateSetting("zoom", scale);
      const pointerFactorX = 10 / scale;
      const pointerFactorY = 10 / scale;
      window.scrollTo({
        left: window.scrollX + pointerXPercent * pointerFactorX,
        top: window.scrollY + pointerYPercent * pointerFactorY,
        behavior: "instant",
      });
      flowchart.style.transform = val;
    });
  };

  window.addEventListener("wheel", (e) => {
    if (e.ctrlKey) {
      scale -= e.deltaY * 0.0008;
      updateSetting("zoom", scale);
      render();
    }
  });
}

export { setZoom, zoomIn, zoomOut, enablePinchToZoom };
