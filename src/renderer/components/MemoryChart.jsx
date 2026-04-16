import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import useMetricsStore from '../store/metricsStore'

export default function MemoryChart() {
  const { history } = useMetricsStore()

  return (
    <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-white">Memory Usage</h2>
        <span className="text-xs text-gray-500">Last 60 seconds</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={history.memory}>
          <defs>
            <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#555' }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#555' }} unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
            labelStyle={{ color: '#888', fontSize: 11 }}
            itemStyle={{ color: '#a855f7', fontSize: 12 }}
            formatter={(val) => [`${val}%`, 'Memory']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#memGrad)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}