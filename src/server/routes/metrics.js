const express = require('express')
const router = express.Router()
const si = require('systeminformation')

router.get('/live', async (req, res) => {
  try {
    const [cpu, mem, disk, network] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsStats(),
      si.networkStats(),
    ])

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
        readSpeed: disk.rIO_sec,
        writeSpeed: disk.wIO_sec,
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
    const gpu = await si.graphics()
    res.json(gpu.controllers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router