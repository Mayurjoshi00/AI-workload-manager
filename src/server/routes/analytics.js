const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Session = require('../models/Session')

// Helper: returns true only when Mongoose has an active connection.
// Without this guard, model queries buffer indefinitely when MongoDB
// is not connected, hanging the HTTP request and causing an infinite spinner.
function isMongoConnected() {
  return mongoose.connection.readyState === 1
}

router.get('/sessions', async (req, res) => {
  if (!isMongoConnected()) {
    return res.json([])
  }
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
  if (!isMongoConnected()) {
    return res.json({ totalSessions: 0, totalMinutes: 0, avgPeakCPU: 0, avgPeakRAM: 0, totalAlerts: 0 })
  }
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