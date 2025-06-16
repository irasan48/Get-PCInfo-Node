// Import SystemInfo klase
const SystemInfo = require('./system-info');
const systemInfo = new SystemInfo();

// Spremanje referenci na elemente
let currentSection = 'overview';
const sections = ['overview', 'hardware', 'software', 'network'];

// Navigacija kroz sekcije
function showSection(sectionName) {
    // Sakrij sve sekcije
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Prikaži odabranu sekciju
    const selectedSection = document.getElementById(`${sectionName}-section`);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
    
    // Ažuriraj aktivnu navigaciju
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[onclick="showSection('${sectionName}')"]`).classList.add('active');
    
    currentSection = sectionName;
}

// Učitavanje podataka i prikaz
async function loadSystemInfo() {
    try {
        // Prikaži loading indikator
        showLoading();
        
        // Dobij podatke o sistemu
        const fullData = await systemInfo.getAllSystemInfo();
        
        // Sakrij loading i prikaži rezultate
        hideLoading();
        showResults();
        
        // Popuni sekcije sa podacima
        populateOverview(fullData);
        populateHardware(fullData);
        populateSoftware(fullData);
        populateNetwork(fullData);
        
    } catch (error) {
        console.error('Error loading system info:', error);
        hideLoading();
        showError(error.message);
    }
}

// Prikaži loading ekran
function showLoading() {
    document.getElementById('loading-screen').style.display = 'flex';
    document.getElementById('results-container').style.display = 'none';
}

// Sakrij loading ekran
function hideLoading() {
    document.getElementById('loading-screen').style.display = 'none';
}

// Prikaži rezultate
function showResults() {
    document.getElementById('results-container').style.display = 'block';
}

// Prikaži grešku
function showError(message) {
    alert(`Error: ${message}`);
}

// Popuni Overview sekciju
function populateOverview(data) {
    const content = `
        <div class="info-card">
            <h3><i class="bi bi-pc-display"></i> System Summary</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Computer Name:</span>
                    <span class="info-value">${data.computerName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">User:</span>
                    <span class="info-value">${data.userName}@${data.domain}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Operating System:</span>
                    <span class="info-value">${data.os.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Architecture:</span>
                    <span class="info-value">${data.os.architecture}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Uptime:</span>
                    <span class="info-value">${data.os.uptime}</span>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="info-card">
                    <h3><i class="bi bi-cpu"></i> CPU</h3>
                    <p><strong>${data.cpu.model}</strong></p>
                    <p>Speed: ${data.cpu.speed} | Cores: ${data.cpu.cores}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-card">
                    <h3><i class="bi bi-memory"></i> Memory</h3>
                    <p><strong>${data.memory.total}</strong> Total</p>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${data.memory.usage}%">${data.memory.usage}%</div>
                    </div>
                    <p class="small mt-1">Used: ${data.memory.used} | Free: ${data.memory.free}</p>
                </div>
            </div>
        </div>
        
        <div class="info-card">
            <h3><i class="bi bi-hdd"></i> Storage</h3>
            <p><strong>${data.storage.total}</strong> Total</p>
            <div class="progress">
                <div class="progress-bar" style="width: ${data.storage.usage}%">${data.storage.usage}%</div>
            </div>
            <p class="small mt-1">Used: ${data.storage.used} | Free: ${data.storage.free}</p>
        </div>
    `;
    
    document.getElementById('overview-section').innerHTML = content;
}

// Popuni Hardware sekciju
function populateHardware(data) {
    let gpuHtml = '';
    if (data.graphics && data.graphics.length > 0) {
        gpuHtml = data.graphics.map((gpu, index) => `
            <div class="info-item">
                <span class="info-label">GPU ${index + 1}:</span>
                <span class="info-value">${gpu.vendor} ${gpu.model}</span>
            </div>
            <div class="info-item">
                <span class="info-label">VRAM:</span>
                <span class="info-value">${gpu.vram}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Driver:</span>
                <span class="info-value">${gpu.driverVersion}</span>
            </div>
        `).join('');
    }
    
    let diskHtml = '';
    if (data.storage.disks && data.storage.disks.length > 0) {
        diskHtml = data.storage.disks.map((disk, index) => `
            <div class="disk-item">
                <h5>Disk ${index + 1}</h5>
                <p>Device: ${disk.device}</p>
                <p>Type: ${disk.type}</p>
                <p>Size: ${disk.size}</p>
            </div>
        `).join('');
    }
    
    const content = `
        <div class="info-card">
            <h3><i class="bi bi-motherboard"></i> System Hardware</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Manufacturer:</span>
                    <span class="info-value">${data.system ? data.system.manufacturer : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Model:</span>
                    <span class="info-value">${data.system ? data.system.model : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Serial Number:</span>
                    <span class="info-value">${data.system ? data.system.serial : 'N/A'}</span>
                </div>
            </div>
        </div>
        
        <div class="info-card">
            <h3><i class="bi bi-cpu"></i> Processor Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Model:</span>
                    <span class="info-value">${data.cpu.model}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Speed:</span>
                    <span class="info-value">${data.cpu.speed}</span>
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
        
        ${gpuHtml ? `
        <div class="info-card">
            <h3><i class="bi bi-gpu-card"></i> Graphics</h3>
            <div class="info-grid">
                ${gpuHtml}
            </div>
        </div>
        ` : ''}
        
        <div class="info-card">
            <h3><i class="bi bi-device-hdd"></i> Storage Devices</h3>
            ${diskHtml}
        </div>
    `;
    
    document.getElementById('hardware-section').innerHTML = content;
}

// Popuni Software sekciju
function populateSoftware(data) {
    const content = `
        <div class="info-card">
            <h3><i class="bi bi-windows"></i> Operating System</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">OS:</span>
                    <span class="info-value">${data.os.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Version:</span>
                    <span class="info-value">${data.os.version}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Platform:</span>
                    <span class="info-value">${data.os.platform}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Architecture:</span>
                    <span class="info-value">${data.os.architecture}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Build:</span>
                    <span class="info-value">${data.os.build}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Uptime:</span>
                    <span class="info-value">${data.os.uptime}</span>
                </div>
            </div>
        </div>
        
        ${data.bios ? `
        <div class="info-card">
            <h3><i class="bi bi-circuit"></i> BIOS</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Vendor:</span>
                    <span class="info-value">${data.bios.vendor}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Version:</span>
                    <span class="info-value">${data.bios.version}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Release Date:</span>
                    <span class="info-value">${data.bios.releaseDate}</span>
                </div>
            </div>
        </div>
        ` : ''}
    `;
    
    document.getElementById('software-section').innerHTML = content;
}

// Popuni Network sekciju
function populateNetwork(data) {
    let networkHtml = '';
    if (data.network && data.network.length > 0) {
        networkHtml = data.network.map(net => `
            <div class="network-card">
                <h4>${net.interface}</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">IPv4:</span>
                        <span class="info-value">${net.ip4}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">MAC:</span>
                        <span class="info-value">${net.mac}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Type:</span>
                        <span class="info-value">${net.type}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Speed:</span>
                        <span class="info-value">${net.speed}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">DHCP:</span>
                        <span class="info-value">${net.dhcp ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    const content = `
        <div class="info-card">
            <h3><i class="bi bi-ethernet"></i> Network Interfaces</h3>
            ${networkHtml || '<p>No network interfaces found</p>'}
        </div>
    `;
    
    document.getElementById('network-section').innerHTML = content;
}

// Export funkcije
async function exportJSON() {
    try {
        const data = await systemInfo.getAllSystemInfo();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-info-${data.computerName}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting data: ' + error.message);
    }
}

async function exportHTML() {
    try {
        const data = await systemInfo.getAllSystemInfo();
        await systemInfo.exportToHTML(`system-info-${data.computerName}.html`);
        alert('HTML report exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting HTML: ' + error.message);
    }
}

// Refresh funkcija
async function refreshData() {
    await loadSystemInfo();
}

// Event listener za gumb
document.addEventListener('DOMContentLoaded', () => {
    const scanButton = document.getElementById('scan-button');
    if (scanButton) {
        scanButton.addEventListener('click', loadSystemInfo);
    }
});