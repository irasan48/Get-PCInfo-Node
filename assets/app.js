/* ===================================
   Get-PCInfo Professional JavaScript
   Version: 2025.6.3
   Author: Ivica Rašan
   =================================== */

const { ipcRenderer } = require('electron');
const os = require('os');

let currentTab = '';
let loadingProgress = 0;
let loadingInterval;

// Script paths mapping
const scriptPaths = {
    'korisnici': './scripts/Lokalni korisnički računi.exe',
    'grupe': './scripts/Grupe sa korisnicima.exe',
    'logiranja': './scripts/Izlist logiranja i odjave korisnika.exe',
    'neaktivni': './scripts/Neaktivni Korisnički računi.exe',
    'permissions': './scripts/Folder Permissions.exe',
    'usb': './scripts/Korištenje USB uređaja.exe',
    'kreiranje-kr': './scripts/Datum kreiranja korisničkih računa.exe',
    'obrisani-kr': './scripts/Obrisani Local Users_.exe',
    'print': './scripts/Printer Report.exe',
    'administratori': './scripts/Admin Group.exe',
    'serijski': './scripts/Serial Number Report.exe',
    'direktoriji': './scripts/Upravljanje Korisnicima i grupama_run admin.exe',
    'hardver': null,
    'programi': null,
    'info': './scripts/Info.exe'
};

// Tab titles
const tabTitles = {
    'korisnici': 'Korisnici',
    'grupe': 'Grupe',
    'logiranja': 'Logiranja i odjave',
    'neaktivni': 'Neaktivni korisnici',
    'permissions': 'Folder Permissions',
    'usb': 'Korištenje USB',
    'kreiranje-kr': 'Kreiranje KR',
    'obrisani-kr': 'Obrisani KR',
    'print': 'Print',
    'administratori': 'Administratori',
    'serijski': 'Serijski brojevi',
    'direktoriji': 'Popis direktorija',
    'hardver': 'Hardver',
    'programi': 'Instalirani programi',
    'info': 'Info'
};

// Tab descriptions
const tabDescriptions = {
    'korisnici': 'Detaljan pregled svih lokalnih korisničkih računa s informacijama o statusu, lozinkama, grupama i SID-ovima.',
    'grupe': 'Analiza lokalnih grupa i njihovih članova s detaljnim informacijama o korisničkim ulogama.',
    'logiranja': 'Praćenje korisničkih prijava i odjava kroz EventLog s analizom sesija i trajanja.',
    'neaktivni': 'Identifikacija neaktivnih korisničkih računa s detaljnim statusom lozinki i administratorskim pravima.',
    'permissions': 'Analiza prava pristupa folderima s detaljnim prikazom dozvola za organizacijske strukture.',
    'usb': 'Praćenje USB aktivnosti s identifikacijom korisnika i vremenskim okvirom korištenja.',
    'kreiranje-kr': 'Usporedba datuma kreiranja korisničkih računa iz različitih izvora (EventLog, WMI, Registry).',
    'obrisani-kr': 'Praćenje izbrisanih korisničkih računa kroz EventLog s informacijama o administratoru.',
    'print': 'Analiza instaliranih printera, povijesti printanja i statusu redova za ispis.',
    'administratori': 'Pregled članova lokalne Administrators grupe s detaljnim informacijama o privilegijama.',
    'serijski': 'Prikupljanje serijskih brojeva svih hardverskih komponenti s poboljšanom USB detekcijom.',
    'direktoriji': 'Pregled strukture direktorija s analizom veličine i sadržaja.',
    'hardver': 'Detaljan popis hardverskih komponenti (CPU, RAM, GPU, storage).',
    'programi': 'Popis instaliranih programa s verzijama, proizvođačima i datumima instalacije.',
    'info': 'Informacije o aplikaciji, tehničke specifikacije i dokumentacija.'
};

