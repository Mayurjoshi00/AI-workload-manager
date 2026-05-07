const si = require('systeminformation')

function safeNumber(v, fallback = 0) {
  if (v === undefined || v === null) return fallback
  if (typeof v === 'string' && v.trim() === '') return fallback
  return Number(v)
}

async function getLiveMetrics() {
  try {
    const [cpu, mem, diskStats, network, disks] = await Promise.all([
      si.currentLoad().catch(() => ({})),
      si.mem().catch(() => ({})),
      si.fsStats().catch(() => ({})),
      si.networkStats().catch(() => ([])),
      si.fsSize().catch(() => ([])),
    ])

    const totalDisk = (disks || []).reduce((sum, item) => sum + (item.size || 0), 0)
    const usedDisk = (disks || []).reduce((sum, item) => sum + (item.used || 0), 0)
    const usedDiskPercent = totalDisk > 0 ? ((usedDisk / totalDisk) * 100).toFixed(1) : '0.0'

    const rx = (network && network[0] && safeNumber(network[0].rx_sec)) || 0
    const tx = (network && network[0] && safeNumber(network[0].tx_sec)) || 0

    return {
      cpu: {
        usage: Number(safeNumber(cpu.currentLoad, 0).toFixed ? safeNumber(cpu.currentLoad, 0).toFixed(1) : safeNumber(cpu.currentLoad, 0)),
        cores: (cpu.cpus || []).map(c => Number(safeNumber(c.load, 0).toFixed ? safeNumber(c.load, 0).toFixed(1) : safeNumber(c.load, 0))),
      },
      memory: {
        total: safeNumber(mem.total, 0),
        used: safeNumber(mem.used, 0),
        free: safeNumber(mem.free, 0),
        usedPercent: Number(((safeNumber(mem.used, 0) / Math.max(1, safeNumber(mem.total, 1))) * 100).toFixed(1)),
      },
      disk: {
        total: totalDisk,
        used: usedDisk,
        usedPercent: usedDiskPercent,
        readSpeed: safeNumber(diskStats?.rIO_sec, 0),
        writeSpeed: safeNumber(diskStats?.wIO_sec, 0),
      },
      network: {
        rx,
        tx,
      },
    }
  } catch (err) {
    return {
      cpu: { usage: '0.0', cores: [] },
      memory: { total: 0, used: 0, free: 0, usedPercent: '0.0' },
      disk: { total: 0, used: 0, usedPercent: '0.0', readSpeed: 0, writeSpeed: 0 },
      network: { rx: 0, tx: 0 },
    }
  }
}

async function getGPUInfo() {
  try {
    const graphics = await si.graphics().catch(() => ({ controllers: [] }))
    const controllers = graphics.controllers || []
    const gpus = controllers.map((controller) => {
      // utilizationGpu can be a number or an object depending on platform/si version.
      let usagePercent = null
      const u = controller.utilizationGpu
      if (u == null) {
        usagePercent = null
      } else if (typeof u === 'number') {
        usagePercent = safeNumber(u, null)
      } else if (typeof u === 'object') {
        // common shapes: { gpu: 12 }, {gpu: {utilization:12}} or nested keys
        if (u.gpu != null) usagePercent = safeNumber(u.gpu, null)
        else if (u.gpuUtilization != null) usagePercent = safeNumber(u.gpuUtilization, null)
        else if (u.utilization != null) usagePercent = safeNumber(u.utilization, null)
        else if (u.percentage != null) usagePercent = safeNumber(u.percentage, null)
        else {
          // try first numeric property
          const numericKey = Object.keys(u).find(k => typeof u[k] === 'number')
          if (numericKey) usagePercent = safeNumber(u[numericKey], null)
        }
      }

      return {
        name: controller.model || 'Unknown GPU',
        vendor: controller.vendor || 'Unknown',
        vramMB: safeNumber(controller.vram, 0),
        vramGB: Number(((safeNumber(controller.vram, 0) / 1024))).toFixed ? Number(((safeNumber(controller.vram, 0) / 1024)).toFixed(1)) : (safeNumber(controller.vram, 0) / 1024),
        usagePercent: usagePercent === null ? null : Number(usagePercent),
        temperature: controller.temperatureGpu == null ? null : safeNumber(controller.temperatureGpu, null),
      }
    })

    return { gpus, primary: gpus[0] || null, count: gpus.length, detected: gpus.length > 0 }
  } catch (err) {
    return { gpus: [], primary: null, count: 0 }
  }
}

async function getProcesses() {
  try {
    const processes = await si.processes().catch(() => ({ list: [] }))
    const list = (processes.list || []).map(p => ({
      pid: p.pid,
      name: p.name,
        cpu: safeNumber(p.cpu, 0),
        memory: safeNumber(p.mem, 0),
        memoryBytes: safeNumber(p.memRss, 0),
        command: p.command || '',
        // per-process disk IO (best-effort): check common variants returned by si on different platforms
        diskReadBytes: safeNumber(p.io_read_bytes ?? p.ioReadBytes ?? p.read_bytes ?? p.ioRead ?? 0, 0),
        diskWriteBytes: safeNumber(p.io_write_bytes ?? p.ioWriteBytes ?? p.write_bytes ?? p.ioWrite ?? 0, 0),
        // GPU usage per-process is not reliably available across OSes; include if provided
        gpuUsagePercent: p.gpu ? safeNumber(p.gpu, null) : (p.gpuUsage ? safeNumber(p.gpuUsage, null) : null),
    }))

    return list
  } catch (err) {
    return []
  }
}

module.exports = {
  getLiveMetrics,
  getGPUInfo,
  getProcesses,
}
