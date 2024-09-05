const log = require("electron-log");
const { colors } = require("./constants");
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

const colorsAdditional = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

//if you need custom logger, use this
function logWithColor(message, colorCode = "yellow", errorMessage = "") {
  const color = colorsAdditional[colorCode] || colorsAdditional.yellow;
  const output = errorMessage ? `${message}\n${errorMessage}` : message;
  console.log(`${color}${output}\x1b[0m`);
}

function showMessage(message, window) {
  log.info(`${colors.fg.yellow} ${message} ${colors.reset}`);

  if (window && window?.webContents) {
    window.webContents.send("updateMessage", message);
  }
}

function startMonitoring(si, mainWindow) {
  log.info(`${colors.fg.yellow}start monitoring${colors.reset}`);
  let cachedCpu, cachedUsers, cachedSystem, cachedOsInfo, cachedBios;
  let firstRun = true;

  // Fetch and cache the data that doesn't change frequently
  if (
    !cachedCpu ||
    !cachedUsers ||
    !cachedSystem ||
    !cachedOsInfo ||
    !cachedBios
  ) {
    si.cpu().then(data => cachedCpu = data);
    si.users().then(data => cachedUsers = data);
    si.system().then(data => cachedSystem = data);
    si.osInfo().then(data => cachedOsInfo = data);
    si.bios().then(data => cachedBios = data);

    log.info(`${colors.fg.green}Cached data has been received${colors.reset}`);
  }

  // Set up the interval and return the interval ID
  const intervalId = setInterval(async () => {
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

      if (firstRun) {
        log.info(`${colors.fg.green}First run: data is complete and sent to client${colors.reset}`);
        firstRun = false;
      }

      if (gpuData && currentLoad && mem &&  battery && wifiConnections) {
        mainWindow?.webContents.send("system-monitoring-data", result);
      }
    } catch (error) {
      log.error(`${colors.fg.red}Data fetch failed: ${error}${colors.reset}`);
    }
  }, 15000);

  return intervalId;
}




async function downloadLogFile() {
  const logFilePath = path.join(app.getPath("userData"), "logs", "main.log");

  try {
    const data = await fs.promises.readFile(logFilePath, "utf8");
    return data;
  } catch (error) {
    return { error: new Error("Failed to read log file"), data: null };
  }
}
module.exports = { logWithColor, showMessage, startMonitoring, downloadLogFile };
