// All polling is centralized in pollingService.js
// This file just re-exports so existing routes need no changes
const polling = require('./pollingService')

module.exports = {
  getLiveMetrics: polling.getLiveMetrics,
  getGPUInfo: polling.getGPUInfo,
  getProcesses: polling.getProcesses,
}