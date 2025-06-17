class PCInfoApp {
    constructor() {
        this.currentData = {};
        this.init();
    }

    init() {
        this.setupTabs();
        this.loadDashboard();
        this.setupKeyboardShortcuts();
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // Update active button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active content
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
                
                // Load tab content
                this.loadTabContent(tabId);
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch(e.key) {
                    case '1': this.switchTab('dashboard'); break;
                    case '2': this.switchTab('users'); break;
                    case '3': this.switchTab('system'); break;
                    case '4': this.switchTab('processes'); break;
                    case '5': this.switchTab('programs'); break;
                    case '6': this.switchTab('usb'); break;
                    case '7': this.switchTab('events'); break;
                    case '8': this.switchTab('about'); break;
                }
            }
        });
    }

    switchTab(tabId) {
        document.querySelector(`[data-tab="${tabId}"]`).click();
    }

    async loadDashboard() {
        try {
            const systemInfo = await window.electronAPI.getSystemInfo();
            if (systemInfo) {
                document.getElementById('system-hostname').textContent = systemInfo.hostname;
                document.getElementById('system-username').textContent = systemInfo.username;
                document.getElementById('system-platform').textContent = systemInfo.platform;
                document.getElementById('system-uptime').textContent = this.formatUptime(systemInfo.uptime);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async loadTabContent(tabId) {
        switch (tabId) {
            case 'users':
                await this.loadUsers();
                break;
            case 'system':
                await this.loadSystemInfo();
                break;
            case 'processes':
                await this.loadProcesses();
                break;
            case 'programs':
                await this.loadPrograms();
                break;
            case 'usb':
                await this.loadUSBDevices();
                break;
            case 'events':
                await this.loadEvents();
                break;
        }
    }

    async loadUsers() {
        try {
            const users = await window.electronAPI.getLocalUsers();
            this.currentData.users = users;
            
            const content = document.getElementById('users-content');
            
            if (users.length === 0) {
                content.innerHTML = '<p>Nema pronađenih korisnika.</p>';
                return;
            }

            const table = this.createTable(
                ['Korisničko ime', 'Status'],
                users.map(user => [user.name, user.status])
            );
            
            content.innerHTML = table;
        } catch (error) {
            console.error('Error loading users:', error);
            document.getElementById('users-content').innerHTML = '<p>Greška pri učitavanju korisnika.</p>';
        }
    }

    async loadSystemInfo() {
        try {
            const systemInfo = await window.electronAPI.getSystemInfo();
            this.currentData.system = systemInfo;
            
            const content = document.getElementById('system-content');
            
            if (!systemInfo) {
                content.innerHTML = '<p>Greška pri učitavanju sistemskih informacija.</p>';
                return;
            }

            const data = [
                ['Hostname', systemInfo.hostname],
                ['Username', systemInfo.username],
                ['Platform', systemInfo.platform],
                ['Architecture', systemInfo.arch],
                ['OS', `${systemInfo.os.distro} ${systemInfo.os.release}`],
                ['CPU Model', systemInfo.cpu.model],
                ['CPU Cores', systemInfo.cpu.cores],
                ['Total Memory', this.formatBytes(systemInfo.memory.total)],
                ['Free Memory', this.formatBytes(systemInfo.memory.free)],
                ['Uptime', this.formatUptime(systemInfo.uptime)]
            ];

            const table = this.createTable(['Property', 'Value'], data);
            content.innerHTML = table;
        } catch (error) {
            console.error('Error loading system info:', error);
            document.getElementById('system-content').innerHTML = '<p>Greška pri učitavanju sistemskih informacija.</p>';
        }
    }

    async loadProcesses() {
        try {
            const processes = await window.electronAPI.getProcesses();
            this.currentData.processes = processes;
            
            const content = document.getElementById('processes-content');
            
            if (processes.length === 0) {
                content.innerHTML = '<p>Nema pronađenih procesa.</p>';
                return;
            }

            const table = this.createTable(
                ['PID', 'Name', 'CPU %', 'Memory %'],
                processes.map(proc => [
                    proc.pid,
                    proc.name,
                    proc.cpu?.toFixed(2) || '0',
                    proc.mem?.toFixed(2) || '0'
                ])
            );
            
            content.innerHTML = table;
        } catch (error) {
            console.error('Error loading processes:', error);
            document.getElementById('processes-content').innerHTML = '<p>Greška pri učitavanju procesa.</p>';
        }
    }

    async loadPrograms() {
        try {
            const programs = await window.electronAPI.getInstalledPrograms();
            this.currentData.programs = programs;
            
            const content = document.getElementById('programs-content');
            
            if (programs.length === 0) {
                content.innerHTML = '<p>Nema pronađenih programa.</p>';
                return;
            }

            const table = this.createTable(
                ['Name', 'Vendor', 'Version'],
                programs.map(prog => [prog.name, prog.vendor, prog.version])
            );
            
            content.innerHTML = table;
        } catch (error) {
            console.error('Error loading programs:', error);
            document.getElementById('programs-content').innerHTML = '<p>Greška pri učitavanju programa.</p>';
        }
    }

    async loadUSBDevices() {
        try {
            const devices = await window.electronAPI.getUSBDevices();
            this.currentData.usb = devices;
            
            const content = document.getElementById('usb-content');
            
            if (devices.length === 0) {
                content.innerHTML = '<p>Nema pronađenih USB uređaja.</p>';
                return;
            }

            const table = this.createTable(
                ['Name', 'Vendor', 'Type'],
                devices.map(device => [
                    device.name || 'Unknown',
                    device.vendor || 'Unknown',
                    device.type || 'Unknown'
                ])
            );
            
            content.innerHTML = table;
        } catch (error) {
            console.error('Error loading USB devices:', error);
            document.getElementById('usb-content').innerHTML = '<p>Greška pri učitavanju USB uređaja.</p>';
        }
    }

    async loadEvents() {
        try {
            const events = await window.electronAPI.getEventLogs();
            this.currentData.events = events;
            
            const content = document.getElementById('events-content');
            
            if (events.length === 0) {
                content.innerHTML = '<p>Nema pronađenih event logova.</p>';
                return;
            }

            const table = this.createTable(
                ['Time', 'Event ID', 'Level'],
                events.map(event => [event.time, event.id, event.level])
            );
            
            content.innerHTML = table;
        } catch (error) {
            console.error('Error loading events:', error);
            document.getElementById('events-content').innerHTML = '<p>Greška pri učitavanju event logova.</p>';
        }
    }

    createTable(headers, data) {
        let html = '<table class="table">';
        
        // Headers
        html += '<thead><tr>';
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead>';
        
        // Data
        html += '<tbody>';
        data.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${cell || ''}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody>';
        
        html += '</table>';
        return html;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    }

    async exportData(tabName, format) {
        const data = this.currentData[tabName];
        if (!data) {
            alert('Nema podataka za export!');
            return;
        }

        const filename = `pcinfo_${tabName}_${new Date().toISOString().split('T')[0]}.${format}`;
        
        try {
            const result = await window.electronAPI.exportData(format, data, filename);
            if (result.success) {
                const openFile = confirm(`Datoteka je izvezena uspješno!\n${result.path}\n\nŽelite li otvoriti datoteku?`);
                if (openFile) {
                    window.electronAPI.openFile(result.path);
                }
            } else {
                alert('Greška pri exportu: ' + (result.error || 'Nepoznata greška'));
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Greška pri exportu datoteke!');
        }
    }
}

// Global functions for HTML onclick handlers
window.exportData = (tabName, format) => app.exportData(tabName, format);
window.refreshUsers = () => app.loadUsers();
window.refreshProcesses = () => app.loadProcesses();
window.refreshUSB = () => app.loadUSBDevices();
window.refreshEvents = () => app.loadEvents();

// Initialize app
const app = new PCInfoApp();