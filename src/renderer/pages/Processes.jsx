import React, { useEffect, useState, useRef } from 'react'
import useProcessStore from '../store/processStore'
import AIProcessList from '../components/AIProcessList'

const SORT_KEYS = [
  { key: 'cpu', label: 'CPU' },
  { key: 'memory', label: 'Memory' },
  { key: 'disk', label: 'Disk I/O' },
  { key: 'gpu', label: 'GPU' },
]

export default function Processes() {
  const { processes, topProcesses, aiProcesses, setProcesses, setError, isLoading } = useProcessStore()
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('cpu')
  const [sortDir, setSortDir] = useState('desc')
  const intervalRef = useRef(null)

  async function fetchProcesses() {
    try {
      const res = await fetch('/api/processes')
      if (!res.ok) throw new Error('Failed to load processes')
      const data = await res.json()
      setProcesses(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchProcesses()
    // start polling
    intervalRef.current = setInterval(fetchProcesses, 3000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const filtered = (processes || []).filter(p => {
    if (!query) return true
    const q = query.toLowerCase()
    return (p.name || '').toLowerCase().includes(q) || (p.command || '').toLowerCase().includes(q) || String(p.pid).includes(q)
  })

  function getSortValue(p) {
    switch (sortBy) {
      case 'cpu': return p.cpu || 0
      case 'memory': return p.memory || 0
      case 'disk': return (p.diskReadBytes || 0) + (p.diskWriteBytes || 0)
      case 'gpu': return p.gpuUsagePercent != null ? p.gpuUsagePercent : 0
      default: return 0
    }
  }

  const sorted = filtered.slice().sort((a, b) => {
    const va = getSortValue(a)
    const vb = getSortValue(b)
    if (va === vb) return (a.pid || 0) - (b.pid || 0)
    return sortDir === 'desc' ? (vb - va) : (va - vb)
  })

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Processes</h1>
          <p className="text-gray-500 text-sm mt-1">Full process manager — all running processes</p>
        </div>
      </div>

      <AIProcessList />

      <div className="mt-6 bg-[#141414] border border-[#222] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, command, or PID"
              className="bg-[#0f0f0f] border border-[#222] text-sm rounded px-3 py-2 w-72 text-gray-200"
            />
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>Sort by:</span>
              {SORT_KEYS.map(s => (
                <button
                  key={s.key}
                  onClick={() => { if (sortBy === s.key) setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); else { setSortBy(s.key); setSortDir('desc') } }}
                  className={`px-2 py-1 rounded text-xs ${sortBy === s.key ? 'bg-[#1f2937] text-white' : 'text-gray-400'}`}>
                  {s.label}{sortBy === s.key ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-400">{isLoading ? 'Loading...' : `${sorted.length} processes`}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-[#222]">
                <th className="py-2 px-2">PID</th>
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">CPU %</th>
                <th className="py-2 px-2">Memory %</th>
                <th className="py-2 px-2">Disk I/O (B)</th>
                <th className="py-2 px-2">GPU %</th>
                <th className="py-2 px-2">Command</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(p => (
                <tr key={p.pid} className="border-b border-[#0f0f0f] hover:bg-[#0f0f0f]">
                  <td className="py-2 px-2 text-gray-300">{p.pid}</td>
                  <td className="py-2 px-2 text-white">{p.name}</td>
                  <td className="py-2 px-2 text-gray-300">{p.cpu?.toFixed?.(1) ?? '–'}</td>
                  <td className="py-2 px-2 text-gray-300">{p.memory?.toFixed?.(1) ?? '–'}</td>
                  <td className="py-2 px-2 text-gray-300">{((p.diskReadBytes || 0) + (p.diskWriteBytes || 0)).toLocaleString()}</td>
                  <td className="py-2 px-2 text-gray-300">{p.gpuUsagePercent != null ? p.gpuUsagePercent.toFixed(1) : '–'}</td>
                  <td className="py-2 px-2 text-gray-300 truncate max-w-[40ch]">{p.command || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}