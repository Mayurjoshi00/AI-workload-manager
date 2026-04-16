const mongoose = require('mongoose')

const userPreferencesSchema = new mongoose.Schema({
  alertThresholds: {
    cpu: { type: Number, default: 85 },
    memory: { type: Number, default: 85 },
    gpu: { type: Number, default: 90 },
  },
  refreshInterval: {
    type: Number,
    default: 2000,
  },
  theme: {
    type: String,
    enum: ['dark', 'light'],
    default: 'dark',
  },
  notifications: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true })

module.exports = mongoose.model('UserPreferences', userPreferencesSchema)