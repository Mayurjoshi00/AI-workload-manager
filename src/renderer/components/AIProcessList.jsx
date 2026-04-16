import React from 'react'
import useProcessStore from '../store/processStore'
import { Bot, AlertTriangle } from 'lucide-react'

export default function AIProcessList() {
  const { aiProcesses, processes } = useProcessStore()

  const topProcesses = processes.slice(0, 8)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* AI Processes */}
      <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Bot size={16} className="text-blue-400" />
          <h2 className="text-sm font-medium text-white">AI Processes</h2>
          <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
            {aiProcesses.length} detected
          </span>
        </div>
        {aiProcesses.length === 0 ? (
          <div className="text-center py-8">
            <Bot size={32} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No AI processes running</p>
            <p className="text-gray-700 text-xs mt-1">Start Ollama or LM Studio to see them here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {aiProcesses.map((p) => (
              <div key={p.pid} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm text-white font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">PID {p.pid}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-400 font-medium">{p.cpu?.toFixed(1)}% CPU</p>
                  <p className="text-xs text-gray-500">{p.memory?.toFixed(1)}% RAM</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Processes */}
      <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-orange-400" />
          <h2 className="text-sm font-medium text-white">Top Processes by CPU</h2>
        </div>
        <div className="space-y-2">
          {topProcesses.map((p) => (
            <div key={p.pid} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                {p.isAI && <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />}
                <p className="text-sm text-white">{p.name}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${p.cpu > 50 ? 'text-red-400' : p.cpu > 20 ? 'text-orange-400' : 'text-green-400'}`}>
                  {p.cpu?.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}