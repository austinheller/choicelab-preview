import { absolutePosition } from "../utils.js";

function drawLines() {
  document.querySelectorAll(".scene").forEach((scene) => {
    const connectIdString = scene.getAttribute("data-connect-to");
    if (!connectIdString) return;
    const connectIds = connectIdString.split(",");
    // Get origin point for connector
    const originRect = absolutePosition(scene);
    const originX = originRect.left - 8 + originRect.width / 2;
    const originY = originRect.top + originRect.height - 10;
    // Find connecting nodes
    connectIds.forEach((connectId) => {
      const connectingScene = document.getElementById(connectId);
      const destinationRect = absolutePosition(connectingScene);
      const destinationX = destinationRect.left - 8 + destinationRect.width / 2;
      const destinationY = destinationRect.top;
      // draw line
      const lineParent = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      lineParent.classList.add("line");
      lineParent.setAttribute("data-connect", connectId);
      line.setAttribute("stroke-width", 1.5);
      lineParent.style.top = 0;
      lineParent.style.left = 0;
      lineParent.style.width = "100%";
      lineParent.style.height = "100%";
      line.setAttribute("y1", originY + 10);
      line.setAttribute("y2", destinationY);
      line.setAttribute("x1", originX - 8);
      line.setAttribute("x2", destinationX - 8);
      lineParent.appendChild(line);
      scene.parentNode.appendChild(lineParent);
    });
  });
}

function positionScenes(props) {
  const path = props.paths[props.pathName];
  const scenes = path.el.querySelectorAll(".scene");
  props.paths[props.pathName].added = true;
  let gotos = [];
  let i = 0;
  function addGotoRow() {
    const gotoRow = document.createElement("div");
    gotoRow.classList.add("goto-row");
    gotoRow.classList.add(`count-${gotos.length}`);
    gotos.forEach((goto) => {
      gotoRow.appendChild(goto);
    });
    props.container.appendChild(gotoRow);
    gotos.length = 0;
  }
  scenes.forEach((scene) => {
    if (scene.classList.contains("goto")) {
      // scene IS goto
      const gotoName = scene.getAttribute("data-goto");
      const gotoPath = props.paths[gotoName];
      gotos.push(scene);
      if (gotoPath.added === false) {
        scene.classList.add("embed-goto");
        const branchContainer = document.createElement("ul");
        branchContainer.classList.add("path");
        branchContainer.setAttribute("data-path", gotoName);
        scene.appendChild(branchContainer);
        positionScenes({
          container: branchContainer,
          paths: props.paths,
          pathName: gotoName,
        });
      }
    } else {
      // scene NOT goto
      if (gotos.length > 0) {
        addGotoRow();
      }
      let sceneRow = document.createElement("div");
      sceneRow.classList.add("row");
      // specify connecting scenes
      let connectToIds = [];
      const connectToScene = scenes[i + 1];
      if (connectToScene) {
        if (connectToScene.classList.contains("goto")) {
          // connecting scene IS a goto
          let breakOnNext = false;
          for (let a = 0; a < scenes.length; a++) {
            if (a < i + 1) continue;
            const testScene = scenes[a];
            if (testScene.classList.contains("goto")) {
              connectToIds.push(testScene.getAttribute("id"));
            } else {
              if (breakOnNext === false) {
                breakOnNext = true;
                connectToIds.push(testScene.getAttribute("id"));
              } else {
                break;
              }
            }
          }
        } else {
          // connecting scene NOT a goto
          connectToIds.push(connectToScene.getAttribute("id"));
        }
        // set connect attribute
        scene.setAttribute("data-connect-to", connectToIds.toString());
      }

      sceneRow.appendChild(scene);
      props.container.appendChild(sceneRow);
    }
    i++;
  });
  if (gotos.length > 0) {
    addGotoRow();
  }
}

function positionScenesAsFlowchart() {
  const container = document.querySelector("#flowchart");
  const paths = {};
  const pathEls = document.querySelectorAll(".path");
  pathEls.forEach((el) => {
    const pathName = el.getAttribute("data-path");
    paths[pathName] = {
      name: pathName,
      added: false,
      el: el,
    };
  });
  positionScenes({
    container: container,
    paths: paths,
    pathName: "start",
  });
  // lay out path labels
  document.querySelectorAll(".path-label").forEach((label) => {});
  // draw lines
  setTimeout(() => {
    drawLines();
  }, 50);
}

export { positionScenesAsFlowchart };
