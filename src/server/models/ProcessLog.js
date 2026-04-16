const mongoose = require('mongoose')

const processLogSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  processName: {
    type: String,
    required: true,
  },
  pid: {
    type: Number,
  },
  type: {
    type: String,
    enum: ['ai', 'system', 'other'],
    default: 'other',
  },
  runtime: {
    type: String,
  },
  cpuHistory: [{
    value: Number,
    timestamp: Date,
  }],
  ramHistory: [{
    value: Number,
    timestamp: Date,
  }],
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
}, { timestamps: true })

module.exports = mongoose.model('ProcessLog', processLogSchema)