// Initialize system info
document.addEventListener('DOMContentLoaded', () => {
    // Set system info
    document.getElementById('computerName').textContent = os.hostname();
    document.getElementById('userName').textContent = os.userInfo().username;
    
    // Start loading animation
    startLoadingAnimation();
    
    // Add ESC key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (confirm('Želite li izaći iz aplikacije?')) {
                ipcRenderer.send('window-close');
            }
        }
    });
});

// Loading animation
function startLoadingAnimation() {
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const statusText = document.getElementById('statusText');
    
    const statusMessages = [
        'Initializing...',
        'Loading PowerShell modules...',
        'Checking system permissions...',
        'Setting up interface...',
        'Connecting to Windows API...',
        'Preparing admin tools...',
        'Loading user settings...',
        'Finalizing...'
    ];
    
    let messageIndex = 0;
    
    loadingInterval = setInterval(() => {
        loadingProgress += Math.random() * 15;
        
        if (loadingProgress >= 100) {
            loadingProgress = 100;
            clearInterval(loadingInterval);
            
            progressBar.style.width = '100%';
            progressPercent.textContent = '100%';
            statusText.textContent = 'Aplikacija je spremna!';
            
            // Show launch button
            setTimeout(() => {
                document.querySelector('.launch-button').classList.add('show');
            }, 500);
        } else {
            progressBar.style.width = loadingProgress + '%';
            progressPercent.textContent = Math.floor(loadingProgress) + '%';
            
            // Update status message
            if (loadingProgress > (messageIndex + 1) * 12.5) {
                messageIndex++;
                if (messageIndex < statusMessages.length) {
                    statusText.textContent = statusMessages[messageIndex];
                }
            }
        }
    }, 200);
}

// Start application
function startApplication() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    welcomeScreen.classList.add('hidden');
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
    }, 500);
}

