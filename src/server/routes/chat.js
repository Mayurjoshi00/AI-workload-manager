const express = require('express')
const router = express.Router()
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { getLiveMetrics, getGPUInfo, getProcesses } = require('../services/sysinfoService')

const AI_SIGNATURES = [
  'ollama', 'lmstudio', 'llama', 'whisper',
  'stable-diffusion', 'koboldcpp', 'text-generation',
  'llamafile', 'localai', 'jan', 'mistral',
]

function buildSystemContext(metrics, gpu, processes) {
  const AI_SIGNATURES = [
    'ollama', 'lmstudio', 'llama', 'whisper',
    'stable-diffusion', 'koboldcpp', 'text-generation',
    'llamafile', 'localai', 'jan', 'mistral',
  ]

  const aiProcesses = processes.filter(p =>
    AI_SIGNATURES.some(sig =>
      (p.name || '').toLowerCase().includes(sig) ||
      (p.command || '').toLowerCase().includes(sig)
    )
  )

  // Only top 5 processes to keep token count low
  const topProcesses = processes
    .slice()
    .sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
    .slice(0, 5)
    .map(p => `${p.name}: ${p.cpu?.toFixed(1)}% CPU, ${((p.memoryBytes || 0) / 1024 / 1024 / 1024).toFixed(1)}GB RAM`)
    .join(' | ')

  const aiList = aiProcesses.length > 0
    ? aiProcesses.map(p =>
        `${p.name}: ${p.cpu?.toFixed(1)}% CPU, ${((p.memoryBytes || 0) / 1024 / 1024 / 1024).toFixed(1)}GB RAM`
      ).join(' | ')
    : 'None'

  // Keep system prompt short and tight — free tier has low token limits
  return `You are a system assistant for AI Workload Manager.
Live data: CPU ${metrics.cpu.usage}% (${metrics.cpu.cores?.length || 0} cores) | RAM ${((metrics.memory.used || 0) / 1024 / 1024 / 1024).toFixed(1)}GB / ${((metrics.memory.total || 0) / 1024 / 1024 / 1024).toFixed(1)}GB (${metrics.memory.usedPercent}%) | Disk ${metrics.disk.usedPercent}% | Net down ${((metrics.network.rx || 0) / 1024).toFixed(0)}KB/s up ${((metrics.network.tx || 0) / 1024).toFixed(0)}KB/s
GPU: ${gpu.detected ? `${gpu.primary.name} VRAM:${gpu.primary.vramGB}GB usage:${gpu.primary.usagePercent ?? 'N/A'}%` : 'None'}
AI processes: ${aiList}
Top processes: ${topProcesses}
Rules: Answer in 3-4 sentences max. Be specific with the numbers above. Give actionable advice. Suggest terminal commands when relevant.`
}

router.post('/message', async (req, res) => {
  const { message, history = [] } = req.body

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required' })
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set in .env file' })
  }

  try {
    // Get live system data to inject as context
    const metrics = getLiveMetrics()
    const gpu = getGPUInfo()
    const processes = getProcesses()
    const systemContext = buildSystemContext(metrics, gpu, processes)

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemContext,
    })

    // Build conversation history for multi-turn chat
    const chatHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({ history: chatHistory })
    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    res.json({
      reply: text,
      context: {
        cpuUsage: metrics.cpu.usage,
        ramUsage: metrics.memory.usedPercent,
        aiProcessCount: processes.filter(p =>
          AI_SIGNATURES.some(sig =>
            (p.name || '').toLowerCase().includes(sig) ||
            (p.command || '').toLowerCase().includes(sig)
          )
        ).length,
      }
    })
  } catch (err) {
  console.error('[Chat] Gemini API error:', err.message)
  
  let userMessage = 'Something went wrong. Please try again.'
  
  if (err.message?.includes('429') || err.message?.includes('quota')) {
    userMessage = 'Rate limit reached. Please wait a moment and try again. (Free tier allows 15 requests per minute)'
  } else if (err.message?.includes('API_KEY') || err.message?.includes('api key')) {
    userMessage = 'Invalid API key. Please check your GEMINI_API_KEY in the .env file.'
  } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
    userMessage = 'Network error. Please check your internet connection.'
  }
  
  res.status(500).json({ error: userMessage })
}
})

module.exports = router