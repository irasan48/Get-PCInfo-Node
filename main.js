const SystemInfo = require('./system-info');
const systemInfo = new SystemInfo();

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs').promises;
const os = require('os');

let mainWindow;

// Kreiranje glavnog prozora
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        frame: false, // Prilagođena naslovna traka
        backgroundColor: '#1a1a1a',
        icon: path.join(__dirname, 'assets/icon.png') // Dodajte svoju ikonu
    });

    mainWindow.loadFile('index.html');

    // Otvori DevTools u razvojnom načinu rada
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Rukovatelji događaja aplikacije
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC rukovatelji za kontrole prozora
ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('close-window', () => {
    mainWindow.close();
});

// IPC handler za sistemske informacije
ipcMain.handle('get-system-info', async () => {
    try {
        return await systemInfo.getAllSystemInfo();
    } catch (error) {
        console.error('Error getting system info:', error);
        throw error;
    }
});

// IPC rukovatelj za izvršavanje skripti
ipcMain.handle('execute-script', async (event, scriptName) => {
    const scriptsPath = path.join(__dirname, 'scripts');
    const scriptPath = path.join(scriptsPath, scriptName);
    
    return new Promise((resolve) => {
        // Izvršavanje .exe datoteke
        exec(`"${scriptPath}"`, { 
            cwd: scriptsPath,
            encoding: 'utf8',
            shell: true // Važno za Windows
        }, async (error, stdout, stderr) => {
            if (error) {
                console.error('Greška izvršavanja:', error);
                resolve({
                    success: false,
                    error: error.message
                });
                return;
            }
            
            try {
                // Nakon izvršavanja, traži generirani HTML fajl
                const baseName = path.basename(scriptName, '.exe');
                const possibleHtmlPaths = [
                    path.join(scriptsPath, `${baseName}.html`),
                    path.join(scriptsPath, `${baseName}_output.html`),
                    path.join(scriptsPath, 'output.html'),
                    path.join(process.cwd(), `${baseName}.html`)
                ];
                
                let htmlContent = '';
                let htmlFound = false;
                
                // Pokušaj pronaći i pročitati HTML datoteku
                for (const htmlPath of possibleHtmlPaths) {
                    try {
                        await fs.access(htmlPath);
                        htmlContent = await fs.readFile(htmlPath, 'utf8');
                        htmlFound = true;
                        
                        // Obriši HTML datoteku nakon čitanja
                        await fs.unlink(htmlPath).catch(() => {});
                        break;
                    } catch (err) {
                        // Nastavi na sljedeću putanju
                    }
                }
                
                // Ako HTML datoteka nije pronađena, koristi stdout
                if (!htmlFound && stdout) {
                    if (stdout.includes('<html>') || stdout.includes('<table>')) {
                        htmlContent = stdout;
                    } else {
                        // Pretvori obični tekst u HTML
                        htmlContent = `<pre>${stdout}</pre>`;
                    }
                } else if (!htmlFound && !stdout) {
                    htmlContent = '<p>Skripta izvršena uspješno, ali nije generiran izlaz.</p>';
                }
                
                resolve({
                    success: true,
                    html: htmlContent,
                    stdout: stdout,
                    stderr: stderr
                });
            } catch (err) {
                resolve({
                    success: false,
                    error: err.message
                });
            }
        });
    });
});