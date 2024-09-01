// MainWindow.js
const { BrowserWindow } = require("electron");
const path = require("path");
const EventEmitter = require("events");

class MainWindow {
  constructor() {
    this.mainWindow = null;
    this.eventEmitter = new EventEmitter();
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "../../electron/preload.js"),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: true,
      },
    });

    this.mainWindow.setResizable(false);
    
    const { loadAppUrl, getEnvUrls } = require("../helpers/loadUrl");
    const { localEnv, buildEnv, isLocalTest } = getEnvUrls();
    loadAppUrl(this.mainWindow, localEnv, buildEnv, isLocalTest);

    this.mainWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription, validatedURL) => {
        console.error(
          `Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`
        );
        // Fallback to loading URL again
        loadAppUrl(this.mainWindow, localEnv, buildEnv, isLocalTest);
      }
    );

    this.mainWindow.on('ready-to-show', () => {
      this.eventEmitter.emit("windowReady");
    });

    return this.mainWindow;
  }
}

module.exports = MainWindow;
