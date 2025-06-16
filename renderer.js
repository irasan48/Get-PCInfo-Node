// renderer.js - Get-PCInfo aplikacija sa naprednim efektima

// Dobivanje stvarnih sistemskih informacija
async function getSystemInfo() {
    if (window.electronAPI && window.electronAPI.getSystemInfo) {
        return await window.electronAPI.getSystemInfo();
    } else {
        // Fallback za demo
        return {
            ram: Math.round((window.performance && window.performance.memory ? 
                window.performance.memory.totalJSHeapSize / 1024 / 1024 / 1024 : 16)),
            cpu: navigator.hardwareConcurrency || 8,
            cpuModel: 'Intel Core i7',
            platform: navigator.platform,
            disk: 512
        };
    }
}

// Sistemske informacije - PRIKAZUJE STVARNO STANJE
async function updateSystemPreview() {
    const ramPreview = document.getElementById('ramPreview');
    const cpuPreview = document.getElementById('cpuPreview');
    const diskPreview = document.getElementById('diskPreview');
    
    try {
        const systemInfo = await getSystemInfo();
        
        if (ramPreview) ramPreview.textContent = `${systemInfo.ram || 8} GB`;
        if (cpuPreview) cpuPreview.textContent = systemInfo.cpuModel || 'Intel Core';
        if (diskPreview) diskPreview.textContent = `${systemInfo.disk || 100} GB`;
    } catch (error) {
        console.error('Greška pri dobivanju sistemskih informacija:', error);
        // Fallback vrijednosti
        if (ramPreview) ramPreview.textContent = '8 GB';
        if (cpuPreview) cpuPreview.textContent = 'Intel Core';
        if (diskPreview) diskPreview.textContent = '100 GB';
    }
}

// Dobivanje stvarnog CPU i RAM korištenja
async function getRealSystemStats() {
    if (window.electronAPI && window.electronAPI.getSystemStats) {
        try {
            return await window.electronAPI.getSystemStats();
        } catch (error) {
            console.error('Greška pri dobivanju statistika:', error);
        }
    }
    
    // Fallback - koristi Performance API ako je dostupan
    if (window.performance && window.performance.memory) {
        const usedMemory = window.performance.memory.usedJSHeapSize;
        const totalMemory = window.performance.memory.totalJSHeapSize;
        const ramUsage = Math.round((usedMemory / totalMemory) * 100);
        
        return {
            cpuUsage: Math.floor(Math.random() * 30 + 10), // CPU još uvijek simuliran
            ramUsage: ramUsage
        };
    }
    
    return null;
}

// Particle sistem za pozadinu
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = `rgba(74, 144, 226, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Crtanje linija između bliskih čestica
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const distance = Math.sqrt(
                    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
                );
                
                if (distance < 100) {
                    ctx.strokeStyle = `rgba(74, 144, 226, ${0.2 * (1 - distance / 100)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Pokretanje aplikacije sa animacijom
function startApplication() {
    const loadingBar = document.getElementById('loadingBar');
    const loadingProgress = loadingBar.querySelector('.loading-progress');
    const button = document.querySelector('.start-button-3d');
    
    // Disable button
    button.disabled = true;
    button.style.opacity = '0.6';
    button.style.cursor = 'not-allowed';
    
    // Prikaži loading bar
    loadingBar.classList.add('active');
    
    // Animiraj progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress > 100) progress = 100;
        
        loadingProgress.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            
            setTimeout(() => {
                const welcomeScreen = document.getElementById('welcomeScreen');
                const mainContainer = document.getElementById('mainContainer');
                
                // Fade out animacija
                welcomeScreen.style.transition = 'opacity 0.5s, transform 0.5s';
                welcomeScreen.style.opacity = '0';
                welcomeScreen.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    welcomeScreen.style.display = 'none';
                    mainContainer.style.display = 'flex';
                    
                    // Fade in animacija
                    mainContainer.style.opacity = '0';
                    mainContainer.style.transition = 'opacity 0.5s';
                    
                    setTimeout(() => {
                        mainContainer.style.opacity = '1';
                        updateHeaderTime();
                        initLiveStats();
                    }, 50);
                }, 500);
            }, 500);
        }
    }, 50);
}

// Ažuriranje vremena u headeru
function updateHeaderTime() {
    const timeElement = document.getElementById('headerTime');
    if (!timeElement) return;
    
    function update() {
        const now = new Date();
        const time = now.toLocaleTimeString('hr-HR');
        const date = now.toLocaleDateString('hr-HR');
        timeElement.textContent = `${date} ${time}`;
    }
    
    update();
    setInterval(update, 1000);
}

// Live statistike - STVARNI PODACI
function initLiveStats() {
    async function updateStats() {
        const stats = await getRealSystemStats();
        
        if (stats) {
            // CPU korištenje
            const cpuElement = document.getElementById('cpuUsage');
            const cpuFill = document.getElementById('cpuFill');
            
            if (cpuElement) cpuElement.textContent = `${stats.cpuUsage}%`;
            if (cpuFill) cpuFill.style.width = `${stats.cpuUsage}%`;
            
            // RAM korištenje
            const ramElement = document.getElementById('ramUsage');
            const ramFill = document.getElementById('ramFill');
            
            if (ramElement) ramElement.textContent = `${stats.ramUsage}%`;
            if (ramFill) ramFill.style.width = `${stats.ramUsage}%`;
        } else {
            // Fallback simulacija
            const cpuUsage = Math.floor(Math.random() * 40 + 20);
            const cpuElement = document.getElementById('cpuUsage');
            const cpuFill = document.getElementById('cpuFill');
            
            if (cpuElement) cpuElement.textContent = `${cpuUsage}%`;
            if (cpuFill) cpuFill.style.width = `${cpuUsage}%`;
            
            const ramUsage = Math.floor(Math.random() * 30 + 30);
            const ramElement = document.getElementById('ramUsage');
            const ramFill = document.getElementById('ramFill');
            
            if (ramElement) ramElement.textContent = `${ramUsage}%`;
            if (ramFill) ramFill.style.width = `${ramUsage}%`;
        }
    }
    
    updateStats();
    setInterval(updateStats, 3000);
}

