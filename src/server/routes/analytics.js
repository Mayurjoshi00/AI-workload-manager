const express = require('express')
const router = express.Router()
const Session = require('../models/Session')

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ startTime: -1 }).limit(30)
    res.json(sessions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/sessions', async (req, res) => {
  try {
    const session = new Session(req.body)
    await session.save()
    res.json(session)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router