// main.js
const { app, BrowserWindow, ipcMain } = require("electron");

const electron_1 = require("electron");
const path = require("path");
const si = require("systeminformation");
const { loadAppUrl, getEnvUrls } = require("./helpers/loadUrl");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../electron/preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true,
    },
  });

  const { localEnv, buildEnv, isLocalTest } = getEnvUrls();
  loadAppUrl(mainWindow, localEnv, buildEnv, isLocalTest);

  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      console.error(
        `Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`
      );
      // You can display a fallback page or a custom error message here
      loadAppUrl(mainWindow, localEnv, buildEnv, isLocalTest);
    }
  );

  require("electron-reloader")(module);
  mainWindow.webContents.openDevTools();

  return mainWindow;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on("ready", () => {
    ipcMain.handle('ping', () => 'pong');
    setTimeout(createWindow, 400);
  });
  // Quit when all windows are closed.
  app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      electron_1.app.quit();
    }
  });
  app.on("activate", () => {
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

  return { gpuData, cpuTemp };
});
