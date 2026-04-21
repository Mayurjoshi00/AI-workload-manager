const express = require('express')
const router = express.Router()
const si = require('systeminformation')

router.get('/live', async (req, res) => {
  try {
    const [cpu, mem, diskStats, network, disks] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsStats(),
      si.networkStats(),
      si.fsSize(),
    ])

    const totalDisk = disks.reduce((sum, item) => sum + (item.size || 0), 0)
    const usedDisk = disks.reduce((sum, item) => sum + (item.used || 0), 0)
    const usedDiskPercent = totalDisk > 0 ? ((usedDisk / totalDisk) * 100).toFixed(1) : '0.0'

    res.json({
      cpu: {
        usage: cpu.currentLoad.toFixed(1),
        cores: cpu.cpus.map(c => c.load.toFixed(1)),
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usedPercent: ((mem.used / mem.total) * 100).toFixed(1),
      },
      disk: {
        total: totalDisk,
        used: usedDisk,
        usedPercent: usedDiskPercent,
        readSpeed: diskStats?.rIO_sec || 0,
        writeSpeed: diskStats?.wIO_sec || 0,
      },
      network: {
        rx: network[0]?.rx_sec || 0,
        tx: network[0]?.tx_sec || 0,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/gpu', async (req, res) => {
  try {
    const graphics = await si.graphics()
    const gpus = (graphics.controllers || []).map((controller) => {
      const usagePercent = controller.utilizationGpu == null
        ? null
        : Number(controller.utilizationGpu)

      return {
        name: controller.model || 'Unknown GPU',
        vendor: controller.vendor || 'Unknown',
        vramMB: controller.vram || 0,
        vramGB: Number(((controller.vram || 0) / 1024).toFixed(1)),
        usagePercent,
        temperature: controller.temperatureGpu == null ? null : Number(controller.temperatureGpu),
      }
    })

    res.json({
      gpus,
      primary: gpus[0] || null,
      count: gpus.length,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router