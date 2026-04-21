import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import useMetricsStore from '../store/metricsStore'

export default function GPUChart() {
  const { history } = useMetricsStore()

  return (
    <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-white">GPU Usage</h2>
        <span className="text-xs text-gray-500">Last 60 seconds</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={history.gpu}>
          <defs>
            <linearGradient id="gpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#555' }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#555' }} unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
            labelStyle={{ color: '#888', fontSize: 11 }}
            itemStyle={{ color: '#06b6d4', fontSize: 12 }}
            formatter={(val) => [`${val}%`, 'GPU']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#gpuGrad)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
