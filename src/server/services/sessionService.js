const Session = require('../models/Session')

let currentSessionId = null
let peakCPU = 0
let peakRAM = 0
let peakGPU = 0
let totalCPU = 0
let totalRAM = 0
let sampleCount = 0
let detectedAIProcesses = {}

async function startSession() {
  try {
    const session = new Session({
      startTime: new Date(),
      peakCPU: 0,
      peakRAM: 0,
      peakGPU: 0,
      avgCPU: 0,
      avgRAM: 0,
      aiProcessesDetected: [],
      totalAlerts: 0,
    })
    await session.save()
    currentSessionId = session._id
    console.log('[SessionService] Session started:', currentSessionId)
    return session
  } catch (err) {
    console.error('[SessionService] Failed to start session:', err.message)
  }
}

async function updateSession(cpuUsage, ramUsage, gpuUsage, aiProcesses) {
  if (!currentSessionId) return

  try {
    // Update peaks
    if (cpuUsage > peakCPU) peakCPU = cpuUsage
    if (ramUsage > peakRAM) peakRAM = ramUsage
    if (gpuUsage && gpuUsage > peakGPU) peakGPU = gpuUsage

    // Track averages
    totalCPU += cpuUsage
    totalRAM += ramUsage
    sampleCount++

    // Track AI processes
    aiProcesses.forEach(p => {
      detectedAIProcesses[p.name] = {
        name: p.name,
        runtime: p.runtime || 'unknown',
        peakMemory: Math.max(
          detectedAIProcesses[p.name]?.peakMemory || 0,
          p.memoryBytes || 0
        ),
      }
    })

    await Session.findByIdAndUpdate(currentSessionId, {
      peakCPU,
      peakRAM,
      peakGPU,
      avgCPU: parseFloat((totalCPU / sampleCount).toFixed(1)),
      avgRAM: parseFloat((totalRAM / sampleCount).toFixed(1)),
      aiProcessesDetected: Object.values(detectedAIProcesses),
    })

  } catch (err) {
    console.error('[SessionService] Failed to update session:', err.message)
  }
}

async function endSession() {
  if (!currentSessionId) return
  try {
    await Session.findByIdAndUpdate(currentSessionId, {
      endTime: new Date(),
    })
    console.log('[SessionService] Session ended:', currentSessionId)
    currentSessionId = null
  } catch (err) {
    console.error('[SessionService] Failed to end session:', err.message)
  }
}

async function incrementAlertCount() {
  if (!currentSessionId) return
  try {
    await Session.findByIdAndUpdate(currentSessionId, {
      $inc: { totalAlerts: 1 }
    })
  } catch (err) {
    console.error('[SessionService] Failed to increment alert count:', err.message)
  }
}

function getCurrentSessionId() {
  return currentSessionId
}

module.exports = { startSession, updateSession, endSession, incrementAlertCount, getCurrentSessionId }