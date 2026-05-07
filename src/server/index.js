require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const { startAlertEngine } = require('./services/alertEngine')
const { startSession, endSession } = require('./services/sessionService')

const metricsRouter = require('./routes/metrics')
const processesRouter = require('./routes/processes')
const alertsRouter = require('./routes/alerts')
const analyticsRouter = require('./routes/analytics')

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

app.use('/api/metrics', metricsRouter)
app.use('/api/processes', processesRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/analytics', analyticsRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Workload Manager server running' })
})

function startServerAndServices(mongoConnected = false) {
  app.listen(PORT, async () => {
    console.log('Server running on port ' + PORT)
    if (process.send) process.send('Server ready')
    if (mongoConnected) {
      try {
        await startSession()
        startAlertEngine(10000)
      } catch (err) {
        console.error('Failed to start DB-backed services:', err.message)
      }
    } else {
      console.warn('MongoDB not connected: session and alert services disabled')
    }
  })
}

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected')
      startServerAndServices(true)
    })
    .catch((err) => {
      console.error('MongoDB connection failed:', err.message)
      console.warn('Starting server without MongoDB-backed services')
      startServerAndServices(false)
    })
} else {
  console.warn('MONGO_URI not set; starting server without MongoDB-backed services')
  startServerAndServices(false)
}

// End session cleanly when server stops (only relevant if DB services started)
process.on('SIGINT', async () => {
  try { await endSession() } catch (e) { }
  process.exit(0)
})

process.on('SIGTERM', async () => {
  try { await endSession() } catch (e) { }
  process.exit(0)
})