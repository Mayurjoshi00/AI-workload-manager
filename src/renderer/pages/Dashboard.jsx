import React, { useEffect } from 'react'
import useMetrics from '../hooks/useMetrics'
import useMetricsStore from '../store/metricsStore'
import useProcessStore from '../store/processStore'
import MetricCard from '../components/MetricCard'
import CPUChart from '../components/CPUChart'
import MemoryChart from '../components/MemoryChart'
import GPUChart from '../components/GPUChart'
import AIProcessList from '../components/AIProcessList'
import { Cpu, MemoryStick, HardDrive, Wifi, Gpu } from 'lucide-react'

export default function Dashboard() {
  useMetrics(2000)

  const { cpu, memory, disk, network, gpu, isLoading } = useMetricsStore()
  const { aiProcesses } = useProcessStore()

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">System Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Real-time monitoring — updates every 2 seconds
        </p>
      </div>

      {/* AI Process Banner */}
      {aiProcesses.length > 0 && (
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <p className="text-blue-300 text-sm">
            <span className="font-semibold">{aiProcesses.length} AI process{aiProcesses.length > 1 ? 'es' : ''} detected</span>
            {' '}— {aiProcesses.map(p => p.name).join(', ')}
          </p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
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
        <MetricCard
          title="GPU"
          value={`${gpu?.primary?.usagePercent ?? 0}%`}
          subtitle={`${gpu?.primary?.name ?? 'No GPU detected'}${gpu?.primary?.vramGB ? ` — ${gpu.primary.vramGB.toFixed(1)} GB VRAM` : ''}`}
          icon={Gpu}
          color="cyan"
          percent={parseFloat(gpu?.primary?.usagePercent ?? 0)}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <CPUChart />
        <MemoryChart />
        <GPUChart />
      </div>

      {/* AI Processes */}
      <AIProcessList />
    </div>
  )
}