// Mapiranje tabova na izvršne datoteke - PREMA PS1 SKRIPTI
const exeMapping = {
    'lokalni-korisnici': 'Lokalni korisnički računi.exe',
    'grupe': 'Grupe sa korisnicima.exe',
    'logiranja': 'Izlist logiranja i odjave korisnika.exe',
    'neaktivni': 'Neaktivni Korisnički računi.exe',
    'permissions': 'Folder Permissions.exe',
    'usb': 'Korištenje USB uređaja.exe',
    'datum-kreiranja': 'Datum kreiranja korisničkih računa.exe',
    'obrisani': 'Obrisani Local Users_.exe',
    'print': 'Printer Report.exe',
    'admin': 'Admin Group.exe',
    'serijski': 'Serial Number Report.exe',
    'upravljanje': 'Upravljanje Korisnicima i grupama_run admin.exe',
    'info': 'Info.exe'
};

// Naslovi tabova - PREMA PS1 SKRIPTI
const tabTitles = {
    'home': 'Početna',
    'lokalni-korisnici': 'Lokalni korisnički računi',
    'grupe': 'Grupe sa korisnicima',
    'logiranja': 'Izlist logiranja i odjave korisnika',
    'neaktivni': 'Neaktivni Korisnički računi',
    'permissions': 'Folder Permissions',
    'usb': 'Korištenje USB uređaja',
    'datum-kreiranja': 'Datum kreiranja korisničkih računa',
    'obrisani': 'Obrisani Local Users',
    'print': 'Printer Report',
    'admin': 'Admin Group',
    'serijski': 'Serial Number Report',
    'upravljanje': 'Upravljanje Korisnicima i grupama',
    'info': 'Info'
};

// Opisi tabova - PREMA PS1 SKRIPTI
const tabDescriptions = {
    'lokalni-korisnici': 'Pregled svih lokalnih korisničkih računa sa detaljnim informacijama o statusu računa, lozinkama i privilegijama.',
    'grupe': 'Analiza lokalnih grupa i njihovih članova sa prikazom hijerarhije dozvola i članstva.',
    'logiranja': 'Praćenje korisničkih prijava i odjava kroz Windows Event Log sa vremenskim oznakama.',
    'neaktivni': 'Identifikacija neaktivnih korisničkih računa radi održavanja sigurnosti sistema.',
    'permissions': 'Detaljni pregled prava pristupa za foldere i datoteke sa NTFS dozvolama.',
    'usb': 'Praćenje korištenja USB uređaja sa identifikacijom korisnika i vremenom pristupa.',
    'datum-kreiranja': 'Usporedba datuma kreiranja korisničkih računa iz različitih izvora (WMI, Registry).',
    'obrisani': 'Praćenje obrisanih korisničkih računa kroz Event Log zapise.',
    'print': 'Analiza instaliranih printera, drivera i povijesti ispisa.',
    'admin': 'Pregled članova lokalne Administrators grupe sa SID identifikatorima.',
    'serijski': 'Prikupljanje serijskih brojeva svih hardverskih komponenti sistema.',
    'upravljanje': 'Napredne opcije za upravljanje korisnicima i grupama (zahtijeva admin prava).',
    'info': 'Detaljne informacije o hardverskim i softverskim komponentama sistema.'
};

