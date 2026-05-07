const sysinfo = require('./sysinfoService')
const Alert = require('../models/Alert')
const { updateSession, incrementAlertCount } = require('./sessionService')

const THRESHOLDS = {
  cpu: 85,
  memory: 85,
  gpu: 90,
}

const lastAlertTime = {
  cpu: 0,
  memory: 0,
  gpu: 0,
}

const COOLDOWN_MS = 60000

async function checkAndSaveAlert(type, value, message, suggestion, processName = null) {
  const now = Date.now()
  if (now - lastAlertTime[type] < COOLDOWN_MS) return
  lastAlertTime[type] = now
  const severity = value >= 95 ? 'critical' : value >= 85 ? 'high' : 'medium'
  try {
    const alert = new Alert({ type, severity, message, suggestion, processName })
    await alert.save()
    await incrementAlertCount()
    console.log('[AlertEngine] Saved alert:', message)
    return alert
  } catch (err) {
    console.error('[AlertEngine] Failed to save alert:', err.message)
  }
}

async function runChecks(aiProcesses = []) {
  try {
    const live = await sysinfo.getLiveMetrics()
    const gpuInfo = await sysinfo.getGPUInfo()

    const cpuUsage = parseFloat(live.cpu.usage || 0)
    const ramUsage = parseFloat(live.memory.usedPercent || 0)
    const gpu = gpuInfo.primary
    const gpuUsage = gpu?.usagePercent ?? null

    // Update session with latest metrics
    await updateSession(cpuUsage, ramUsage, gpuUsage, aiProcesses)

    if (cpuUsage >= THRESHOLDS.cpu) {
      await checkAndSaveAlert(
        'cpu', cpuUsage,
        'CPU usage is critically high at ' + cpuUsage + '%',
        'Check the Processes tab and close unused applications.'
      )
    }

    if (ramUsage >= THRESHOLDS.memory) {
      const usedGB = (mem.used / 1024 / 1024 / 1024).toFixed(1)
      const totalGB = (mem.total / 1024 / 1024 / 1024).toFixed(1)
      await checkAndSaveAlert(
        'memory', ramUsage,
        'Memory usage is high at ' + ramUsage + '% (' + usedGB + ' GB of ' + totalGB + ' GB used)',
        'Consider stopping any local AI models to free up RAM.'
      )
    }

    if (gpuUsage !== null && gpuUsage >= THRESHOLDS.gpu) {
      await checkAndSaveAlert(
        'gpu', gpuUsage,
        'GPU utilisation is very high at ' + gpuUsage + '%',
        'Consider switching to a smaller quantised model to reduce GPU load.',
        gpu?.model,
      )
    }

  } catch (err) {
    console.error('[AlertEngine] Check failed:', err.message)
  }
}

function startAlertEngine(intervalMs = 10000) {
  console.log('[AlertEngine] Started - checking every ' + (intervalMs / 1000) + ' seconds')
  runChecks([])
  return setInterval(() => runChecks([]), intervalMs)
}

module.exports = { startAlertEngine }