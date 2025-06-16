const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const si = require('systeminformation');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        frame: false,  // <-- OVO MORATE DODATI!!!
        autoHideMenuBar: true,
        backgroundColor: '#1e1e2e'
    });

    mainWindow.loadFile('index.html');
    
    // Otvori DevTools u development modu
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Title bar handlers
ipcMain.on('minimize-window', () => {
    if (mainWindow) {
        mainWindow.minimize();
    }
});

ipcMain.on('maximize-window', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('close-window', () => {
    if (mainWindow) {
        mainWindow.close();
    }
});

// IPC handler za dobijanje informacija o sistemu
ipcMain.handle('get-system-info', async () => {
    try {
        console.log('Getting system info...');
        
        const [cpu, mem, osInfo, graphics, diskLayout, fsSize] = await Promise.all([
            si.cpu(),
            si.mem(), 
            si.osInfo(),
            si.graphics(),
            si.diskLayout(),
            si.fsSize()
        ]);

        // Računanje ukupnog prostora na disku
        let totalDiskSpace = 0;
        
        // Metoda 1: Koristi diskLayout za fizičke diskove
        if (diskLayout && diskLayout.length > 0) {
            diskLayout.forEach(disk => {
                if (disk.size && disk.size > 0) {
                    totalDiskSpace += disk.size;
                }
            });
        }
        
        // Metoda 2: Ako diskLayout ne radi, koristi fsSize za logičke particije
        if (totalDiskSpace === 0 && fsSize && fsSize.length > 0) {
            // Resetuj total
            totalDiskSpace = 0;
            
            // Izbegni duplikate koristeći Set za mount points
            const processedMounts = new Set();
            
            fsSize.forEach(fs => {
                // Samo dodaj ako nije već procesiran i ima validnu veličinu
                if (fs.size && fs.size > 0 && !processedMounts.has(fs.mount)) {
                    // Za Windows, fokusiraj se na drive letters (C:, D:, etc.)
                    if (process.platform === 'win32') {
                        if (fs.mount && fs.mount.match(/^[A-Z]:\\$/)) {
                            totalDiskSpace += fs.size;
                            processedMounts.add(fs.mount);
                        }
                    } else {
                        // Za Linux/Mac
                        totalDiskSpace += fs.size;
                        processedMounts.add(fs.mount);
                    }
                }
            });
        }

        console.log('Total disk space calculated:', totalDiskSpace);

        const systemInfo = {
            cpu: {
                manufacturer: cpu.manufacturer,
                brand: cpu.brand,
                speed: cpu.speed,
                cores: cpu.cores,
                physicalCores: cpu.physicalCores
            },
            memory: {
                total: mem.total,
                free: mem.free,
                used: mem.used
            },
            os: {
                platform: osInfo.platform,
                distro: osInfo.distro,
                release: osInfo.release,
                arch: osInfo.arch,
                hostname: osInfo.hostname
            },
            graphics: graphics.controllers,
            disk: {
                total: totalDiskSpace,
                layout: diskLayout,
                filesystems: fsSize
            },
            computerName: osInfo.hostname
        };

        console.log('System info collected:', systemInfo);
        return systemInfo;
        
    } catch (error) {
        console.error('Error getting system info:', error);
        throw error;
    }
});