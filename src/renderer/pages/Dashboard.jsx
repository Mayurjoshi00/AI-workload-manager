import React from 'react'
import useMetrics from '../hooks/useMetrics'
import useMetricsStore from '../store/metricsStore'
import useProcessStore from '../store/processStore'
import MetricCard from '../components/MetricCard'
import CPUChart from '../components/CPUChart'
import MemoryChart from '../components/MemoryChart'
import AIProcessList from '../components/AIProcessList'
import { Cpu, MemoryStick, HardDrive, Wifi, Bot, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  useMetrics(3000)

  const { cpu, memory, disk, network, isLoading } = useMetricsStore()
  const { aiProcesses, aiResources } = useProcessStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Connecting to system...</p>
        </div>
      </div>
    )
  }

  const formatBytes = (bytes) => {
    if (!bytes) return '0 GB'
    return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB'
  }

  const formatSpeed = (bytes) => {
    if (!bytes) return '0 KB/s'
    if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB/s'
    return (bytes / 1024).toFixed(1) + ' KB/s'
  }

  const hasAI = aiResources.processCount > 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">System Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Real-time monitoring — updates every 3 seconds
        </p>
      </div>

      {/* AI Process Banner */}
      {hasAI && (
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <p className="text-blue-300 text-sm">
            <span className="font-semibold">{aiResources.processCount} AI process{aiResources.processCount > 1 ? 'es' : ''} detected</span>
            {' '}— consuming <span className="font-semibold">{aiResources.totalCPUPercent}% CPU</span> and <span className="font-semibold">{aiResources.totalRAMGB} GB RAM</span>
          </p>
        </div>
      )}

      {/* ── AI-SPECIFIC RESOURCE SECTION ───────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bot size={16} className="text-blue-400" />
          <h2 className="text-sm font-semibold text-white">AI Process Resource Usage</h2>
          <span className="text-xs text-gray-500 ml-1">— what AI is consuming on your machine</span>
        </div>

        {hasAI ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              title="AI CPU Usage"
              value={`${aiResources.totalCPUPercent}%`}
              subtitle={`Across ${aiResources.processCount} AI process${aiResources.processCount > 1 ? 'es' : ''}`}
              icon={Cpu}
              color="blue"
              percent={Math.min(aiResources.totalCPUPercent, 100)}
            />
            <MetricCard
              title="AI RAM Usage"
              value={`${aiResources.totalRAMGB} GB`}
              subtitle={`${aiResources.totalRAMPercent}% of total RAM`}
              icon={MemoryStick}
              color="purple"
              percent={Math.min(aiResources.totalRAMPercent, 100)}
            />
            {aiResources.breakdown.map((p) => (
              <div key={p.pid} className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wider truncate pr-2">{p.name}</span>
                  <Bot size={14} className="text-blue-400 shrink-0" />
                </div>
                <p className="text-xl font-bold text-white">{p.cpu}% <span className="text-sm font-normal text-gray-400">CPU</span></p>
                <p className="text-xs text-gray-500 mt-1">{p.memoryGB} GB RAM ({p.memoryPercent}%)</p>
                <div className="w-full bg-[#222] rounded-full h-1.5 mt-3">
                  <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(p.cpu, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#222] rounded-xl px-5 py-6 flex items-center gap-4">
            <Bot size={28} className="text-gray-700 shrink-0" />
            <div>
              <p className="text-gray-400 text-sm font-medium">No AI processes running</p>
              <p className="text-gray-600 text-xs mt-0.5">Start Ollama, LM Studio, or any local AI model to see its resource usage here</p>
            </div>
          </div>
        )}
      </div>

      {/* ── SYSTEM TOTAL SECTION ───────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={15} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-400">Total System Usage</h2>
          <span className="text-xs text-gray-600 ml-1">— entire machine including all processes</span>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            title="CPU Usage"
            value={`${cpu?.usage ?? 0}%`}
            subtitle={`${cpu?.cores?.length ?? 0} cores`}
            icon={Cpu}
            color="blue"
            percent={parseFloat(cpu?.usage ?? 0)}
          />
          <MetricCard
            title="Memory Used"
            value={formatBytes(memory?.used)}
            subtitle={`of ${formatBytes(memory?.total)} — ${memory?.usedPercent ?? 0}%`}
            icon={MemoryStick}
            color="purple"
            percent={parseFloat(memory?.usedPercent ?? 0)}
          />
          <MetricCard
            title="Disk Usage"
            value={formatBytes(disk?.used)}
            subtitle={`of ${formatBytes(disk?.total)} — ${disk?.usedPercent ?? 0}%`}
            icon={HardDrive}
            color="green"
            percent={parseFloat(disk?.usedPercent ?? 0)}
          />
          <MetricCard
            title="Network"
            value={formatSpeed(network?.rx)}
            subtitle={`Upload: ${formatSpeed(network?.tx)}`}
            icon={Wifi}
            color="orange"
            percent={null}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CPUChart />
        <MemoryChart />
      </div>

      {/* AI Processes detail */}
      <AIProcessList />
    </div>
  )
}