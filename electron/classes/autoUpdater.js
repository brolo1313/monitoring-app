const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const { app } = require("electron");
const { showMessage } = require("../helpers/functions");

class AutoUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.configureAutoUpdater();
  }

  configureAutoUpdater() {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    if (autoUpdater.logger && autoUpdater.logger?.transports?.file) {
      autoUpdater.logger.transports.file.level = true;
      autoUpdater.logger.transports.console.level = false;
    }
  }

  registerEvents() {
    autoUpdater.on("update-available", (info) => {
      log.info(`Update available: ${JSON.stringify(info)}`);
      showMessage(
        `Update available. Current version ${app.getVersion()}`,
        this.mainWindow
      );
    });

    autoUpdater.on("update-not-available", (info) => {
      log.info(`No update available: ${JSON.stringify(info)}`);
      showMessage(
        `No update available. Current version ${app.getVersion()}`,
        this.mainWindow
      );
    });

    autoUpdater.on("error", (error) => {
      log.error(`Update error: ${error}`);
      showMessage(`Error during update`, this.mainWindow);
    });

    autoUpdater.on("download-progress", (progressObj) => {
      let logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      log.info(logMessage);
      showMessage(logMessage, this.mainWindow);
    });

    autoUpdater.on("update-downloaded", (info) => {
      log.info(`Update downloaded: ${JSON.stringify(info)}`);
      showMessage(
        `Update downloaded. Current version ${app.getVersion()}`,
        this.mainWindow
      );
    });
  }

  checkForUpdates() {
    autoUpdater.checkForUpdates();
  }
}

module.exports = AutoUpdater;
