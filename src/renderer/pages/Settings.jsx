import React, { useState, useEffect } from 'react'
import {
  Bell, RefreshCw, Trash2, Info, Save,
  CheckCircle, AlertTriangle, Cpu, MemoryStick, Monitor
} from 'lucide-react'

const API = 'http://localhost:5001/api'

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-blue-400" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

function SliderRow({ label, value, min, max, step = 1, unit, onChange, color = 'blue' }) {
  const percent = ((value - min) / (max - min)) * 100
  const colorMap = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
  }
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-400 w-32 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-blue-500 cursor-pointer"
      />
      <span className={`text-sm font-semibold w-16 text-right shrink-0 ${colorMap[color]}`}>
        {value}{unit}
      </span>
    </div>
  )
}

export default function Settings() {
  const [saved, setSaved] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearDone, setClearDone] = useState(false)
  const [alertCount, setAlertCount] = useState(null)

  // Alert thresholds
  const [cpuThreshold, setCpuThreshold] = useState(85)
  const [memThreshold, setMemThreshold] = useState(85)
  const [gpuThreshold, setGpuThreshold] = useState(90)

  // Polling intervals
  const [metricsInterval, setMetricsInterval] = useState(4)
  const [processInterval, setProcessInterval] = useState(6)
  const [gpuInterval, setGpuInterval] = useState(7)

  // Load saved settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('awm_settings')
    if (saved) {
      try {
        const s = JSON.parse(saved)
        if (s.cpuThreshold) setCpuThreshold(s.cpuThreshold)
        if (s.memThreshold) setMemThreshold(s.memThreshold)
        if (s.gpuThreshold) setGpuThreshold(s.gpuThreshold)
        if (s.metricsInterval) setMetricsInterval(s.metricsInterval)
        if (s.processInterval) setProcessInterval(s.processInterval)
        if (s.gpuInterval) setGpuInterval(s.gpuInterval)
      } catch (e) {}
    }

    // Fetch alert count for display
    fetch(`${API}/alerts`)
      .then(r => r.json())
      .then(data => setAlertCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setAlertCount(0))
  }, [])

  const handleSave = () => {
    const settings = {
      cpuThreshold,
      memThreshold,
      gpuThreshold,
      metricsInterval,
      processInterval,
      gpuInterval,
    }
    localStorage.setItem('awm_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleClearAlerts = async () => {
    if (!window.confirm('Clear all saved alerts from the database? This cannot be undone.')) return
    setClearing(true)
    try {
      await fetch(`${API}/alerts/clear`, { method: 'DELETE' })
      setAlertCount(0)
      setClearDone(true)
      setTimeout(() => setClearDone(false), 2500)
    } catch (err) {
      console.error('Failed to clear alerts:', err)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure thresholds, intervals and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            saved
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {saved ? <CheckCircle size={15} /> : <Save size={15} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Alert Thresholds */}
      <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
        <SectionTitle
          icon={Bell}
          title="Alert Thresholds"
          subtitle="Alerts fire when resource usage crosses these values. Cooldown is 1 minute between same-type alerts."
        />
        <div className="space-y-5">
          <SliderRow
            label="CPU Threshold"
            value={cpuThreshold}
            min={50}
            max={99}
            unit="%"
            onChange={setCpuThreshold}
            color="blue"
          />
          <SliderRow
            label="Memory Threshold"
            value={memThreshold}
            min={50}
            max={99}
            unit="%"
            onChange={setMemThreshold}
            color="purple"
          />
          <SliderRow
            label="GPU Threshold"
            value={gpuThreshold}
            min={50}
            max={99}
            unit="%"
            onChange={setGpuThreshold}
            color="orange"
          />
        </div>

        {/* Threshold preview */}
        <div className="mt-5 pt-4 border-t border-[#222] grid grid-cols-3 gap-3">
          {[
            { label: 'CPU Alert', value: cpuThreshold, color: 'blue', icon: Cpu },
            { label: 'RAM Alert', value: memThreshold, color: 'purple', icon: MemoryStick },
            { label: 'GPU Alert', value: gpuThreshold, color: 'orange', icon: Monitor },
          ].map(item => (
            <div key={item.label} className={`rounded-lg p-3 bg-${item.color}-500/5 border border-${item.color}-500/20`}>
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon size={12} className={`text-${item.color}-400`} />
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
              <p className={`text-lg font-bold text-${item.color}-400`}>{item.value}%</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-600 mt-3">
          Note: Threshold changes take effect after restarting the app. The alert cooldown of 1 minute is fixed.
        </p>
      </div>

      {/* Polling Intervals */}
      <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
        <SectionTitle
          icon={RefreshCw}
          title="Polling Intervals"
          subtitle="How often the app reads system data. Higher values = lower CPU usage from the app itself."
        />
        <div className="space-y-5">
          <SliderRow
            label="Metrics refresh"
            value={metricsInterval}
            min={2}
            max={10}
            unit="s"
            onChange={setMetricsInterval}
            color="green"
          />
          <SliderRow
            label="Process refresh"
            value={processInterval}
            min={4}
            max={15}
            unit="s"
            onChange={setProcessInterval}
            color="green"
          />
          <SliderRow
            label="GPU refresh"
            value={gpuInterval}
            min={5}
            max={20}
            unit="s"
            onChange={setGpuInterval}
            color="green"
          />
        </div>
        <p className="text-xs text-gray-600 mt-4">
          Note: Interval changes take effect after restarting the app. Current defaults are metrics:4s, processes:6s, GPU:7s.
        </p>
      </div>

      {/* Data Management */}
      <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
        <SectionTitle
          icon={Trash2}
          title="Data Management"
          subtitle="Manage stored alerts and session history in the local MongoDB database."
        />
        <div className="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-4 py-3">
          <div>
            <p className="text-sm text-white font-medium">Saved Alerts</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {alertCount === null ? 'Loading...' : `${alertCount} alert${alertCount !== 1 ? 's' : ''} stored in database`}
            </p>
          </div>
          <button
            onClick={handleClearAlerts}
            disabled={clearing || alertCount === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              clearDone
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {clearDone ? <CheckCircle size={13} /> : <Trash2 size={13} />}
            {clearDone ? 'Cleared!' : clearing ? 'Clearing...' : 'Clear All Alerts'}
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
        <SectionTitle
          icon={Info}
          title="About"
          subtitle="Project information and tech stack"
        />
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-[#1f1f1f]">
            <span className="text-gray-500">Project</span>
            <span className="text-white font-medium">AI Workload Manager</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#1f1f1f]">
            <span className="text-gray-500">Version</span>
            <span className="text-white">v1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#1f1f1f]">
            <span className="text-gray-500">Course</span>
            <span className="text-white">25MCA26 — Full Stack Development</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#1f1f1f]">
            <span className="text-gray-500">Institute</span>
            <span className="text-white">Ramaiah Institute of Technology</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#1f1f1f]">
            <span className="text-gray-500">Stack</span>
            <span className="text-white">Electron + MongoDB + Express + React + Node.js</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#1f1f1f]">
            <span className="text-gray-500">AI</span>
            <span className="text-white">Gemini 2.0 Flash</span>
          </div>
          <div className="py-2">
            <span className="text-gray-500 block mb-2">Team</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Mayur Joshi', role: 'Backend Developer' },
                { name: 'Abhimanyu', role: 'Frontend Developer' },
                { name: 'Harsha', role: 'Database Designer' },
                { name: 'Nisarga', role: 'Documentation & Testing' },
              ].map(member => (
                <div key={member.name} className="bg-[#1a1a1a] rounded-lg px-3 py-2">
                  <p className="text-white text-xs font-medium">{member.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Warning box */}
      <div className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3">
        <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-500/80">
          Settings are saved locally in your browser. Threshold and interval changes require an app restart to take effect. Clearing alerts cannot be undone.
        </p>
      </div>
    </div>
  )
}