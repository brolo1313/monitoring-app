// main.js
const { app, BrowserWindow, ipcMain } = require("electron");

const electron_1 = require("electron");
const path = require("path");
const WebSocket = require("ws");
const si = require("systeminformation");
const { loadAppUrl, getEnvUrls } = require("./helpers/loadUrl");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
const { exec } = require('child_process');


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
      webSocketInit();
    });
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


async function getSystemInfo(connection) {
  try {
    const gpuData = await si.graphics();
    const cpuTemp = await si.cpuTemperature();
    const currentLoad = await si.currentLoad();
    const mem = await si.mem();
    const cpu = await si.cpu();
    const cpuCurrentSpeed = await si.cpuCurrentSpeed();
    const users = await si.users();
    const system = await si.system();
    const bios = await si.bios();

    connection.send(JSON.stringify({ gpuData, cpuTemp, currentLoad, cpu, cpuCurrentSpeed ,mem, users, system, bios }));
  } catch (error) {
    console.log("getSystemInfo has error", error);
    connection.send('{"error": "Failed to retrieve system information"}');
  }
}

function webSocketInit() {
  console.log("webSocketInit run");
  // WebSocket server
  const wss = new WebSocket.Server({ port: 8080 });

  wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", async (message) => {
      const messageStr = message.toString(); // Convert Buffer to string
      if (messageStr === "get-system-info") {
        console.log("messageStr", messageStr);
        getSystemInfo(ws);
      } else {
        ws.send("Invalid request");
      }
    });

    ws.send('{"message": "Connected to WebSocket server"}'); // Send JSON format
  });
}


//logic to get event  from client
//   ipcMain.handle("ping", () => {
//       return {
//         nameFromClient: "ping",
//         responseFromServer: "pong",
//         date: new Date(),
//       };
//     });
