const express = require('express')
const router = express.Router()
const sysinfo = require('../services/sysinfoService')

const AI_SIGNATURES = [
  'ollama', 'lmstudio', 'llama', 'whisper',
  'stable-diffusion', 'koboldcpp', 'text-generation',
  'python', 'llamafile'
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
      .slice() // copy
      .sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
      .slice(0, 15)

    // Return full list (sorted by pid) plus top CPU and AI subsets
    const allByPid = enriched.slice().sort((a, b) => (a.pid || 0) - (b.pid || 0))

    res.json({ all: allByPid, top: topProcesses, ai: aiProcesses })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router