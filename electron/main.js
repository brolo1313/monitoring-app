// main.js
const { app, BrowserWindow, ipcMain } = require("electron");

const electron_1 = require("electron");
const path = require("path");
const WebSocket = require("ws");
const si = require("systeminformation");
const { loadAppUrl, getEnvUrls } = require("./helpers/loadUrl");
const { logWithColor } = require("./helpers/functions");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
const { exec } = require("child_process");

let mainWindow; // Define win globally

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
      startMonitoring();
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

// ipcMain.on("get-gpu-temperature", async (event) => {
//   const gpuData = await si.graphics();
//   event.reply("system-monitoring-data", gpuData);
// });

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
      mainWindow.webContents.send("system-monitoring-data", result);
    } catch {
      logWithColor("data not received", "red", error);
    }
  }, 10000);
}

//logic to get event  from client
//   ipcMain.handle("ping", () => {
//       return {
//         nameFromClient: "ping",
//         responseFromServer: "pong",
//         date: new Date(),
//       };
//     });
