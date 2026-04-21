import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Clock, Activity, BellRing, TrendingUp } from 'lucide-react'

const API = 'http://localhost:5001/api'

export default function Analytics() {
  const [sessions, setSessions] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, summaryRes] = await Promise.all([
          fetch(`${API}/analytics/sessions`),
          fetch(`${API}/analytics/summary`),
        ])
        const sessionsData = await sessionsRes.json()
        const summaryData = await summaryRes.json()
        setSessions(sessionsData)
        setSummary(summaryData)
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const chartData = sessions
    .slice()
    .reverse()
    .map((s, i) => ({
      name: 'S' + (i + 1),
      peakCPU: s.peakCPU,
      peakRAM: s.peakRAM,
      alerts: s.totalAlerts || 0,
      duration: s.endTime && s.startTime
        ? parseFloat(((new Date(s.endTime) - new Date(s.startTime)) / 60000).toFixed(1))
        : 0,
    }))

  const formatMinutes = (mins) => {
    if (mins < 60) return mins + ' min'
    return (mins / 60).toFixed(1) + ' hrs'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Historical session data and system trends</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Sessions',
            value: summary?.totalSessions ?? 0,
            icon: Activity,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
          },
          {
            label: 'Total Monitoring Time',
            value: formatMinutes(summary?.totalMinutes ?? 0),
            icon: Clock,
            color: 'text-green-400',
            bg: 'bg-green-500/10 border-green-500/20',
          },
          {
            label: 'Avg Peak CPU',
            value: (summary?.avgPeakCPU ?? 0) + '%',
            icon: TrendingUp,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10 border-orange-500/20',
          },
          {
            label: 'Total Alerts Generated',
            value: summary?.totalAlerts ?? 0,
            icon: BellRing,
            color: 'text-red-400',
            bg: 'bg-red-500/10 border-red-500/20',
          },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">{card.label}</span>
              <card.icon size={15} className={card.color} />
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Peak CPU and RAM chart */}
      {chartData.length > 0 ? (
        <>
          <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
            <h2 className="text-sm font-medium text-white mb-4">Peak CPU and RAM per Session</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#555' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#555' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                  labelStyle={{ color: '#888', fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#888' }} />
                <Bar dataKey="peakCPU" name="Peak CPU %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="peakRAM" name="Peak RAM %" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Session history table */}
          <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
            <h2 className="text-sm font-medium text-white mb-4">Session History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-[#222]">
                    <th className="text-left pb-3 pr-4">Started</th>
                    <th className="text-left pb-3 pr-4">Duration</th>
                    <th className="text-left pb-3 pr-4">Peak CPU</th>
                    <th className="text-left pb-3 pr-4">Peak RAM</th>
                    <th className="text-left pb-3 pr-4">Alerts</th>
                    <th className="text-left pb-3">AI Processes</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {sessions.map((s) => {
                    const duration = s.endTime && s.startTime
                      ? ((new Date(s.endTime) - new Date(s.startTime)) / 60000).toFixed(1)
                      : '-'
                    return (
                      <tr key={s._id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]">
                        <td className="py-2 pr-4 text-gray-300">
                          {new Date(s.startTime).toLocaleString()}
                        </td>
                        <td className="py-2 pr-4 text-gray-400">{duration} min</td>
                        <td className="py-2 pr-4 text-blue-400 font-medium">{s.peakCPU}%</td>
                        <td className="py-2 pr-4 text-purple-400 font-medium">{s.peakRAM}%</td>
                        <td className="py-2 pr-4 text-red-400">{s.totalAlerts || 0}</td>
                        <td className="py-2 text-gray-500 text-xs">
                          {s.aiProcessesDetected?.length > 0
                            ? s.aiProcessesDetected.map(p => p.name).join(', ')
                            : 'None'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[#141414] border border-[#222] rounded-xl">
          <Activity size={40} className="text-gray-700 mb-3" />
          <p className="text-gray-500 font-medium">No completed sessions yet</p>
          <p className="text-gray-700 text-sm mt-1">
            Close and reopen the app to complete a session and see data here
          </p>
        </div>
      )}
    </div>
  )
}