// Event listener za scan button na welcome ekranu
document.addEventListener('DOMContentLoaded', () => {
    const scanButton = document.getElementById('scan-button');
    if (scanButton) {
        scanButton.addEventListener('click', async () => {
            console.log('Scan button clicked!');
            
            // Sakrij welcome ekran
            const welcomeScreen = document.querySelector('.container');
            if (welcomeScreen) {
                welcomeScreen.style.display = 'none';
            }
            
            // Prikaži loading ekran
            let loadingScreen = document.getElementById('loading-screen');
            if (!loadingScreen) {
                // Kreiraj loading ekran ako ne postoji
                loadingScreen = document.createElement('div');
                loadingScreen.id = 'loading-screen';
                loadingScreen.innerHTML = `
                    <div class="loading-content">
                        <div class="spinner"></div>
                        <h2>Skeniranje sistema...</h2>
                        <p>Molimo sačekajte...</p>
                    </div>
                `;
                document.body.appendChild(loadingScreen);
            }
            loadingScreen.style.display = 'flex';
            
            // Kreiraj results container ako ne postoji
            let resultsContainer = document.getElementById('results-container');
            if (!resultsContainer) {
                resultsContainer = document.createElement('div');
                resultsContainer.id = 'results-container';
                resultsContainer.style.display = 'none';
                resultsContainer.innerHTML = `
                    <nav class="navbar">
                        <h1>System Information</h1>
                        <div class="nav-actions">
                            <button onclick="refreshData()" class="nav-button"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
                            <button onclick="exportJSON()" class="nav-button"><i class="bi bi-download"></i> Export JSON</button>
                        </div>
                    </nav>
                    
                    <div class="main-content">
                        <div class="sidebar">
                            <div class="nav-item active" onclick="showSection('overview')">
                                <i class="bi bi-grid"></i> Overview
                            </div>
                            <div class="nav-item" onclick="showSection('hardware')">
                                <i class="bi bi-cpu"></i> Hardware
                            </div>
                            <div class="nav-item" onclick="showSection('software')">
                                <i class="bi bi-windows"></i> Software
                            </div>
                            <div class="nav-item" onclick="showSection('network')">
                                <i class="bi bi-ethernet"></i> Network
                            </div>
                        </div>
                        
                        <div class="content">
                            <div id="overview-section" class="content-section">
                                <h2>System Overview</h2>
                                <p>Loading...</p>
                            </div>
                            <div id="hardware-section" class="content-section" style="display: none;">
                                <h2>Hardware Information</h2>
                                <p>Loading...</p>
                            </div>
                            <div id="software-section" class="content-section" style="display: none;">
                                <h2>Software Information</h2>
                                <p>Loading...</p>
                            </div>
                            <div id="network-section" class="content-section" style="display: none;">
                                <h2>Network Information</h2>
                                <p>Loading...</p>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(resultsContainer);
            }
            
            try {
                // Dobij podatke o sistemu
                const systemData = await window.electronAPI.getSystemInfo();
                console.log('System data received:', systemData);
                
                // Sakrij loading
                loadingScreen.style.display = 'none';
                
                // Prikaži rezultate
                resultsContainer.style.display = 'block';
                
                // Popuni podatke
                populateOverview(systemData);
                populateHardware(systemData);
                populateSoftware(systemData);
                populateNetwork(systemData);
                
            } catch (error) {
                console.error('Error getting system info:', error);
                loadingScreen.style.display = 'none';
                alert('Greška pri dobijanju informacija o sistemu: ' + error.message);
            }
        });
    }
});

// Navigacija kroz sekcije
function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const selectedSection = document.getElementById(`${sectionName}-section`);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNav = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

// Popuni Overview sekciju
function populateOverview(data) {
    const content = `
        <div class="info-card">
            <h3><i class="bi bi-pc-display"></i> System Summary</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Computer Name:</span>
                    <span class="info-value">${data.computerName || data.os?.hostname || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Operating System:</span>
                    <span class="info-value">${data.os?.distro || data.os?.name || 'N/A'} ${data.os?.release || ''}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Architecture:</span>
                    <span class="info-value">${data.os?.arch || data.os?.architecture || 'N/A'}</span>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="info-card">
                    <h3><i class="bi bi-cpu"></i> CPU</h3>
                    <p><strong>${data.cpu?.manufacturer || ''} ${data.cpu?.brand || ''}</strong></p>
                    <p>Speed: ${data.cpu?.speed || 'N/A'} GHz | Cores: ${data.cpu?.cores || 'N/A'}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-card">
                    <h3><i class="bi bi-memory"></i> Memory</h3>
                    <p><strong>${formatBytes(data.memory?.total || 0)}</strong> Total</p>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${Math.round((data.memory?.used / data.memory?.total) * 100) || 0}%">
                            ${Math.round((data.memory?.used / data.memory?.total) * 100) || 0}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const section = document.getElementById('overview-section');
    if (section) {
        section.innerHTML = '<h2>System Overview</h2>' + content;
    }
}

// Popuni Hardware sekciju
function populateHardware(data) {
    let content = '<h2>Hardware Information</h2>';
    
    if (data.cpu) {
        content += `
            <div class="info-card">
                <h3><i class="bi bi-cpu"></i> Processor</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Model:</span>
                        <span class="info-value">${data.cpu.manufacturer} ${data.cpu.brand}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Speed:</span>
                        <span class="info-value">${data.cpu.speed} GHz</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cores:</span>
                        <span class="info-value">${data.cpu.cores}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Physical Cores:</span>
                        <span class="info-value">${data.cpu.physicalCores}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (data.graphics && data.graphics.length > 0) {
        content += `<div class="info-card"><h3><i class="bi bi-gpu-card"></i> Graphics</h3>`;
        data.graphics.forEach((gpu, index) => {
            content += `
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">GPU ${index + 1}:</span>
                        <span class="info-value">${gpu.vendor} ${gpu.model}</span>
                    </div>
                </div>
            `;
        });
        content += `</div>`;
    }
    
    const section = document.getElementById('hardware-section');
    if (section) {
        section.innerHTML = content;
    }
}

// Popuni Software sekciju
function populateSoftware(data) {
    const content = `
        <h2>Software Information</h2>
        <div class="info-card">
            <h3><i class="bi bi-windows"></i> Operating System</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">OS:</span>
                    <span class="info-value">${data.os?.distro || 'N/A'} ${data.os?.release || ''}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Platform:</span>
                    <span class="info-value">${data.os?.platform || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Architecture:</span>
                    <span class="info-value">${data.os?.arch || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
    
    const section = document.getElementById('software-section');
    if (section) {
        section.innerHTML = content;
    }
}

// Popuni Network sekciju
function populateNetwork(data) {
    const section = document.getElementById('network-section');
    if (section) {
        section.innerHTML = '<h2>Network Information</h2><p>Network information will be displayed here.</p>';
    }
}

// Pomoćna funkcija za formatiranje bajtova
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Export funkcije
async function exportJSON() {
    try {
        const data = await window.electronAPI.getSystemInfo();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-info-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting data: ' + error.message);
    }
}

// Refresh funkcija
async function refreshData() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
    
    try {
        const systemData = await window.electronAPI.getSystemInfo();
        populateOverview(systemData);
        populateHardware(systemData);
        populateSoftware(systemData);
        populateNetwork(systemData);
    } catch (error) {
        console.error('Refresh error:', error);
        alert('Error refreshing data: ' + error.message);
    } finally {
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
}