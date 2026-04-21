import React from 'react'

const colorMap = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  green: 'text-green-400 bg-green-500/10 border-green-500/20',
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
}

const barColor = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-500',
}

export default function MetricCard({ title, value, subtitle, icon: Icon, color, percent }) {
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</span>
        <Icon size={16} className={colorMap[color].split(' ')[0]} />
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-500 mb-3">{subtitle}</p>
      {percent !== null && (
        <div className="w-full bg-[#222] rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${barColor[color]}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}