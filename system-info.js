const os = require('os');
const { execSync } = require('child_process');
const si = require('systeminformation');
const fs = require('fs');
const path = require('path');

class SystemInfo {
    constructor() {
        this.platform = process.platform;
    }

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    async getAllSystemInfo() {
        try {
            const [cpu, mem, graphics, diskLayout, fsSize, system, bios, baseboard, networkInterfaces, osInfo, users, processes] = await Promise.all([
                si.cpu(),
                si.mem(),
                si.graphics(),
                si.diskLayout(),
                si.fsSize(),
                si.system(),
                si.bios(),
                si.baseboard(),
                si.networkInterfaces(),
                si.osInfo(),
                si.users(),
                si.processes()
            ]);

            let totalDiskSpace = 0;
            let usedDiskSpace = 0;
            
            diskLayout.forEach(disk => {
                totalDiskSpace += disk.size || 0;
            });
            
            fsSize.forEach(fs => {
                usedDiskSpace += fs.used || 0;
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

                graphics: graphics.controllers.map(gpu => ({
                    vendor: gpu.vendor,
                    model: gpu.model,
                    vram: gpu.vram ? `${gpu.vram}MB` : 'N/A',
                    driverVersion: gpu.driverVersion || 'N/A'
                })),

                storage: {
                    total: this.formatBytes(totalDiskSpace),
                    totalGB: Math.round(totalDiskSpace / (1024 * 1024 * 1024)),
                    used: this.formatBytes(usedDiskSpace),
                    free: this.formatBytes(totalDiskSpace - usedDiskSpace),
                    usage: totalDiskSpace > 0 ? Math.round((usedDiskSpace / totalDiskSpace) * 100) : 0,
                    disks: diskLayout.map(disk => ({
                        device: disk.device || disk.name,
                        type: disk.type,
                        size: this.formatBytes(disk.size)
                    }))
                }
            };
        } catch (error) {
            console.error('Error getting system info:', error);
            throw error;
        }
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor(seconds % (3600 * 24) / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        return `${days}d ${hours}h ${minutes}m`;
    }
}

module.exports = SystemInfo;