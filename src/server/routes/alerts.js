const express = require('express')
const router = express.Router()
const Alert = require('../models/Alert')

router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(50)
    res.json(alerts)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const alert = new Alert(req.body)
    await alert.save()
    res.json(alert)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/resolve', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    )
    res.json(alert)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router