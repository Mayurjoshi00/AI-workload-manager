const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  peakCPU: {
    type: Number,
    default: 0,
  },
  peakRAM: {
    type: Number,
    default: 0,
  },
  peakGPU: {
    type: Number,
    default: 0,
  },
  avgCPU: {
    type: Number,
    default: 0,
  },
  avgRAM: {
    type: Number,
    default: 0,
  },
  aiProcessesDetected: [{
    name: String,
    runtime: String,
    peakMemory: Number,
  }],
  totalAlerts: {
    type: Number,
    default: 0,
  },
}, { timestamps: true })

module.exports = mongoose.model('Session', sessionSchema)