// Info tab HTML sadržaj
const infoTabContent = `<!DOCTYPE html>
<html lang='hr'>
<head>
    <meta http-equiv='X-UA-Compatible' content='IE=edge' />
    <meta charset='UTF-8'>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Get-PCInfo Enhanced - Sistemski informacijski dashboard</title>
<style>
/* Enhanced System Admin Tools v2.1 Styling */
* { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box; 
}

:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --success-gradient: linear-gradient(135deg, #10b981, #059669);
    --warning-gradient: linear-gradient(135deg, #fbbf24, #f59e0b);
    --error-gradient: linear-gradient(135deg, #ef4444, #dc2626);
    --info-gradient: linear-gradient(135deg, #3b82f6, #1d4ed8);
    --glass-bg: rgba(255, 255, 255, 0.15);
    --glass-border: rgba(255, 255, 255, 0.3);
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.9);
    --text-muted: rgba(255, 255, 255, 0.7);
    --shadow-light: 0 5px 15px rgba(0, 0, 0, 0.2);
    --shadow-heavy: 0 20px 60px rgba(0, 0, 0, 0.4);
    --border-radius: 15px;
    --border-radius-large: 25px;
    --transition: all 0.3s ease;
}

body { 
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; 
    background: var(--primary-gradient);
    min-height: 100vh;
    color: var(--text-primary);
    padding: 40px 20px;
    line-height: 1.6;
    overflow-x: hidden;
}

/* Enhanced Loading Animation */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

@keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
}

@keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
    50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.6); }
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: var(--border-radius-large);
    padding: 50px;
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-heavy);
    animation: fadeInUp 0.8s ease-out;
    position: relative;
    overflow: hidden;
}

/* Enhanced Header with Status Indicator */
.header {
    text-align: center;
    margin-bottom: 50px;
    position: relative;
}

.header::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--success-gradient);
    border-radius: 2px;
    animation: shimmer 2s infinite;
    background-image: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 1000px 100%;
}

h1 { 
    color: var(--text-primary); 
    font-size: 48px; 
    margin-bottom: 15px;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4);
    font-weight: 700;
    letter-spacing: 2px;
    background: linear-gradient(135deg, #ffffff, #e2e8f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.subtitle {
    font-size: 20px;
    color: var(--text-secondary);
    margin-bottom: 30px;
    font-style: italic;
    opacity: 0.9;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--success-gradient);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    animation: pulse 2s infinite;
    margin-top: 10px;
}

.status-badge::before {
    content: '🚀';
}

/* Enhanced System Status Grid */
.system-status {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin: 40px 0;
}

.status-card {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    padding: 25px;
    border-radius: var(--border-radius);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: var(--transition);
    text-align: center;
    position: relative;
    overflow: hidden;
}

.status-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    transition: var(--transition);
}

.status-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    background: rgba(0, 0, 0, 0.3);
}

.status-card:hover::before {
    left: 100%;
}

.status-card .icon {
    font-size: 32px;
    margin-bottom: 15px;
    display: block;
    filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
}

.status-card h3 {
    color: var(--text-primary);
    font-size: 18px;
    margin-bottom: 10px;
    font-weight: 600;
}

.status-card p {
    color: var(--text-muted);
    font-size: 14px;
    margin: 5px 0;
}

.status-card .status-value {
    color: #10b981;
    font-weight: 700;
    font-size: 16px;
}

/* Enhanced Version Info */
.version-info {
    background: var(--success-gradient);
    padding: 40px;
    border-radius: 20px;
    margin: 40px 0;
    text-align: center;
    box-shadow: var(--shadow-light);
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
    animation: glow 3s infinite;
}

.version-info::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    animation: shimmer 3s infinite;
}

.version-info h2 {
    font-size: 32px;
    margin-bottom: 20px;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.version-info p {
    font-size: 16px;
    margin: 10px 0;
    opacity: 0.95;
}

/* Enhanced Execution Metrics */
.execution-metrics {
    background: var(--info-gradient);
    padding: 30px;
    border-radius: var(--border-radius);
    margin: 30px 0;
    color: white;
    text-align: center;
    box-shadow: var(--shadow-light);
}

.execution-metrics h3 {
    font-size: 24px;
    margin-bottom: 20px;
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.execution-metrics h3::before {
    content: '📊 ';
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-top: 20px;
}

.metric-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 15px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: var(--transition);
}

.metric-item:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}

.metric-value {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 5px;
    color: #fbbf24;
}

.metric-label {
    font-size: 12px;
    opacity: 0.9;
}

/* Enhanced Typography */
h2 { 
    color: var(--text-primary); 
    font-size: 32px; 
    margin: 50px 0 25px 0;
    border-left: 5px solid #10b981;
    padding-left: 20px;
    font-weight: 600;
    position: relative;
}

h2::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 20px;
    width: 50px;
    height: 3px;
    background: var(--success-gradient);
    border-radius: 2px;
}

h2:nth-of-type(2)::before { content: '🎯 '; }
h2:nth-of-type(3)::before { content: '🛠 '; }
h2:nth-of-type(4)::before { content: '⭐ '; }
h2:nth-of-type(5)::before { content: '⚙ '; }
h2:nth-of-type(6)::before { content: '📈 '; }
h2:nth-of-type(7)::before { content: '🚀 '; }
h2:nth-of-type(8)::before { content: '📚 '; }
h2:nth-of-type(9)::before { content: '🔮 '; }
h2:nth-of-type(10)::before { content: '📞 '; }

h3 { 
    color: var(--text-secondary); 
    font-size: 22px; 
    margin: 30px 0 15px 0;
    font-weight: 500;
}

p { 
    font-size: 16px; 
    margin-bottom: 20px; 
    text-align: justify;
    color: var(--text-secondary);
    line-height: 1.8;
}

/* Enhanced Feature Cards */
.feature {
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    padding: 30px;
    margin: 25px 0;
    border-radius: var(--border-radius);
    border-left: 5px solid #10b981;
    box-shadow: var(--shadow-light);
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

.feature::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    transition: var(--transition);
}

.feature:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
}

.feature:hover::before {
    left: 100%;
}

.feature h3 {
    background: var(--warning-gradient);
    color: white;
    font-size: 24px;
    margin: -30px -30px 20px -30px;
    font-weight: 600;
    padding: 20px 30px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.feature:nth-of-type(1) h3::before { content: '🏗 '; }
.feature:nth-of-type(2) h3::before { content: '🔒 '; }
.feature:nth-of-type(3) h3::before { content: '💻 '; }
.feature:nth-of-type(4) h3::before { content: '📊 '; }

/* Enhanced Grid Layouts */
.stats-grid, .functions-grid, .tech-specs {
    display: grid;
    gap: 20px;
    margin: 40px 0;
}

.stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.functions-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.tech-specs {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.stat-card, .function-card, .tech-card {
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    padding: 25px;
    border-radius: var(--border-radius);
    text-align: center;
    box-shadow: var(--shadow-light);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

.stat-card:hover, .function-card:hover, .tech-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.stat-card h3, .tech-card h3 {
    background: var(--info-gradient);
    color: white;
    font-size: 18px;
    margin: -25px -25px 15px -25px;
    font-weight: 600;
    padding: 15px 25px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0 3px 8px rgba(59, 130, 246, 0.3);
}

.tech-card:nth-of-type(1) h3::before { content: '🖥 '; }
.tech-card:nth-of-type(2) h3::before { content: '📋 '; }
.tech-card:nth-of-type(3) h3::before { content: '🔗 '; }
.tech-card:nth-of-type(4) h3::before { content: '🛡 '; }

.function-card {
    text-align: left;
    border-left: 4px solid #10b981;
}

.function-card h4 {
    color: #fbbf24;
    font-size: 18px;
    margin-bottom: 10px;
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.function-card p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    text-align: left;
}

/* Enhanced Lists */
ul {
    list-style: none;
    padding-left: 0;
}

li {
    margin: 15px 0;
    padding-left: 35px;
    position: relative;
    font-size: 15px;
    line-height: 1.7;
}

li::before {
    content: "▶";
    position: absolute;
    left: 0;
    color: #ffffff;
    font-weight: bold;
    font-size: 12px;
    background: var(--success-gradient);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 2px;
    box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.3);
}

/* Enhanced Highlights */
.highlight {
    background: var(--warning-gradient);
    color: white;
    padding: 4px 10px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    display: inline-block;
    margin: 0 2px;
    cursor: pointer;
    transition: var(--transition);
}

.highlight:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Enhanced Footer */
.footer {
    text-align: center;
    margin-top: 60px;
    padding: 40px;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(15px);
    border-radius: var(--border-radius);
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
}

.footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--success-gradient);
    border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.footer p {
    font-size: 14px;
    margin: 10px 0;
    color: var(--text-muted);
}

.footer strong {
    color: #10b981;
    font-weight: 600;
}

/* Browser Opening Notice */
.browser-notice {
    background: var(--warning-gradient);
    padding: 20px;
    border-radius: var(--border-radius);
    margin: 20px 0;
    text-align: center;
    color: white;
    font-weight: 600;
    animation: pulse 2s infinite;
}

.browser-notice::before {
    content: '🌐 ';
}

/* Icons for Status Cards */
.status-card:nth-of-type(1) .icon::after { content: '💻'; }
.status-card:nth-of-type(2) .icon::after { content: '👤'; }
.status-card:nth-of-type(3) .icon::after { content: '🔧'; }
.status-card:nth-of-type(4) .icon::after { content: '🛡'; }
.status-card:nth-of-type(5) .icon::after { content: '💾'; }
.status-card:nth-of-type(6) .icon::after { content: '🖥'; }

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 30px 20px;
        margin: 20px 10px;
    }
    
    h1 {
        font-size: 36px;
    }
    
    .stats-grid, .functions-grid, .tech-specs {
        grid-template-columns: 1fr;
    }
    
    .system-status {
        grid-template-columns: 1fr;
    }
    
    .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Enhanced Print Styles */
@media print {
    body {
        background: white !important;
        color: black !important;
    }
    
    .container {
        box-shadow: none !important;
        border: 1px solid #ccc !important;
        background: white !important;
    }
    
    .browser-notice {
        display: none !important;
    }
}

/* Accessibility Enhancements */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
</style>
</head>
<body>
<div class='container'>
    <div class='header'>
        <h1>Get-PCInfo Enhanced</h1>
        <p class='subtitle'>Napredni sustav za upravljanje IT infrastrukturom</p>
        <div class='status-badge'>
            Sustav operativan
        </div>
    </div>

    <div class='browser-notice'>
        Ova stranica je automatski generirana i trebala bi se otvoriti u vašem web pregledniku!
    </div>

    <div class='system-status'>
        <div class='status-card'>
            <span class='icon'></span>
            <h3>Računalo</h3>
            <p class='status-value'>DESKTOP-NQNN5RG</p>
            <p>Dell Inc. OptiPlex 5070</p>
        </div>
        <div class='status-card'>
            <span class='icon'></span>
            <h3>Korisnik</h3>
            <p class='status-value'>Ivica Raššan</p>
            <p>i</p>
        </div>
        <div class='status-card'>
            <span class='icon'></span>
            <h3>PowerShell</h3>
            <p class='status-value'>v5.1.17763.7131</p>
            <p>.NET 4.0.30319.42000</p>
        </div>
        <div class='status-card'>
            <span class='icon'></span>
            <h3>Privilegije</h3>
            <p class='status-value'>Administrator</p>
            <p>Povišene</p>
        </div>
        <div class='status-card'>
            <span class='icon'></span>
            <h3>Memorija</h3>
            <p class='status-value'>7.79 GB</p>
            <p>Fizička RAM memorija</p>
        </div>
        <div class='status-card'>
            <span class='icon'></span>
            <h3>Procesori</h3>
            <p class='status-value'>6</p>
            <p>CPU jezgara</p>
        </div>
    </div>

    <div class='version-info'>
        <h2>Enhanced verzija: 2.1 Professional Enhanced</h2>
        <p><strong>Datum izdanja:</strong> 2025.6.16</p>
        <p><strong>Poboljšao:</strong> Enhanced by System Admin Tools</p>
        <p><strong>Platforma:</strong> PowerShell 5.1.17763.7131 / Microsoft Windows NT 6.2.9200.0</p>
        <p><strong>Generirano:</strong> 16.06.2025 10:18:49</p>
    </div>

    <div class='execution-metrics'>
        <h3>Metrike izvršavanja</h3>
        <div class='metrics-grid'>
            <div class='metric-item'>
                <div class='metric-value'>3</div>
                <div class='metric-label'>Dovršeni koraci</div>
            </div>
            <div class='metric-item'>
                <div class='metric-value'>0.22s</div>
                <div class='metric-label'>Vrijeme generiranja</div>
            </div>
            <div class='metric-item'>
                <div class='metric-value'>0</div>
                <div class='metric-label'>Greške</div>
            </div>
            <div class='metric-item'>
                <div class='metric-value'>0</div>
                <div class='metric-label'>Upozorenja</div>
            </div>
        </div>
    </div>

    <h2>Pregled aplikacije</h2>
    <p>
        <span class='highlight'>Get-PCInfo Enhanced</span> predstavlja najnapredniji PowerShell-based sustav za upravljanje IT infrastrukturom, 
        dizajniran posebno za potrebe modernih IT odjela. Aplikacija kombinira mogućnosti PowerShell-a s intuitivnim grafičkim sučeljem, 
        omogućujući sistemskim administratorima potpunu kontrolu nad lokalnim korisničkim računima, hardverskim resursima, 
        sigurnosnim komponentama i sustavskim događajima.
    </p>
    
    <p>
        Kroz elegantno dizajnirano sučelje s tabovima, aplikacija pruža centralizirani pristup svim kritičnim informacijama o računalu, 
        automatski generirajući profesionalne HTML izvještaje s modernim glassmorphism dizajnom. Svaki izvještaj je personaliziran 
        s podacima o korisniku koji ga je kreirao, što osigurava potpunu transparentnost i odgovornost.
    </p>

    <h2>Kompletna lista funkcionalnosti</h2>
    <div class='functions-grid'>
        <div class='function-card'>
            <h4>Generate-UserReport</h4>
            <p>Detaljan pregled svih lokalnih korisničkih računa s informacijama o statusu, lozinkama, grupama i SID-ovima</p>
        </div>
        <div class='function-card'>
            <h4>Generate-GroupUserReport</h4>
            <p>Analiza lokalnih grupa i njihovih članova s detaljnim informacijama o korisničkim ulogama</p>
        </div>
        <div class='function-card'>
            <h4>Generate-LogonHTMLReport</h4>
            <p>Praćenje korisničkih prijava i odjava kroz EventLog s analizom sesija i trajanja</p>
        </div>
        <div class='function-card'>
            <h4>Generate-InactiveUsersReport</h4>
            <p>Identifikacija neaktivnih korisničkih računa s detaljnim statusom lozinki i administratorskim pravima</p>
        </div>
        <div class='function-card'>
            <h4>Generate-FolderPermissionsReport</h4>
            <p>Analiza prava pristupa folderima s detaljnim prikazom dozvola za organizacijske strukture</p>
        </div>
        <div class='function-card'>
            <h4>Generate-USBUserReport</h4>
            <p>Praćenje USB aktivnosti s identifikacijom korisnika i vremenskim okvirom korištenja</p>
        </div>
        <div class='function-card'>
            <h4>Generate-KreiranjeKRComparisonReport</h4>
            <p>Usporedba datuma kreiranja korisničkih računa iz različitih izvora (EventLog, WMI, Registry)</p>
        </div>
        <div class='function-card'>
            <h4>Generate-DeletedUsersReport</h4>
            <p>Praćenje izbrisanih korisničkih računa kroz EventLog s informacijama o administratoru</p>
        </div>
        <div class='function-card'>
            <h4>Generate-PrinterReport</h4>
            <p>Analiza instaliranih printera, povijesti printanja i statusu redova za ispis</p>
        </div>
        <div class='function-card'>
            <h4>Generate-AdminGroupReport</h4>
            <p>Pregled članova lokalne Administrators grupe s detaljnim informacijama o privilegijama</p>
        </div>
        <div class='function-card'>
            <h4>Generate-InstalledProgramsReport</h4>
            <p>Popis instaliranih programa s verzijama, proizvođačima i datumima instalacije</p>
        </div>
        <div class='function-card'>
            <h4>Generate-SerialNumberReport</h4>
            <p>Prikupljanje serijskih brojeva svih hardverskih komponenti s poboljšanom USB detekcijom</p>
        </div>
    </div>

    <h2>Ključne značajke</h2>
    <div class='feature'>
        <h3>Upravljanje korisničkim računima</h3>
        <ul>
            <li>Pregled svih lokalnih korisnika s detaljnim informacijama o statusu</li>
            <li>Analiza lozinki: datum postavljanja, istek i sigurnosni status</li>
            <li>Praćenje posljednje prijave i aktivnosti korisnika</li>
            <li>Identifikacija administratorskih računa i privilegija</li>
            <li>Analiza članstva u grupama i korisničkih uloga</li>
            <li>Detekcija neaktivnih i onemogućenih računa</li>
        </ul>
    </div>

    <div class='feature'>
        <h3>Sigurnost i nadzor</h3>
        <ul>
            <li>Kontinuirano praćenje korisničkih prijava kroz Windows EventLog</li>
            <li>Analiza USB aktivnosti s identifikacijom korisnika i uređaja</li>
            <li>Praćenje administratorskih aktivnosti i promjena</li>
            <li>Nadzor brisanja korisničkih računa s vremenom i izvorima</li>
            <li>Analiza prava pristupa folderima i datotekama</li>
            <li>Detekcija sigurnosnih anomalija i neobičnih aktivnosti</li>
        </ul>
    </div>

    <div class='feature'>
        <h3>Sistemski resursi i hardver</h3>
        <ul>
            <li>Detaljan popis hardverskih komponenti (CPU, RAM, GPU, storage)</li>
            <li>Prikupljanje serijskih brojeva s naprednom USB detekcijom</li>
            <li>BIOS informacije i datum instalacije operativnog sustava</li>
            <li>Analiza instaliranih programa i softverskih komponenti</li>
            <li>Pregled mrežnih adaptera i konfiguracija</li>
            <li>Status i konfiguracija instaliranih printera</li>
        </ul>
    </div>

    <div class='feature'>
        <h3>Napredni izvještaji</h3>
        <ul>
            <li>Automatsko generiranje HTML izvještaja s modernim dizajnom</li>
            <li>Personalizirani izvještaji s podacima o kreatoru</li>
            <li>Enhanced glassmorphism dizajn s smooth animacijama</li>
            <li>Responzivni dizajn prilagođen svim uređajima</li>
            <li>Detaljne statistike i metrike za svaki aspekt sustava</li>
            <li>Mogućnost izvoza u različite formate</li>
        </ul>
    </div>

    <h2>Tehničke specifikacije</h2>
    <div class='tech-specs'>
        <div class='tech-card'>
            <h3>Platforme</h3>
            <p>Windows 10 (1909+)<br>Windows 11<br>Windows Server 2016+<br>Windows Server 2019/2022</p>
        </div>
        <div class='tech-card'>
            <h3>Sistemski zahtjevi</h3>
            <p>PowerShell 5.1+<br>.NET Framework 4.5+<br>WMI/CIM podrška<br>EventLog pristup</p>
        </div>
        <div class='tech-card'>
            <h3>Ovisnosti</h3>
            <p>System.Windows.Forms<br>System.Drawing<br>Microsoft.PowerShell.Utility<br>CimCmdlets</p>
        </div>
        <div class='tech-card'>
            <h3>Privilegije</h3>
            <p>Administratorski pristup<br>SeSecurityPrivilege<br>SeBackupPrivilege<br>Local Group Policy</p>
        </div>
    </div>

    <h2>Statistike sustava</h2>
    <div class='stats-grid'>
        <div class='stat-card'>
            <h3>Funkcije</h3>
            <p><strong>12</strong><br>Unificiranih funkcija</p>
        </div>
        <div class='stat-card'>
            <h3>Izvještaji</h3>
            <p><strong>12</strong><br>Tipova izvještaja</p>
        </div>
        <div class='stat-card'>
            <h3>Podaci</h3>
            <p><strong>100+</strong><br>Tipova podataka</p>
        </div>
        <div class='stat-card'>
            <h3>Dizajn</h3>
            <p><strong>Glassmorphism</strong><br>Moderni CSS3</p>
        </div>
        <div class='stat-card'>
            <h3>Responzivnost</h3>
            <p><strong>100%</strong><br>Svi uređaji</p>
        </div>
        <div class='stat-card'>
            <h3>Performanse</h3>
            <p><strong>Optimizirano</strong><br>Brzo učitavanje</p>
        </div>
    </div>

    <h2>Prednosti korištenja</h2>
    <div class='feature'>
        <ul>
            <li><strong>Vremenska efikasnost:</strong> Automatizacija složenih administrativnih zadataka</li>
            <li><strong>Centralizirani pristup:</strong> Sve informacije dostupne iz jednog sučelja</li>
            <li><strong>Sigurnosni nadzor:</strong> Kontinuirano praćenje korisničkih aktivnosti</li>
            <li><strong>Profesionalni izvještaji:</strong> Vizualno atraktivni dokumenti za management</li>
            <li><strong>Skalabilnost:</strong> Prilagodljiv različitim veličinama organizacija</li>
            <li><strong>Pouzdanost:</strong> Stabilno rješenje temeljeno na PowerShell-u</li>
            <li><strong>Transparentnost:</strong> Svi izvještaji personalizirani s podacima o kreatoru</li>
            <li><strong>Modernizacija:</strong> Suvremeni dizajn i tehnologije</li>
        </ul>
    </div>

    <h2>Način korištenja</h2>
    <p>
        Aplikacija se pokreće s <span class='highlight'>administratorskim privilegijama</span> putem PowerShell ISE ili 
        PowerShell konzole. Sustav automatski detektira dostupne komponente i generira izvještaje za sve module. 
        Svaki izvještaj se otvara u novom prozoru preglednika s mogućnostima pretraživanja, sortiranja i izvoza podataka.
    </p>
    
    <p>
        Korisnici mogu koristiti sustav za redovite sigurnosne provjere, inventarizaciju hardvera, nadzor korisničkih 
        aktivnosti ili generiranje izvještaja za compliance zahtjeve. Svi podaci se prikupljaju u stvarnom vremenu 
        direktno iz Windows sustava.
    </p>

    <h2>Buduće nadogradnje</h2>
    <div class='feature'>
        <ul>
            <li>Integracija s Active Directory službe</li>
            <li>Automatsko slanje izvještaja putem e-maila</li>
            <li>Mogućnost scheduliranja izvještaja</li>
            <li>Integracija s SIEM sustavima</li>
            <li>Mobilna aplikacija za pregled izvještaja</li>
            <li>Napredna analitika i machine learning</li>
        </ul>
    </div>

    <h2>Podrška i kontakt</h2>
    <p>
        Za tehničku podršku, prijedloge poboljšanja ili prijave grešaka, molimo kontaktirajte razvojni tim. 
        Aplikacija se kontinuirano razvija s novim funkcionalnostima i poboljšanjima na temelju korisničkih 
        povratnih informacija i tehnoloških trendova.
    </p>

    <div class='footer'>
        <p>
            <strong>Copyright 2025 Enhanced by System Admin Tools v2.1 Professional Enhanced</strong><br>
            Sva prava pridržana. Ova aplikacija je razvijena za potrebe IT administracije.<br>
            <em>Build: 20250616-1018 | PowerShell 5.1.17763.7131 | .NET 4.0.30319.42000</em><br>
            <strong>Generirano na:</strong> DESKTOP-NQNN5RG | 16.06.2025 10:18:49<br>
            <strong>Vrijeme izvršavanja:</strong> 0.22 sekundi<br>
			<strong>Created by Ivica Rašan @ 2025</strong>
        </p>
    </div>
</div>

<script>
// Enhanced JavaScript za bolje korisničko iskustvo
document.addEventListener('DOMContentLoaded', function() {
    // Prikaži poruku da je stranica učitana
    console.log('Enhanced InfoTab uspješno učitan!');
    console.log('System Admin Tools v2.1 Professional Enhanced');
    console.log('Generirano u 0.22s');
    
    // Dodaj notification da je stranica otvorena
    if (window.navigator && navigator.vibrate) {
        navigator.vibrate(200);
    }
    
    // Dodaj title notification
    document.title = 'Get-PCInfo Enhanced - Uspješno učitano!';
    
    // Dodaj smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Dodaj animaciju na scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out';
                entry.target.style.opacity = '1';
            }
        });
    }, observerOptions);
    
    // Promatraj sve glavne sekcije
    document.querySelectorAll('.feature, .stat-card, .function-card, .tech-card, .status-card').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
    
    // Dodaj copy funkcionalnost za highlight elemente
    document.querySelectorAll('.highlight').forEach(el => {
        el.title = 'Kliknite za kopiranje';
        el.addEventListener('click', function() {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(this.textContent).then(() => {
                    const original = this.textContent;
                    this.textContent = 'Kopirano!';
                    this.style.background = 'var(--success-gradient)';
                    setTimeout(() => {
                        this.textContent = original;
                        this.style.background = 'var(--warning-gradient)';
                    }, 1500);
                });
            }
        });
    });
    
    // Dodaj hover effect na status cards
    document.querySelectorAll('.status-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Auto-remove browser notice after 5 seconds
    const browserNotice = document.querySelector('.browser-notice');
    if (browserNotice) {
        setTimeout(() => {
            browserNotice.style.animation = 'fadeInUp 0.5s ease-out reverse';
            setTimeout(() => {
                browserNotice.style.display = 'none';
            }, 500);
        }, 5000);
    }
});

// Focus window if opened programmatically
window.focus();

// Add visibility change handler
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('Stranica je sada aktivna!');
        document.title = 'Get-PCInfo Enhanced - Aktivno';
    }
});
</script>
</body>
</html>`;

