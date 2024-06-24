// main.js
const { app, BrowserWindow, ipcMain } = require("electron");

const electron_1 = require("electron");
const path = require("path");
const si = require("systeminformation");

function createWindow() {
  const mainWindow = new electron_1.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../electron/preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true,
    },
  });

  const indexPath = path.join(__dirname, "../dist/browser/index.html");
  mainWindow.loadFile(indexPath);

  require("electron-reloader")(module);
  mainWindow.webContents.openDevTools();

  return mainWindow;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  electron_1.app.on("ready", () => setTimeout(createWindow, 400));
  // Quit when all windows are closed.
  electron_1.app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      electron_1.app.quit();
    }
  });
  electron_1.app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  console.log("App window error was occurred", e);
  throw e;
}

// Handle IPC calls for system information
ipcMain.handle("get-system-info", async () => {
  const gpuData = await si.graphics();
  const cpuTemp = await si.cpuTemperature();
  console.log("gpuData");
  return { gpuData, cpuTemp };
});
