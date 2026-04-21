const express = require('express')
const router = express.Router()
const Session = require('../models/Session')

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({ endTime: { $exists: true } })
      .sort({ startTime: -1 })
      .limit(30)
    res.json(sessions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/summary', async (req, res) => {
  try {
    const sessions = await Session.find({ endTime: { $exists: true } })
    const totalSessions = sessions.length
    const totalMinutes = sessions.reduce((sum, s) => {
      if (!s.endTime || !s.startTime) return sum
      return sum + (new Date(s.endTime) - new Date(s.startTime)) / 60000
    }, 0)
    const avgPeakCPU = sessions.length
      ? (sessions.reduce((s, x) => s + x.peakCPU, 0) / sessions.length).toFixed(1)
      : 0
    const avgPeakRAM = sessions.length
      ? (sessions.reduce((s, x) => s + x.peakRAM, 0) / sessions.length).toFixed(1)
      : 0
    const totalAlerts = sessions.reduce((s, x) => s + (x.totalAlerts || 0), 0)

    res.json({
      totalSessions,
      totalMinutes: Math.round(totalMinutes),
      avgPeakCPU,
      avgPeakRAM,
      totalAlerts,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router