// Prebacivanje tabova
function switchTab(tabName, event) {
    // Ažuriranje aktivnog taba
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (event) {
        event.currentTarget.classList.add('active');
    }
    
    // Ažuriranje zaglavlja sadržaja
    const contentHeader = document.getElementById('contentHeader');
    contentHeader.innerHTML = `
        <h2>${tabTitles[tabName] || tabName}</h2>
        <div class="header-line"></div>
    `;
    
    // Ažuriranje tijela sadržaja
    const contentBody = document.getElementById('contentBody');
    
    if (tabName === 'home') {
        contentBody.innerHTML = getHomeContent();
        initLiveStats();
    } else if (tabName === 'info') {
        // Poseban prikaz za Info tab
        contentBody.innerHTML = `
            <div class="fade-in">
                <iframe 
                    srcdoc="${infoTabContent.replace(/"/g, '&quot;')}" 
                    class="info-iframe"
                    frameborder="0"
                    scrolling="auto">
                </iframe>
            </div>
        `;
    } else {
        const description = tabDescriptions[tabName] || '';
        const exeName = exeMapping[tabName];
        
        contentBody.innerHTML = `
            <div class="fade-in">
                <div class="glass-card" style="margin-bottom: 30px;">
                    <p style="color: #ccc; line-height: 1.6;">${description}</p>
                </div>
                <button class="execute-button" onclick="executeScript('${tabName}')">
                    Pokreni analizu
                </button>
                <div id="result" style="display: none;"></div>
            </div>
        `;
    }
}

