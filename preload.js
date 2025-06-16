// preload.js - Sigurna komunikacija između renderer i main procesa

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),
    
    // Script execution
    executeScript: (scriptName) => ipcRenderer.invoke('execute-script', scriptName),
    
    // System info
    getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});