// Animate content load
function animateContentLoad() {
    const contentBody = document.getElementById('contentBody');
    if (contentBody) {
        contentBody.style.opacity = '0';
        contentBody.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            contentBody.style.transition = 'all 0.5s ease';
            contentBody.style.opacity = '1';
            contentBody.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Switch tab
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.closest('.tab').classList.add('active');
    
    // Update content
    const header = document.getElementById('contentHeader');
    const body = document.getElementById('contentBody');
    
    header.textContent = tabTitles[tabName];
    body.classList.add('fade-in');
    
    if (tabName === 'info') {
        renderInfoTab(body);
    } else if (scriptPaths[tabName]) {
        body.innerHTML = `
            <div class="tab-description">${tabDescriptions[tabName]}</div>
            <button class="execute-button" onclick="executeScript('${tabName}')">
                Izvršti skriptu
            </button>
            <div id="result-${tabName}"></div>
        `;
    } else {
        body.innerHTML = `
            <div class="tab-description">${tabDescriptions[tabName]}</div>
            <p style="color: #f4f4f4; margin-top: 20px;">
                Funkcionalnost za ${tabTitles[tabName]} će biti dodana uskoro.
            </p>
        `;
    }
    
    setTimeout(() => {
        body.classList.remove('fade-in');
    }, 500);
    
    // Animate content load
    animateContentLoad();
}

// Render Info tab
function renderInfoTab(container) {
    container.innerHTML = `
        <div class="info-container">
            <div class="version-card">
                <h2>Verzija: 2025.6.3 Professional</h2>
                <div class="version-details">
                    <p><strong>Datum izdanja:</strong> 13.6.2025</p>
                    <p><strong>Autor:</strong> Ivica Rašan</p>
                    <p><strong>Platforma:</strong> PowerShell 5.1+ / Windows 10/11</p>
                </div>
            </div>

            <div class="info-section">
                <h3>Opis aplikacije</h3>
                <p>
                    <span class="highlight-badge">Get-PCInfo</span> predstavlja najnapredniji PowerShell-based sustav za upravljanje IT infrastrukturom, 
                    dizajniran posebno za potrebe modernih IT odjela. Aplikacija kombinira mogućnost PowerShell-a s intuitivnim grafičkim sučeljem, 
                    omogućujući sistemskim administratorima potpunu kontrolu nad lokalnim korisničkim računima, hardverskim resursima, 
                    sigurnosnim komponentama i sustavskim događajima.
                </p>
            </div>

            <div class="features-grid">
                <div class="feature-card">
                    <h4>🔐 Sigurnost i nadzor</h4>
                    <ul>
                        <li>Kontinuirano praćenje korisničkih prijava</li>
                        <li>Analiza USB aktivnosti</li>
                        <li>Praćenje administratorskih aktivnosti</li>
                        <li>Detekcija sigurnosnih anomalija</li>
                    </ul>
                </div>
                <div class="feature-card">
                    <h4>👥 Upravljanje korisnicima</h4>
                    <ul>
                        <li>Pregled svih lokalnih korisnika</li>
                        <li>Analiza lozinki i sigurnosti</li>
                        <li>Praćenje aktivnosti korisnika</li>
                        <li>Identifikacija privilegija</li>
                    </ul>
                </div>
                <div class="feature-card">
                    <h4>💻 Hardver i resursi</h4>
                    <ul>
                        <li>Detaljan popis komponenti</li>
                        <li>Serijski brojevi uređaja</li>
                        <li>BIOS informacije</li>
                        <li>Mrežne konfiguracije</li>
                    </ul>
                </div>
                <div class="feature-card">
                    <h4>📊 Napredni izvještaji</h4>
                    <ul>
                        <li>HTML izvještaji s modernim dizajnom</li>
                        <li>Personalizirani izvještaji</li>
                        <li>Responzivni dizajn</li>
                        <li>Detaljne statistike</li>
                    </ul>
                </div>
            </div>

            <div class="stats-container">
                <div class="stat-item">
                    <div class="stat-number">15</div>
                    <div class="stat-label">Funkcija</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">100+</div>
                    <div class="stat-label">Tipova podataka</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">12</div>
                    <div class="stat-label">Izvještaja</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">2025</div>
                    <div class="stat-label">Verzija</div>
                </div>
            </div>

            <div class="tech-specs">
                <h3>Tehničke specifikacije</h3>
                <div class="specs-grid">
                    <div class="spec-card">
                        <h5>Platforme</h5>
                        <p>Windows 10/11, Server 2016+</p>
                    </div>
                    <div class="spec-card">
                        <h5>Zahtjevi</h5>
                        <p>PowerShell 5.1+, .NET 4.5+</p>
                    </div>
                    <div class="spec-card">
                        <h5>Privilegije</h5>
                        <p>Administrator pristup</p>
                    </div>
                </div>
            </div>

            <div class="footer-info">
                <p>© 2025 Ivica Rašan - Sva prava pridržana</p>
                <p>Build: 20250612-1342 | PowerShell 5.1.17763.7131</p>
            </div>
        </div>
    `;
}

// Execute script
async function executeScript(tabName) {
    const resultDiv = document.getElementById(`result-${tabName}`);
    const button = event.target;
    
    button.disabled = true;
    resultDiv.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <div class="loading-text">Izvršavanje skripte...</div>
        </div>
    `;
    
    try {
        const result = await ipcRenderer.invoke('execute-exe', scriptPaths[tabName]);
        
        if (result.stdout) {
            resultDiv.innerHTML = `
                <div class="result-container">
                    <h3 style="color: #e94560; margin-bottom: 15px;">Rezultat:</h3>
                    <pre>${result.stdout}</pre>
                </div>
            `;
        }
        
        if (result.stderr) {
            resultDiv.innerHTML += `
                <div class="error">
                    <h3>Greška:</h3>
                    <pre>${result.stderr}</pre>
                </div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="error">
                <h3>Greška pri izvršavanju:</h3>
                <pre>${error.error || error}</pre>
            </div>
        `;
    } finally {
        button.disabled = false;
    }
}

// Window control functions
function minimizeWindow() {
    ipcRenderer.send('window-minimize');
}

function maximizeWindow() {
    ipcRenderer.send('window-maximize');
}

function closeWindow() {
    ipcRenderer.send('window-close');
}