// Početni sadržaj
function getHomeContent() {
    return `
        <div class="welcome-content fade-in">
            <div class="hero-section">
                <h2 class="hero-title">Dobrodošli u Get-PCInfo</h2>
                <p class="hero-subtitle">Odaberite opciju iz izbornika za početak rada.</p>
            </div>
            
            <div class="feature-cards">
                <div class="feature-card-3d">
                    <div class="card-inner">
                        <div class="card-front">
                            <div class="feature-icon">👤</div>
                            <h3>Upravljanje korisnicima</h3>
                        </div>
                        <div class="card-back">
                            <p>Pregled i upravljanje lokalnim korisničkim računima</p>
                        </div>
                    </div>
                </div>
                <div class="feature-card-3d">
                    <div class="card-inner">
                        <div class="card-front">
                            <div class="feature-icon">🔒</div>
                            <h3>Sigurnost</h3>
                        </div>
                        <div class="card-back">
                            <p>Analiza dozvola i sigurnosnih postavki</p>
                        </div>
                    </div>
                </div>
                <div class="feature-card-3d">
                    <div class="card-inner">
                        <div class="card-front">
                            <div class="feature-icon">💻</div>
                            <h3>Hardver</h3>
                        </div>
                        <div class="card-back">
                            <p>Informacije o hardverskim komponentama</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="live-stats">
                <h3>Statistike sustava uživo</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-header">
                            <span>CPU korištenje</span>
                            <span class="stat-live" id="cpuUsage">0%</span>
                        </div>
                        <div class="stat-bar">
                            <div class="stat-fill cpu-fill" id="cpuFill"></div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span>RAM korištenje</span>
                            <span class="stat-live" id="ramUsage">0%</span>
                        </div>
                        <div class="stat-bar">
                            <div class="stat-fill ram-fill" id="ramFill"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Izvršavanje skripte
async function executeScript(tabName) {
    const button = document.querySelector('.execute-button');
    const resultDiv = document.getElementById('result');
    const exeName = exeMapping[tabName];
    
    if (!exeName) {
        showError('Skripta nije pronađena za ovaj tab.');
        return;
    }
    
    // Onemogućavanje gumba i prikaz učitavanja
    button.disabled = true;
    button.textContent = 'Izvršavanje...';
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p class="loading-text">Izvršavanje ${exeName}...</p>
        </div>
    `;
    
    try {
        // Poziv Electron IPC-a za izvršavanje skripte
        if (window.electronAPI && window.electronAPI.executeScript) {
            const result = await window.electronAPI.executeScript(exeName);
            
            // Prikaz rezultata
            if (result.success) {
                // Provjera postoji li HTML sadržaj
                if (result.html && result.html.trim() !== '') {
                    resultDiv.innerHTML = `
                        <div class="success glass-card" style="margin-bottom: 20px;">
                            <p style="margin: 0;">✓ Skripta uspješno izvršena</p>
                        </div>
                        <div class="result-container glass-card">
                            <div class="result-html">${result.html}</div>
                        </div>
                    `;
                } else if (result.stdout) {
                    // Ako nema HTML-a ali postoji stdout, prikaži stdout
                    resultDiv.innerHTML = `
                        <div class="success glass-card" style="margin-bottom: 20px;">
                            <p style="margin: 0;">✓ Skripta uspješno izvršena</p>
                        </div>
                        <div class="result-container glass-card">
                            <pre>${result.stdout}</pre>
                        </div>
                    `;
                } else {
                    resultDiv.innerHTML = `
                        <div class="success glass-card" style="margin-bottom: 20px;">
                            <p style="margin: 0;">✓ Skripta uspješno izvršena</p>
                        </div>
                        <div class="result-container glass-card">
                            <p>Skripta je izvršena, ali nije generiran vidljiv izlaz.</p>
                        </div>
                    `;
                }
            } else {
                showError(result.error || 'Greška pri izvršavanju skripte');
            }
        } else {
            // Za demo svrhe kada nije u Electronu
            setTimeout(() => {
                resultDiv.innerHTML = `
                    <div class="success glass-card" style="margin-bottom: 20px;">
                        <p style="margin: 0;">✓ Skripta uspješno izvršena (demo način rada)</p>
                    </div>
                    <div class="result-container glass-card">
                        <div class="result-html">
                            <h3>Rezultati analize</h3>
                            <p>Ovo je demo prikaz. U pravoj aplikaciji ovdje bi bili prikazani HTML rezultati iz ${exeName}</p>
                        </div>
                    </div>
                `;
            }, 2000);
        }
    } catch (error) {
        showError(error.message);
    } finally {
        // Ponovno omogućavanje gumba
        button.disabled = false;
        button.textContent = 'Pokreni ponovo';
    }
}

