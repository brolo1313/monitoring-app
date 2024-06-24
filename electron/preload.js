const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    process: {
        type: process.type
      },
    getSystemInfo: () => ipcRenderer.invoke('get-system-info') ,// my API
});
