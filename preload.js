/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { contextBridge, ipcRenderer, shell } = require("electron");
const electron = require("electron");

contextBridge.exposeInMainWorld("electron", {
  openFile: () => ipcRenderer.invoke("dialog:openDirectory"),
  selectProject: (projectPath) =>
    ipcRenderer.postMessage("select_recent_project", projectPath),
  openExternal: (url) => {
    ipcRenderer.postMessage("external_url", url);
  },
  resizeWindowForProject: () => {
    ipcRenderer.postMessage("resize_window_for_project");
  },
  printFlowchart: () => {
    ipcRenderer.postMessage("print_flowchart");
  },
});

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