// Prikaz poruke o grešci
function showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<div class="error glass-card">Greška: ${message}</div>`;
}

// Kontrole prozora
function minimizeWindow() {
    if (window.electronAPI && window.electronAPI.minimize) {
        window.electronAPI.minimize();
    }
}

function maximizeWindow() {
    if (window.electronAPI && window.electronAPI.maximize) {
        window.electronAPI.maximize();
    }
}

function closeWindow() {
    if (window.electronAPI && window.electronAPI.close) {
        window.electronAPI.close();
    } else {
        if (confirm('Želite li zatvoriti aplikaciju?')) {
            window.close();
        }
    }
}

// Success i error stilovi
const styleElement = document.createElement('style');
styleElement.textContent = `
    .success {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #10b981;
        padding: 20px;
        border-radius: 15px;
        margin: 20px 0;
    }
    
    .error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
        padding: 20px;
        border-radius: 15px;
        margin: 20px 0;
    }
    
    .result-container {
        background: rgba(255, 255, 255, 0.03);
        padding: 30px;
        border-radius: 15px;
        overflow-x: auto;
    }
    
    .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 30px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
`;
document.head.appendChild(styleElement);

// Inicijalizacija pri učitavanju
document.addEventListener('DOMContentLoaded', () => {
    // Postavljanje početnog aktivnog taba
    const firstTab = document.querySelector('.tab');
    if (firstTab) firstTab.classList.add('active');
    
    // Inicijalizacija particle sistema
    initParticles();
    
    // Ažuriranje sistema preview
    updateSystemPreview();
    
    // Resize handler za particle canvas
    window.addEventListener('resize', () => {
        const canvas = document.getElementById('particleCanvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
});