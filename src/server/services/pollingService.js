const si = require('systeminformation')

function safeNumber(v, fallback = 0) {
  if (v == null || v === '') return fallback
  return Number(v) || fallback
}

const state = {
  metrics: null,
  gpu: null,
  processes: null,
}

async function pollMetrics() {
  try {
    const [cpu, mem, diskStats, network, disks] = await Promise.all([
      si.currentLoad().catch(() => ({ currentLoad: 0, cpus: [] })),
      si.mem().catch(() => ({ total: 0, used: 0, free: 0 })),
      si.fsStats().catch(() => ({ rIO_sec: 0, wIO_sec: 0 })),
      si.networkStats().catch(() => []),
      si.fsSize().catch(() => []),
    ])

    const totalDisk = disks.reduce((s, d) => s + safeNumber(d.size), 0)
    const usedDisk = disks.reduce((s, d) => s + safeNumber(d.used), 0)

    state.metrics = {
      cpu: {
        usage: parseFloat(safeNumber(cpu.currentLoad).toFixed(1)),
        cores: (cpu.cpus || []).map(c => parseFloat(safeNumber(c.load).toFixed(1))),
      },
      memory: {
        total: safeNumber(mem.total),
        used: safeNumber(mem.used),
        free: safeNumber(mem.free),
        usedPercent: parseFloat(
          ((safeNumber(mem.used) / Math.max(1, safeNumber(mem.total))) * 100).toFixed(1)
        ),
      },
      disk: {
        total: totalDisk,
        used: usedDisk,
        usedPercent: totalDisk > 0
          ? parseFloat(((usedDisk / totalDisk) * 100).toFixed(1))
          : 0,
        readSpeed: safeNumber(diskStats?.rIO_sec),
        writeSpeed: safeNumber(diskStats?.wIO_sec),
      },
      network: {
        rx: safeNumber(network?.[0]?.rx_sec),
        tx: safeNumber(network?.[0]?.tx_sec),
      },
    }
  } catch (err) {
    console.error('[Polling] metrics error:', err.message)
  }
}

async function pollGPU() {
  try {
    const graphics = await si.graphics().catch(() => ({ controllers: [] }))
    const gpus = (graphics.controllers || []).map(c => {
      let usagePercent = null
      const u = c.utilizationGpu
      if (u != null) {
        if (typeof u === 'number') usagePercent = parseFloat(u)
        else if (typeof u === 'object') {
          const key = ['gpu', 'gpuUtilization', 'utilization', 'percentage']
            .find(k => u[k] != null)
          if (key) usagePercent = parseFloat(u[key])
        }
      }
      return {
        name: c.model || 'Unknown GPU',
        vendor: c.vendor || 'Unknown',
        vramMB: safeNumber(c.vram),
        vramGB: parseFloat((safeNumber(c.vram) / 1024).toFixed(1)),
        usagePercent,
        temperature: c.temperatureGpu ?? null,
      }
    })
    state.gpu = {
      gpus,
      primary: gpus[0] || null,
      count: gpus.length,
      detected: gpus.length > 0,
    }
  } catch (err) {
    console.error('[Polling] GPU error:', err.message)
  }
}

async function pollProcesses() {
  try {
    const result = await si.processes().catch(() => ({ list: [] }))
    const totalMemBytes = state.metrics?.memory?.total || 0

    state.processes = (result.list || []).map(p => {
      const memPercent = safeNumber(p.mem)
      const memRssRaw = safeNumber(p.memRss)

      // On Windows, systeminformation can return memRss in KB instead of bytes
      // depending on the OS version and how PowerShell reports WorkingSet64.
      // A real process using even 1 MB will have memRss >= 1,048,576 if in bytes.
      // If it's smaller but non-zero, it's almost certainly KB — multiply by 1024.
      let memoryBytes = 0
      if (memRssRaw >= 1024 * 1024) {
        // Looks like bytes already (>= 1 MB threshold)
        memoryBytes = memRssRaw
      } else if (memRssRaw > 0) {
        // Likely in KB — convert to bytes
        memoryBytes = memRssRaw * 1024
      }

      // If memRss was 0 (Windows permission quirk or missing field),
      // fall back to deriving bytes from the memory percentage × total RAM.
      // This is independent of memRss units and is always reliable.
      if (memoryBytes === 0 && memPercent > 0 && totalMemBytes > 0) {
        memoryBytes = Math.round((memPercent / 100) * totalMemBytes)
      }

      return {
        pid: p.pid,
        name: p.name,
        cpu: safeNumber(p.cpu),
        memory: memPercent,
        memoryBytes,
        command: p.command || '',
        diskReadBytes: safeNumber(p.io_read_bytes ?? p.ioReadBytes ?? 0),
        diskWriteBytes: safeNumber(p.io_write_bytes ?? p.ioWriteBytes ?? 0),
        gpuUsagePercent: p.gpu ? safeNumber(p.gpu) : null,
      }
    })
  } catch (err) {
    console.error('[Polling] processes error:', err.message)
  }
}

// ── Getters — instant, no OS call, return cached state ───────────
function getLiveMetrics() {
  return state.metrics || {
    cpu: { usage: 0, cores: [] },
    memory: { total: 0, used: 0, free: 0, usedPercent: 0 },
    disk: { total: 0, used: 0, usedPercent: 0, readSpeed: 0, writeSpeed: 0 },
    network: { rx: 0, tx: 0 },
  }
}

function getGPUInfo() {
  return state.gpu || { gpus: [], primary: null, count: 0, detected: false }
}

function getProcesses() {
  return state.processes || []
}

async function startPolling() {
  console.log('[Polling] Starting — metrics:4s GPU:7s processes:6s')

  // Initial fetch — populate state before anything reads it
  await pollMetrics()
  await pollGPU()
  await pollProcesses()

  // Stagger intervals so they never overlap
  setInterval(pollMetrics, 4000)
  setTimeout(() => setInterval(pollGPU, 7000), 1500)
  setTimeout(() => setInterval(pollProcesses, 6000), 3000)

  console.log('[Polling] All loops running')
}

module.exports = { startPolling, getLiveMetrics, getGPUInfo, getProcesses }