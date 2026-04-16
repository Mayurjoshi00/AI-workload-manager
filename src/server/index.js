require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const metricsRouter = require('./routes/metrics')
const processesRouter = require('./routes/processes')
const alertsRouter = require('./routes/alerts')
const analyticsRouter = require('./routes/analytics')

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/metrics', metricsRouter)
app.use('/api/processes', processesRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/analytics', analyticsRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Workload Manager server running' })
})

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      if (process.send) process.send('Server ready')
    })
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
  })