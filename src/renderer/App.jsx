import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Processes from './pages/Processes'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Router>
      <div className="flex h-screen w-screen overflow-hidden bg-[#0f0f0f]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/processes" element={<Processes />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}