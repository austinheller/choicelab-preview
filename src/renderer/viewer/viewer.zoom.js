import {
  getSetting,
  updateSetting,
  getSessionSetting,
  updateSessionSetting,
} from "./viewer.settings.js";

var scale = getSetting("zoom");

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
  if (newZoom > 1.2) {
    newZoom = 1.2;
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
  if (newZoom < 0.35) {
    newZoom = 0.35;
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
  pointerXPercent = e.x / window.innerWidth;
  pointerYPercent = e.y / window.innerHeight;
  console.log(pointerXPercent, pointerYPercent);
});

// https://kenneth.io/post/detecting-multi-touch-trackpad-gestures-in-javascript
function enablePinchToZoom() {
  const flowchart = document.querySelector("#flowchart");

  var render = () => {
    window.requestAnimationFrame(() => {
      if (scale < 0.35) scale = 0.35;
      if (scale > 1.2) scale = 1.2;
      var val = `scale(${scale})`;
      updateSetting("zoom", scale);
      flowchart.style.transform = val;
      // Here, we need to find a way to take the pointer's % on the screen, and negotiate that with the scroll position of the flowchart.
    });
  };

  window.addEventListener("wheel", (e) => {
    if (e.ctrlKey) {
      scale -= e.deltaY * 0.0015;
      updateSetting("zoom", scale);
      render();
    }
  });
}

export { setZoom, zoomIn, zoomOut, enablePinchToZoom };
