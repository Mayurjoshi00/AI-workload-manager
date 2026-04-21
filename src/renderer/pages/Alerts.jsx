import React, { useEffect, useState } from 'react'
import { BellRing, CheckCircle, AlertTriangle, XCircle, Info, RefreshCw } from 'lucide-react'

const API = 'http://localhost:5001/api'

const severityConfig = {
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
    icon: XCircle,
    label: 'Critical',
  },
  high: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/30',
    icon: AlertTriangle,
    label: 'High',
  },
  medium: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    icon: Info,
    label: 'Medium',
  },
  low: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
    icon: Info,
    label: 'Low',
  },
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API}/alerts`)
      const data = await res.json()
      setAlerts(data)
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const resolveAlert = async (id) => {
    try {
      await fetch(`${API}/alerts/${id}/resolve`, { method: 'PATCH' })
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, resolved: true } : a))
    } catch (err) {
      console.error('Failed to resolve alert:', err)
    }
  }

  useEffect(() => {
    fetchAlerts()
    const timer = setInterval(fetchAlerts, 10000)
    return () => clearInterval(timer)
  }, [])

  const filtered = alerts.filter(a => {
    if (filter === 'all') return true
    if (filter === 'active') return !a.resolved
    if (filter === 'resolved') return a.resolved
    return a.severity === filter
  })

  const activeCount = alerts.filter(a => !a.resolved).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Alerts</h1>
          <p className="text-gray-500 text-sm mt-1">
            System health alerts — auto-refreshes every 10 seconds
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-3 py-2 bg-[#1f1f1f] border border-[#333] rounded-lg text-gray-400 hover:text-white text-sm transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: alerts.length, color: 'text-white' },
          { label: 'Active', value: activeCount, color: 'text-red-400' },
          { label: 'Resolved', value: alerts.length - activeCount, color: 'text-green-400' },
          { label: 'Critical', value: alerts.filter(a => a.severity === 'critical').length, color: 'text-red-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#141414] border border-[#222] rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'active', 'resolved', 'critical', 'high', 'medium'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-[#1f1f1f] text-gray-400 hover:text-white border border-[#333]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BellRing size={40} className="text-gray-700 mb-3" />
          <p className="text-gray-500 font-medium">No alerts found</p>
          <p className="text-gray-700 text-sm mt-1">
            {filter === 'all'
              ? 'System is healthy — alerts will appear here when thresholds are crossed'
              : `No ${filter} alerts`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const config = severityConfig[alert.severity] || severityConfig.medium
            const Icon = config.icon
            return (
              <div
                key={alert._id}
                className={`border rounded-xl p-4 ${config.bg} ${alert.resolved ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon size={18} className={`${config.color} mt-0.5 shrink-0`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold uppercase ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-gray-600 uppercase">
                          {alert.type}
                        </span>
                        {alert.resolved && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white font-medium">{alert.message}</p>
                      {alert.suggestion && (
                        <p className="text-xs text-gray-400 mt-1">
                          💡 {alert.suggestion}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <button
                      onClick={() => resolveAlert(alert._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-xs hover:bg-green-500/20 transition-colors shrink-0"
                    >
                      <CheckCircle size={13} />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}