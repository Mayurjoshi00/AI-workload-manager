import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Cpu,
  BellRing,
  BarChart2,
  Settings,
  Activity,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/processes', icon: Cpu, label: 'Processes' },
  { to: '/alerts', icon: BellRing, label: 'Alerts' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 h-screen bg-[#141414] border-r border-[#222] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#222]">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-500" size={22} />
          <span className="text-white font-semibold text-sm tracking-wide">
            AI Workload Manager
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-[#1f1f1f]'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#222]">
        <p className="text-xs text-gray-600">v1.0.0 — MERN + Electron</p>
      </div>
    </aside>
  )
}