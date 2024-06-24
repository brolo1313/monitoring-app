// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const si = require('systeminformation');


// const gpuData = async () => {
//     try {
//         const graphicsInfo = await si.graphics();
//         console.log('graphicsInfo',graphicsInfo);
//         return graphicsInfo;
//     } catch (error) {
//         console.error('Error fetching GPU data:', error);
//     }
// };

// gpuData()

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../electron/preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    const indexPath = path.join(__dirname, '../dist/browser/index.html');
    console.log('Loading index.html from:', indexPath); 
    mainWindow.loadFile(indexPath);

    mainWindow.webContents.openDevTools(); // Opens DevTools
    // mainWindow.loadFile(path.join(__dirname, 'C:/Users/brolo/Desktop/electron-monitor-app/dist/electron-monitor-app/browser/index.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Handle IPC calls for system information
ipcMain.handle('get-system-info', async () => {
    const gpuData = await si.graphics();
    console.log('gpuData',gpuData);
    const cpuTemp = await si.cpuTemperature();
    return { gpuData, cpuTemp };
});
