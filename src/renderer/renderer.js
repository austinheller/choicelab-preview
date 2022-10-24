/* global Choicelab */

import {
  setZoom,
  zoomIn,
  zoomOut,
  enablePinchToZoom,
} from "./viewer/viewer.zoom.js";
import { Flowchart } from "./viewer/viewer.createPathEls.js";
import { Toolbar } from "./viewer/viewer.toolbar.js";
import { positionScenesAsFlowchart } from "./viewer/viewer.positionScenes.js";
import {
  getSetting,
  updateSetting,
  getSessionSetting,
  updateSessionSetting,
} from "./viewer/viewer.settings.js";
import { absolutePosition } from "./utils.js";

function getProjectNameFromPath(path) {
  if (typeof path !== "string") return false;
  const pathElsRaw = path.split(/([^\\^/]+)/g);
  let pathEls = [];
  pathElsRaw.forEach((el) => {
    if (el.trim() === "" || el === "/" || el === "\\") {
      return;
    }
    pathEls.push(el);
  });
  const projectName = pathEls[pathEls.length - 1];
  return projectName;
}

function getRecentProjects() {
  const container = document.querySelector("#recent-projects");
  let projectPaths = getSetting("recent_projects");
  let selectEl = false;
  if (!projectPaths) {
    projectPaths = [];
    updateSetting("recent_projects", projectPaths);
  } else {
    selectEl = document.createElement("select");
    if (projectPaths.length === 0) {
      selectEl.setAttribute("disabled", "disabled");
    }
    // Create default option
    const defaultEl = document.createElement("option");
    defaultEl.innerText = "Open Recent";
    selectEl.appendChild(defaultEl);
    // Create options for each project
    projectPaths.forEach((path) => {
      const name = getProjectNameFromPath(path);
      const el = document.createElement("option");
      el.setAttribute("value", path);
      el.innerText = name;
      selectEl.appendChild(el);
    });
    // Create option for disabled
    const separatorEl = document.createElement("option");
    separatorEl.innerText = "–";
    separatorEl.setAttribute("disabled", "disabled");
    selectEl.appendChild(separatorEl);
    const clearEl = document.createElement("option");
    clearEl.innerText = "Clear Menu";
    clearEl.value = "_clearMenu";
    selectEl.appendChild(clearEl);
  }
  return selectEl;
}

document.addEventListener("DOMContentLoaded", () => {
  const recentProjectsEl = getRecentProjects();
  const container = document.querySelector("#recent-projects");
  container.appendChild(recentProjectsEl);
  recentProjectsEl.addEventListener("change", (e) => {
    const value = e.target.value;
    if (value === "_clearMenu") {
      updateSetting("recent_projects", []);
    } else {
      setProjectPath(value);
      window.electron.selectProject(value);
    }
    window.location.reload();
  });
});

async function openProject() {
  const filePath = await window.electron.openFile();
  setProjectPath(filePath);
  window.location.reload();
}

function setProjectPath(filePath) {
  window.sessionStorage.setItem("projectPath", filePath);
}

function loadProject() {
  const existingPath = window.sessionStorage.getItem("projectPath");
  if (
    existingPath !== null &&
    existingPath !== "undefined" &&
    existingPath !== ""
  ) {
    Choicelab.create({
      projectPath: existingPath,
      stage: "#root",
      electron: true,
    });
    document.body.classList.add("project-loaded");
  }
}

const btn = document.getElementById("btn");

btn.addEventListener("click", async () => {
  openProject();
});

document.addEventListener("DOMContentLoaded", () => {
  loadProject();
});

function loadViewer() {
  let recentProjects = getSetting("recent_projects");
  if (!recentProjects) {
    recentProjects = [];
  }
  const projectPath = window.sessionStorage.getItem("projectPath");
  if (!recentProjects.includes(projectPath)) {
    recentProjects.push(projectPath);
  }
  updateSetting("recent_projects", recentProjects);
  // set up the app, do the stuff
  class App extends React.Component {
    render() {
      return (
        <>
          <Toolbar />
          <div id="flowchart"></div>
          <Flowchart />
        </>
      );
    }
    componentDidMount() {
      // position scenes
      positionScenesAsFlowchart();

      // enable smooth scroll (done in JS because it would otherwise distractingly smooth-scroll on refresh)
      setTimeout(() => {
        document.querySelector("html").style.scrollBehavior = "smooth";
      }, 1000);

      // set scroll position
      // try getting a session setting first; if not; use what's stored
      setInterval(() => {
        updateSessionSetting("scroll_position", {
          x: window.scrollX,
          y: window.scrollY,
        });
      }, 1000);
      let scroll = getSessionSetting("scroll_position");
      if (scroll !== null) {
        window.scrollTo(scroll.x, scroll.y);
      } else {
        window.electron.resizeWindowForProject();
        const firstScene = document.querySelector(
          "#flowchart > div:first-of-type .scene > .contents"
        );
        if (firstScene) {
          const position = absolutePosition(firstScene);
          window.scrollTo(position.left - 600, 0);
        }
      }

      // disable buttons in actions
      document.querySelectorAll(".actions button").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
        });
      });

      enablePinchToZoom();

      const initialZoom = getSetting("zoom") ? getSetting("zoom") : 1.0;
      updateSetting("zoom", initialZoom);
      setTimeout(() => {
        setZoom(initialZoom);
      }, 50);
      document.addEventListener("keydown", (e) => {
        if (e.code === "Equal") {
          if (e.ctrlKey === true || e.metaKey === true) {
            e.preventDefault();
            zoomIn();
          }
        }
        if (e.code === "Minus") {
          if (e.ctrlKey === true || e.metaKey === true) {
            e.preventDefault();
            zoomOut();
          }
        }
      });
      // enable goto links
      function scrollToTargetAdjusted(element, headerOffset) {
        var elementPosition = absolutePosition(element);
        var positionTop = elementPosition.top - headerOffset;
        // elementPosition.top + window.pageYOffset - headerOffset;
        var positionLeft = elementPosition.left;
        window.scrollTo({
          top: positionTop,
          left: positionLeft,
          behavior: "smooth",
        });
      }
      document.querySelectorAll(".goto-link").forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const gotoName = link.getAttribute("data-goto");
          const matchingEl = document.querySelector(
            `.embed-goto[data-goto="${gotoName}"]`
          );
          scrollToTargetAdjusted(matchingEl, 45);
          console.log(link, matchingEl);
        });
      });
    }
  }

  ReactDOM.render(<App />, document.getElementById("root"));
}

Choicelab.on("scenesParsed", "loadViewer", () => {
  loadViewer();
});
