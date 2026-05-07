const express = require('express')
const router = express.Router()
const sysinfo = require('../services/sysinfoService')

router.get('/live', async (req, res) => {
  try {
    const data = await sysinfo.getLiveMetrics()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/gpu', async (req, res) => {
  try {
    const results = await sysinfo.getGPUInfo()
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router