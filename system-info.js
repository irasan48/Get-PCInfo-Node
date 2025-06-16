const os = require('os');
const si = require('systeminformation');

class SystemInfo {
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor(seconds % (3600 * 24) / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        return `${days}d ${hours}h ${minutes}m`;
    }

    async getAllSystemInfo() {
        try {
            const [cpu, mem, graphics, diskLayout, osInfo] = await Promise.all([
                si.cpu(),
                si.mem(),
                si.graphics(),
                si.diskLayout(),
                si.osInfo()
            ]);

            let totalDiskSpace = 0;
            diskLayout.forEach(disk => {
                totalDiskSpace += disk.size || 0;
            });

            return {
                computerName: os.hostname(),
                userName: os.userInfo().username,
                domain: process.env.USERDOMAIN || 'WORKGROUP',
                timestamp: new Date().toISOString(),
                
                os: {
                    name: `${osInfo.distro} ${osInfo.release}`,
                    platform: osInfo.platform,
                    version: osInfo.kernel,
                    architecture: osInfo.arch,
                    uptime: this.formatUptime(os.uptime())
                },

                cpu: {
                    manufacturer: cpu.manufacturer,
                    brand: cpu.brand,
                    model: `${cpu.manufacturer} ${cpu.brand}`,
                    speed: `${cpu.speed}GHz`,
                    cores: cpu.cores,
                    physicalCores: cpu.physicalCores
                },

                memory: {
                    total: this.formatBytes(mem.total),
                    totalGB: Math.round(mem.total / (1024 * 1024 * 1024)),
                    free: this.formatBytes(mem.free),
                    used: this.formatBytes(mem.used),
                    usage: Math.round((mem.used / mem.total) * 100)
                },

                graphics: graphics.controllers,

                storage: {
                    total: this.formatBytes(totalDiskSpace),
                    totalGB: Math.round(totalDiskSpace / (1024 * 1024 * 1024)),
                    disks: diskLayout
                }
            };
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}

module.exports = SystemInfo;