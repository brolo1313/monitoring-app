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
const { exec } = require('child_process');

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
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on("ready", () => {
    setTimeout(() => createWindow(), 500);

    eventEmitter.on("windowReady", () => {
      // getSystemInfo();
      // webSocketInit();
      // startMonitoring();
    });
  });

  // Quit when all windows are closed.
  app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      electron_1.app.quit();
    }
    logWithColor('app exit', 'red');
  });
  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  logWithColor('App window error was occurred', 'red');
  throw e;
}

ipcMain.on('get-gpu-temperature', async (event) => {
  const gpuData = await si.graphics();
  event.reply('gpu-temperature', gpuData);
});

async function startMonitoring() {
  console.log('startMonitoring start');
  setInterval(async () => {
    const gpuData = await si.graphics();
    const currentLoad = await si.currentLoad();
    const mem = await si.mem();
    const cpu = await si.cpu();
    const users = await si.users();
    const system = await si.system();
    const osInfo = await si.osInfo();
    const battery = await si.battery();
    const wifiConnections = await si.wifiConnections();
    const bios = await si.bios();
    console.log('setInterval works');

    const result = {
      gpuData, currentLoad, cpu ,mem, users, system, osInfo, battery, wifiConnections, bios
    }

    mainWindow.webContents.send('gpu-temperature', result);
  }, 20000);
}


async function getSystemInfo(connection) {
  try {
    const gpuData = await si.graphics();
    const currentLoad = await si.currentLoad();
    const mem = await si.mem();
    const cpu = await si.cpu();
    const users = await si.users();
    const system = await si.system();
    const osInfo = await si.osInfo();
    const battery = await si.battery();
    const wifiConnections = await si.wifiConnections();
    const bios = await si.bios();

    connection.send(JSON.stringify({ gpuData, currentLoad, cpu ,mem, users, system, osInfo, battery, wifiConnections, bios }));
  } catch (error) {
    logWithColor('getSystemInfo has error', 'red', error);
    connection.send('{"error": "Failed to retrieve system information"}');
  }
}

//logic to get event  from client
//   ipcMain.handle("ping", () => {
//       return {
//         nameFromClient: "ping",
//         responseFromServer: "pong",
//         date: new Date(),
//       };
//     });


