// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  ipcMain,
  dialog,
  shell,
} = require("electron");
const path = require("path");
const express = require("express");
const fs = require("fs");
const mime = require("mime-types");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const cheerio = require("cheerio");
const Store = require("electron-store");
const store = new Store();
const gracefulShutdown = require("http-graceful-shutdown");

function getContentType(url) {
  var type = mime.lookup(url);
  return type;
}

function stripParamsFromUrl(url) {
  return url.split(/[?#]/)[0];
}

let server = null;
let serverListener = null;
let serverPort = null;
let closeServer = null;
let closeLivereload = null;

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (canceled) {
    return;
  } else {
    handleStartServer(filePaths[0]);
    return filePaths[0];
  }
}

async function handleStartServer(projectPath) {
  if (closeServer !== null) {
    await closeServer();
    await closeLivereload();
  }
  startServer(projectPath);
}

function startServer(projectPath) {
  server = express();
  const liveReloadServer = livereload.createServer({
    extraExts: ["path"],
    port: 35729,
  });
  liveReloadServer.watch(projectPath);
  closeLivereload = gracefulShutdown(liveReloadServer);
  server.use(connectLivereload());
  server.use(express.static("/"));
  store.set("projectPath", projectPath);

  server.get("/", function (req, res) {
    var publicPath = path.resolve(projectPath, "./index.html");
    var html = fs.readFileSync(publicPath, "utf8");
    var $ = cheerio.load(html);
    var scriptNode = '<script>window.ChoicelabMode = "development";</script>';
    $("body").append(scriptNode);
    res.send($.html());
  });

  server.get(
    /^(\/*)\b(?!node_modules|build|flow)\b\S+(\/*)/,
    function (req, res) {
      // Resolve url
      var publicPath = path.resolve(projectPath + req.originalUrl);
      // Strip params from url
      publicPath = stripParamsFromUrl(publicPath);
      // Get content type
      var contentType = getContentType(publicPath);
      if (contentType) {
        req.headers["Content-Type"] = contentType;
      }
      res.sendFile(publicPath);
    }
  );

  serverPort = process.env.PORT || 8000;
  serverListener = server.listen(serverPort);
  closeServer = gracefulShutdown(serverListener);
}

function setMenus(flowchartLoaded) {
  const menuTemplate = [
    { role: "appMenu" },
    {
      label: "File",
      submenu: [
        {
          label: "Print...",
          click: () => {
            printFlowchart();
          },
          visible: flowchartLoaded === true ? true : false,
        },
        {
          label: "Save as PDF...",
          click: () => {
            savePDF();
          },
          visible: flowchartLoaded === true ? true : false,
        },
        {
          role: "close",
          label: flowchartLoaded === true ? "Close Project" : "Close Window",
        },
      ],
    },
    { role: "editMenu" },
    {
      label: "View",
      submenu: [
        {
          role: "reload",
        },
        {
          role: "toggleDevTools",
        },
      ],
    },
    { role: "windowMenu" },
    {
      label: "Help",
      submenu: [
        {
          label: "Choicelab Guides",
          click: () => {
            shell.openExternal(`https://choicelab.xyz/guides/`);
          },
        },
        {
          label: "Report an Issue",
          submenu: [
            {
              label: "This Application",
              click: () => {
                shell.openExternal(
                  `https://github.com/austinheller/choicelab-preview/issues`
                );
              },
            },
            {
              label: "Playback Engine",
              click: () => {
                shell.openExternal(
                  `https://github.com/austinheller/choicelab/issues`
                );
              },
            },
          ],
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const iconPath = path.resolve(__dirname, "./assets/icon.png");
  // Create the browser window.
  setMenus(false);
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    titleBarStyle: "hidden",
    trafficLightPosition: {
      x: 13,
      y: 13,
    },
    icon: iconPath,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

function printFlowchart() {
  const mainWindow = BrowserWindow.getFocusedWindow();
  const contents = mainWindow.webContents;
  contents.print();
}

function savePDF() {
  const mainWindow = BrowserWindow.getFocusedWindow();
  const contents = mainWindow.webContents;
  contents.printToPDF({}).then((data) => {
    dialog
      .showSaveDialog(mainWindow, {
        defaultPath: "Flowchart.pdf",
        properties: "createDirectory",
      })
      .then((props) => {
        if (props.canceled === false) {
          let filePath = props.filePath;
          // Check for PDF extension
          let hasExtension = filePath.match(/\.pdf$/g);
          if (!hasExtension) {
            filePath += ".pdf";
          }
          // Write file
          fs.writeFileSync(filePath, data);
        }
      });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle("dialog:openDirectory", handleFileOpen);
  ipcMain.on("select_recent_project", (e, projectPath) => {
    handleStartServer(projectPath);
  });
  ipcMain.on("external_url", (e, url) => {
    shell.openExternal(`http://localhost:${serverPort}`);
  });
  createWindow();
  ipcMain.on("resize_window_for_project", (e) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    mainWindow.setSize(1000, 700);
    mainWindow.setResizable(true);
    setMenus(true);
  });
  ipcMain.on("print_flowchart", (e) => {
    printFlowchart();
  });
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", async function () {
  await closeServer();
  await closeLivereload();
  console.log("server closed");
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
