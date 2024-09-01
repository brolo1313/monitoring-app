const log = require("electron-log");
const { colors } = require("./constants");
const path = require("path");
const fs = require("fs");

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

async function startMonitoring(si, mainWindow) {
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
    try {
      cachedCpu = await si.cpu();
      cachedUsers = await si.users();
      cachedSystem = await si.system();
      cachedOsInfo = await si.osInfo();
      cachedBios = await si.bios();

      log.info(`${colors.fg.green}Cached data has been received${colors.reset}`);
    } catch {
      log.info(`${colors.fg.red}cached data ain't fetched${colors.reset}`);
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

      if (firstRun) {
        log.info(`${colors.fg.green}First run: data is complete and sent to client${colors.reset}`);
        firstRun = false;
      }

      if (mainWindow && mainWindow?.webContents) {
        mainWindow?.webContents.send("system-monitoring-data", result);
      }
    } catch {
      log.info(`${colors.fg.red}data not received${colors.reset}`);
    }
  }, 10000);
}


async function downloadLogFile() {
  const logFilePath = path.join(app.getPath("userData"), "logs", "main.log");

  try {
    const data = await fs.promises.readFile(logFilePath, "utf8");
    return data;
  } catch (error) {
    log.info(`${colors.fg.red} ${"Failed to read the log file:", error} ${colors.reset}`);
    return null;
  }
};
module.exports = { logWithColor, showMessage, startMonitoring, downloadLogFile };
