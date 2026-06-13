import { useEffect } from 'react'
import useMetricsStore from '../store/metricsStore'
import useProcessStore from '../store/processStore'

const API = 'http://localhost:5001/api'

export default function useMetrics(interval = 5000) {
  const { setMetrics, setGPU, setError } = useMetricsStore()
  const { setProcesses } = useProcessStore()

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${API}/metrics/live`)
        const data = await res.json()
        setMetrics(data)
      } catch (err) {
        setError(err.message)
      }
    }

    const fetchProcesses = async () => {
      try {
        const res = await fetch(`${API}/processes`)
        const data = await res.json()
        setProcesses(data)
      } catch (err) {
        console.error('Process fetch error:', err.message)
      }
    }

    const fetchGPU = async () => {
      try {
        const res = await fetch(`${API}/metrics/gpu`)
        const data = await res.json()
        setGPU(data)
      } catch (err) {
        console.error('GPU fetch error:', err.message)
      }
    }

    // Stagger initial fetches so they don't all fire at once on startup
    fetchMetrics()
    setTimeout(fetchProcesses, 1500)
    setTimeout(fetchGPU, 3000)

    const metricsTimer = setInterval(fetchMetrics, 5000)
    const processTimer = setInterval(fetchProcesses, 7000)
    const gpuTimer = setInterval(fetchGPU, 12000)

    return () => {
      clearInterval(metricsTimer)
      clearInterval(processTimer)
      clearInterval(gpuTimer)
    }
  }, [])
}