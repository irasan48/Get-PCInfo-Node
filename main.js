const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const si = require('systeminformation');
const fs = require('fs');
const { exec } = require('child_process');

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
        frame: false,  // Uklanja dupli title bar
        autoHideMenuBar: true,
        backgroundColor: '#1e1e2e'
    });

    mainWindow.loadFile('index.html');
    
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

// Mapa skripti sa nazivima tabova
const scriptMap = {
    'admin': 'Admin Group.exe',
    'datum-kreiranja': 'Datum kreiranja korisničkih računa.exe',
    'permissions': 'Folder Permissions.exe',
    'grupe': 'Grupe sa korisnicima.exe',
    'info': 'Info.exe',
    'logiranja': 'Izlist logiranja i odjave korisnika.exe',
    'usb': 'Korištenje USB uređaja.exe',
    'lokalni-korisnici': 'Lokalni korisnički računi.exe',
    'neaktivni': 'Neaktivni Korisnički računi.exe',
    'obrisani': 'Obrisani Local Users_.exe',
    'print': 'Printer Report.exe',
    'serijski': 'Serial Number Report.exe',
    'upravljanje': 'Upravljanje Korisnicima i grupama_run admin.exe'
};

// Handler za pokretanje PowerShell skripti
ipcMain.handle('run-script', async (event, scriptName) => {
    return new Promise((resolve, reject) => {
        const scriptFile = scriptMap[scriptName];
        if (!scriptFile) {
            reject(new Error('Skripta nije pronađena'));
            return;
        }

        const scriptPath = path.join(__dirname, 'scripts', scriptFile);
        console.log('Pokrećem skriptu:', scriptPath);

        // Provjeri da li skripta postoji
        if (!fs.existsSync(scriptPath)) {
            reject(new Error(`Skripta ne postoji: ${scriptPath}`));
            return;
        }

        // Pokreni .exe fajl
        exec(`"${scriptPath}"`, { 
            encoding: 'utf8',
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        }, (error, stdout, stderr) => {
            if (error) {
                console.error('Greška pri pokretanju skripte:', error);
                reject(error);
                return;
            }

            if (stderr) {
                console.error('Stderr:', stderr);
            }

            // Pronađi HTML fajl koji je generisan
            const tempPath = process.env.TEMP || process.env.TMP || '/tmp';
            const htmlFiles = fs.readdirSync(tempPath)
                .filter(file => file.endsWith('.html') && file.includes(scriptFile.replace('.exe', '')))
                .map(file => ({
                    name: file,
                    path: path.join(tempPath, file),
                    time: fs.statSync(path.join(tempPath, file)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time);

            if (htmlFiles.length > 0) {
                // Učitaj najnoviji HTML fajl
                const htmlContent = fs.readFileSync(htmlFiles[0].path, 'utf8');
                resolve(htmlContent);
            } else {
                // Ako nema HTML fajla, vrati stdout
                resolve(stdout || '<p>Skripta je izvršena ali nema rezultata.</p>');
            }
        });
    });
});

// Export handlers
ipcMain.handle('export-data', async (event, { format, content, filename }) => {
    let filters = [];
    switch (format) {
        case 'txt':
            filters = [{ name: 'Text Files', extensions: ['txt'] }];
            break;
        case 'html':
            filters = [{ name: 'HTML Files', extensions: ['html'] }];
            break;
        case 'csv':
            filters = [{ name: 'CSV Files', extensions: ['csv'] }];
            break;
        case 'pdf':
            filters = [{ name: 'PDF Files', extensions: ['pdf'] }];
            break;
    }

    const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: filename,
        filters: filters
    });

    if (!result.canceled) {
        try {
            if (format === 'pdf') {
                // Za PDF koristimo Electron's printToPDF
                const pdfData = await mainWindow.webContents.printToPDF({
                    printBackground: true,
                    landscape: false
                });
                fs.writeFileSync(result.filePath, pdfData);
            } else if (format === 'txt') {
                // Konvertuj HTML u plain text
                const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                fs.writeFileSync(result.filePath, plainText);
            } else if (format === 'csv') {
                // Ekstraktuj tabele iz HTML-a i konvertuj u CSV
                const csv = extractTablesAsCSV(content);
                fs.writeFileSync(result.filePath, csv);
            } else {
                // Za HTML, sačuvaj direktno
                fs.writeFileSync(result.filePath, content);
            }
            return { success: true, path: result.filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    return { success: false, error: 'Cancelled' };
});

// Print handler
ipcMain.handle('print-content', async () => {
    mainWindow.webContents.print({
        silent: false,
        printBackground: true
    });
});

// Helper funkcija za ekstraktovanje tabela kao CSV
function extractTablesAsCSV(html) {
    const tables = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || [];
    let csv = '';
    
    tables.forEach(table => {
        const rows = table.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
        rows.forEach(row => {
            const cells = row.match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi) || [];
            const values = cells.map(cell => 
                cell.replace(/<[^>]*>/g, '').trim().replace(/"/g, '""')
            );
            csv += '"' + values.join('","') + '"\n';
        });
        csv += '\n';
    });
    
    return csv;
}

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