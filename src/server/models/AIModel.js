const mongoose = require('mongoose')

const aiModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  runtime: {
    type: String,
    enum: ['ollama', 'lmstudio', 'llamacpp', 'other'],
    default: 'other',
  },
  expectedRAM: {
    type: Number,
  },
  expectedVRAM: {
    type: Number,
  },
  lastRun: {
    type: Date,
  },
  runCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true })

module.exports = mongoose.model('AIModel', aiModelSchema)