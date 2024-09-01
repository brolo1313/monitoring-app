// main.js
const { app, ipcMain } = require("electron");

const electron_1 = require("electron");
const path = require("path");
const si = require("systeminformation");
const {
  showMessage,
  startMonitoring,
  downloadLogFile,
} = require("./helpers/functions");
const { autoUpdater, AppUpdater } = require("electron-updater");
const log = require("electron-log");
const fs = require("fs");
const { colors } = require("./helpers/constants");

const MainScreen = require("./classes/mainScreen");

let mainWindow; // Define win globally
let monitoringInterval;

//Basic flags
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

log.transports.file.level = true;
log.transports.console.level = true;

// Logging
// autoUpdater.logger = log;
if (
  autoUpdater.logger &&
  autoUpdater.logger.transports &&
  autoUpdater.logger.transports.file
) {
  autoUpdater.logger.transports.file.level = true;
  autoUpdater.logger.transports.console.level = false;
}

log.info(`${colors.fg.blue}App starting...${colors.reset}`);

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 500 ms to fix the black background issue while using transparent window.
  mainWindowInstance = new MainScreen();
  app.on("ready", () => {
    setTimeout(() => (mainWindow = mainWindowInstance.createWindow()), 500);

    mainWindowInstance.eventEmitter.on("windowReady", () => {
      if (mainWindow) {
        setTimeout(() => {
          showMessage(
            `Checking for updates. Current version ${app.getVersion()}`,
            mainWindow
          ),
            autoUpdater.checkForUpdates();
        }, 5000);

        monitoringInterval = startMonitoring(si, mainWindow);
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
    log.info(`${colors.fg.red} app exit ${colors.reset}`);
  });
  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
  app.on("before-quit", () => {
    // Clean up resources here
    if (monitoringInterval) {
      clearInterval(monitoringInterval); // Stop any intervals
    }

    // Remove event listeners
    mainWindowInstance?.eventEmitter?.removeAllListeners();

    log.info(
      `${colors.fg.magenta}Handled logic before quite...${colors.reset}`
    );
  });
} catch (e) {
  log.error(`${colors.fg.red} App window error was occurred ${colors.reset}`);
  throw e;
}

//Listen fir client events
ipcMain.handle("download-log-file", async () => {
  try {
    const data = await downloadLogFile();
    return data;
  } catch (error) {
    log.error(
      `${colors.fg.red} ${"Failed to load log file"}, ${error} ${colors.reset}`
    );
    throw error;
  }
});

autoUpdater.on("update-available", (info) => {
  log.info({
    updateAvailable: info,
  });
  showMessage(
    `Update available. Current version ${app.getVersion()}`,
    mainWindow
  );
});

autoUpdater.on("update-not-available", (info) => {
  log.info({
    updateNotAvailable: info,
  });
  showMessage(
    `No update available. Current version ${app.getVersion()}`,
    mainWindow
  );
});

autoUpdater.on("error", (error) => {
  log.info({
    error: error,
  });
  showMessage(`Error during update`, mainWindow);
});

autoUpdater.on("download-progress", (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + " - Downloaded " + progressObj.percent + "%";
  log_message =
    log_message +
    " (" +
    progressObj.transferred +
    "/" +
    progressObj.total +
    ")";
  log.info({
    downloadProgress: log_message,
  });
  showMessage(log_message, mainWindow);
});

autoUpdater.on("update-downloaded", (info) => {
  log.info({
    updateDownloaded: info,
  });
  showMessage(
    `Update downloaded. Current version ${app.getVersion()}`,
    mainWindow
  );
});
