const express = require('express')
const router = express.Router()
const si = require('systeminformation')

const AI_SIGNATURES = [
  'ollama', 'lmstudio', 'llama', 'whisper',
  'stable-diffusion', 'koboldcpp', 'text-generation',
  'python', 'llamafile'
]

router.get('/', async (req, res) => {
  try {
    const processes = await si.processes()
    const enriched = processes.list.map(p => ({
      pid: p.pid,
      name: p.name,
      cpu: p.cpu,
      memory: p.mem,
      memoryBytes: p.memRss,
      command: p.command,
      isAI: AI_SIGNATURES.some(sig =>
        p.name.toLowerCase().includes(sig) ||
        (p.command && p.command.toLowerCase().includes(sig))
      ),
    }))

    const aiProcesses = enriched.filter(p => p.isAI)
    const topProcesses = enriched
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 15)

    res.json({ all: topProcesses, ai: aiProcesses })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router