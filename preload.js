const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // System information
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    getUsersInfo: () => ipcRenderer.invoke('get-users-info'),
    getProcesses: () => ipcRenderer.invoke('get-processes'),
    getNetworkInfo: () => ipcRenderer.invoke('get-network-info'),
    getStorageInfo: () => ipcRenderer.invoke('get-storage-info'),
    getInstalledSoftware: () => ipcRenderer.invoke('get-installed-software'),
    
    // File operations
    exportReport: (reportData) => ipcRenderer.invoke('export-report', reportData),
    
    // Menu events
    onMenuAction: (callback) => {
        ipcRenderer.on('menu-new-report', callback);
        ipcRenderer.on('menu-export', callback);
        ipcRenderer.on('menu-settings', callback);
        ipcRenderer.on('menu-refresh', callback);
        ipcRenderer.on('menu-system-scan', callback);
        ipcRenderer.on('menu-generate-all', callback);
        ipcRenderer.on('menu-help', callback);
    },
    
    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    
    // Utility
    platform: process.platform,
    version: process.versions.electron
});

// Error handling
window.addEventListener('DOMContentLoaded', () => {
    console.log('PCInfo Electron App - Preload script loaded');
    console.log('Platform:', process.platform);
    console.log('Electron version:', process.versions.electron);
    console.log('Node version:', process.versions.node);
    console.log('Chrome version:', process.versions.chrome);
});