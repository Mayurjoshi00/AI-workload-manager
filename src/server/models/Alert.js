const mongoose = require('mongoose')

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['cpu', 'memory', 'gpu', 'ai_process', 'general'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  suggestion: {
    type: String,
  },
  processName: {
    type: String,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true })

module.exports = mongoose.model('Alert', alertSchema)