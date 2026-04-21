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

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected')
    app.listen(PORT, () => {
      console.log('Server running on port ' + PORT)
      if (process.send) process.send('Server ready')
    })
    await startSession()
    startAlertEngine(10000)
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
  })

// End session cleanly when server stops
process.on('SIGINT', async () => {
  await endSession()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await endSession()
  process.exit(0)
})