import { useEffect } from 'react'
import useMetricsStore from '../store/metricsStore'
import useProcessStore from '../store/processStore'

const API = 'http://localhost:5001/api'

export default function useMetrics(interval = 2000) {
  const { setMetrics, setGPU, setError } = useMetricsStore()
  const { setProcesses } = useProcessStore()

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [metricsRes, processesRes, gpuRes] = await Promise.all([
          fetch(`${API}/metrics/live`),
          fetch(`${API}/processes`),
          fetch(`${API}/metrics/gpu`),
        ])

        const metrics = await metricsRes.json()
        const processes = await processesRes.json()
        const gpu = await gpuRes.json()

        setMetrics(metrics)
        setProcesses(processes)
        setGPU(gpu)
      } catch (err) {
        setError(err.message)
      }
    }

    fetchAll()
    const timer = setInterval(fetchAll, interval)
    return () => clearInterval(timer)
  }, [interval])
}