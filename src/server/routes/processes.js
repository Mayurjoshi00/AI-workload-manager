const express = require('express')
const router = express.Router()
const sysinfo = require('../services/sysinfoService')

const AI_SIGNATURES = [
  'ollama', 'lmstudio', 'llama', 'whisper',
  'stable-diffusion', 'koboldcpp', 'text-generation',
  'llamafile', 'localai', 'jan', 'mistral',
]

router.get('/', async (req, res) => {
  try {
    const list = await sysinfo.getProcesses()

    const enriched = list.map(p => ({
      ...p,
      isAI: AI_SIGNATURES.some(sig =>
        (p.name || '').toLowerCase().includes(sig) ||
        (p.command || '').toLowerCase().includes(sig)
      ),
    }))

    const aiProcesses = enriched.filter(p => p.isAI)
    const topProcesses = enriched
      .slice()
      .sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
      .slice(0, 15)

    // ── AI-specific resource aggregation ──────────────────────────
    const totalAICPU = aiProcesses.reduce((sum, p) => sum + (p.cpu || 0), 0)
    const totalAIMemBytes = aiProcesses.reduce((sum, p) => sum + (p.memoryBytes || 0), 0)
    const totalAIMemPercent = aiProcesses.reduce((sum, p) => sum + (p.memory || 0), 0)

    const aiResources = {
      totalCPUPercent: parseFloat(totalAICPU.toFixed(1)),
      totalRAMBytes: totalAIMemBytes,
      totalRAMPercent: parseFloat(totalAIMemPercent.toFixed(1)),
      totalRAMGB: parseFloat((totalAIMemBytes / 1024 / 1024 / 1024).toFixed(2)),
      processCount: aiProcesses.length,
      breakdown: aiProcesses.map(p => ({
        pid: p.pid,
        name: p.name,
        cpu: parseFloat((p.cpu || 0).toFixed(1)),
        memoryGB: parseFloat((p.memoryBytes / 1024 / 1024 / 1024).toFixed(2)),
        memoryPercent: parseFloat((p.memory || 0).toFixed(1)),
        command: p.command,
      }))
    }
    // ──────────────────────────────────────────────────────────────

    const allByPid = enriched.slice().sort((a, b) => (a.pid || 0) - (b.pid || 0))

    res.json({ all: allByPid, top: topProcesses, ai: aiProcesses, aiResources })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router