// main.js
const { app, BrowserWindow, ipcMain } = require("electron");

const electron_1 = require("electron");
const path = require("path");
const si = require("systeminformation");
const { loadAppUrl, getEnvUrls } = require("./helpers/loadUrl");
const { logWithColor, showMessage } = require("./helpers/functions");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
const { autoUpdater, AppUpdater } = require("electron-updater");


let mainWindow; // Define win globally

//Basic flags
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;




function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../electron/preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true,
    },
  });

  mainWindow.setResizable(false);

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

  if (mainWindow instanceof BrowserWindow) {
    eventEmitter.emit("windowReady");
  }

  return mainWindow;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 500 ms to fix the black background issue while using transparent window.
  app.on("ready", () => {
    setTimeout(() => createWindow(), 500);

    eventEmitter.on("windowReady", () => {
      if (mainWindow) {
         setTimeout(() => {
          showMessage(
            `Checking for updates. Current version ${app.getVersion()}`,
            mainWindow
          ),
          autoUpdater.checkForUpdatesAndNotify();
         }, 5000);
    
        // Now start the monitoring
        startMonitoring();
      } else {
        console.error("mainWindow is not initialized");
      }
    });
  });

  // Quit when all windows are closed.
  app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      electron_1.app.quit();
    }
    logWithColor("app exit", "red");
  });
  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  logWithColor("App window error was occurred", "red");
  throw e;
}

async function startMonitoring() {
  logWithColor("startMonitoring", "yellow");

  // Initialize variables to store data that doesn't need to be fetched repeatedly
  let cachedCpu, cachedUsers, cachedSystem, cachedOsInfo, cachedBios;

  // Fetch and cache the data that doesn't change frequently
  if (
    !cachedCpu ||
    !cachedUsers ||
    !cachedSystem ||
    !cachedOsInfo ||
    !cachedBios
  ) {
    try {
      cachedCpu = await si.cpu();
      cachedUsers = await si.users();
      cachedSystem = await si.system();
      cachedOsInfo = await si.osInfo();
      cachedBios = await si.bios();

      logWithColor("Cached data has been received", "green");
    } catch {
      logWithColor("cached data ain't fetched", "red", error);
    }
  }

  setInterval(async () => {
    try {
      const gpuData = await si.graphics();
      const currentLoad = await si.currentLoad();
      const mem = await si.mem();
      const battery = await si.battery();
      const wifiConnections = await si.wifiConnections();

      const result = {
        gpuData,
        currentLoad,
        mem,
        battery,
        wifiConnections,
        cpu: cachedCpu,
        users: cachedUsers,
        system: cachedSystem,
        osInfo: cachedOsInfo,
        bios: cachedBios,
      };

      logWithColor("data is complete", "green");
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send("system-monitoring-data", result);
      }
    } catch {
      logWithColor("data not received", "red", error);
    }
  }, 10000);
}



/*New Update Available*/
autoUpdater.on("update-available", (info) => {
  showMessage(`Update available. Current version ${app.getVersion()}`);
  let pth = autoUpdater.downloadUpdate();
 showMessage(pth);
});

autoUpdater.on("update-not-available", (info) => {
  showMessage(`No update available. Current version ${app.getVersion()}`);
});

/*Download Completion Message*/
autoUpdater.on("update-downloaded", (info) => {
  showMessage(`Update downloaded. Current version ${app.getVersion()}`);
});

autoUpdater.on("error", (info) => {
  curWindow.showMessage(info);
});
