const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    runScript: (scriptName) => ipcRenderer.invoke('run-script', scriptName),
    exportData: (options) => ipcRenderer.invoke('export-data', options),
    printContent: () => ipcRenderer.invoke('print-content')
});