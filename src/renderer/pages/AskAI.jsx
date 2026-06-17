import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Cpu, MemoryStick, Loader2, Sparkles } from 'lucide-react'

const API = 'http://localhost:5001/api'

const SUGGESTIONS = [
  'Why is my laptop slow right now?',
  'Which process is using the most CPU?',
  'Is it safe to run an AI model right now?',
  'How much RAM is available for a new model?',
  'What is currently consuming the most memory?',
  'Should I be worried about my current CPU usage?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-blue-600' : 'bg-[#1f1f1f] border border-[#333]'
      }`}>
        {isUser
          ? <User size={15} className="text-white" />
          : <Bot size={15} className="text-blue-400" />
        }
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-blue-600 text-white rounded-tr-sm'
          : 'bg-[#1a1a1a] border border-[#252525] text-gray-200 rounded-tl-sm'
      }`}>
        {msg.content}
        {msg.context && (
          <div className="flex gap-3 mt-2 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1 text-xs text-blue-300">
              <Cpu size={11} /> {msg.context.cpuUsage}% CPU
            </span>
            <span className="flex items-center gap-1 text-xs text-purple-300">
              <MemoryStick size={11} /> {msg.context.ramUsage}% RAM
            </span>
            {msg.context.aiProcessCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-green-300">
                <Bot size={11} /> {msg.context.aiProcessCount} AI process{msg.context.aiProcessCount > 1 ? 'es' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AskAI() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I can see your live system data right now. Ask me anything about your CPU, RAM, GPU, running processes, or whether it\'s safe to run a local AI model.',
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const userMessage = text || input.trim()
    if (!userMessage || isLoading) return

    setInput('')
    setError(null)

    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      // Send only actual conversation (skip the initial greeting)
      const history = newMessages.slice(1, -1)

      const res = await fetch(`${API}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply, context: data.context }
      ])
    } catch (err) {
      setError(err.message)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I ran into an error: ' + err.message + '. Make sure your GEMINI_API_KEY is set correctly in the .env file.',
        }
      ])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const showSuggestions = messages.length <= 1

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
            <Sparkles size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Ask AI</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Gemini has access to your live system data
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Live data</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1f1f1f] border border-[#333] flex items-center justify-center">
              <Bot size={15} className="text-blue-400" />
            </div>
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 size={16} className="text-blue-400 animate-spin" />
            </div>
          </div>
        )}

        {/* Suggestion chips */}
        {showSuggestions && !isLoading && (
          <div className="pt-2">
            <p className="text-xs text-gray-600 mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/5 rounded-full px-3 py-1.5 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-[#1f1f1f]">
        {error && (
          <p className="text-xs text-red-400 mb-2">⚠ {error}</p>
        )}
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your system... (Enter to send)"
            rows={1}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500/50 transition-colors"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-[#1f1f1f] disabled:text-gray-600 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-700 mt-2 text-center">
          Powered by Gemini 2.0 Flash · Context updates on every message
        </p>
      </div>
    </div>
  )
}