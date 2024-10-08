// main.js
const { app, ipcMain } = require("electron");

const electron_1 = require("electron");
const si = require("systeminformation");
const {
  showMessage,
  startMonitoring,
  downloadLogFile,
} = require("./helpers/functions");
const log = require("electron-log");

const { colors } = require("./helpers/constants");

const MainScreen = require("./classes/mainScreen");
const AutoUpdater = require("./classes/autoUpdater");

let mainWindow; // Define win globally
let monitoringInterval;

log.transports.file.level = true;
log.transports.console.level = true;

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
        monitoringInterval = startMonitoring(si, mainWindow);

        setTimeout(() => {
          showMessage(
            `Checking for updates. Current version ${app.getVersion()}`,
            mainWindow
          );
          const updater = new AutoUpdater(mainWindow);
          updater.registerEvents();
          updater.checkForUpdates();
        }, 5000);
      } else {
        log.error(
          `${colors.fg.red} Main Window is not initialized ${colors.reset}`
        );
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
    log.info(
      `${colors.fg.green} ${"Successful to load log file"} ${colors.reset}`
    );
    return data;
  } catch (error) {
    log.error(
      `${colors.fg.red} ${"Failed to load log file"}, ${error} ${colors.reset}`
    );
    throw error;
  }
});

ipcMain.on("clear-monitoring-interval", () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    log.info(
      `${colors.fg.magenta}Monitoring interval cleared on refresh.${colors.reset}`
    );
  }
});


ipcMain.on("emit-updating-logic", () => {

  console.log('emit-updating-logic');
     //   showMessage(
        //     `Checking for updates. Current version ${app.getVersion()}`,
        //     mainWindow
        //   );
        //   const updater = new AutoUpdater(mainWindow);
        //   updater.registerEvents();
        //   updater.checkForUpdates();
});