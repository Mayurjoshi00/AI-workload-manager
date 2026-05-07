import { useEffect } from 'react'
import useMetricsStore from '../store/metricsStore'
import useProcessStore from '../store/processStore'

const API = 'http://localhost:5001/api'

export default function useMetrics(interval = 3000) {
  const { setMetrics, setGPU, setError } = useMetricsStore()
  const { setProcesses } = useProcessStore()

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.allSettled([
          fetch(`${API}/metrics/live`),
          fetch(`${API}/processes`),
          fetch(`${API}/metrics/gpu`),
        ])

        // metrics
        if (results[0].status === 'fulfilled') {
          try {
            const metrics = await results[0].value.json()
            setMetrics(metrics)
          } catch (e) {
            console.error('Failed to parse metrics JSON', e)
          }
        } else {
          console.error('Metrics fetch failed', results[0].reason)
        }

        // processes
        if (results[1].status === 'fulfilled') {
          try {
            const processes = await results[1].value.json()
            setProcesses(processes)
          } catch (e) {
            console.error('Failed to parse processes JSON', e)
          }
        } else {
          console.error('Processes fetch failed', results[1].reason)
        }

        // gpu
        if (results[2].status === 'fulfilled') {
          try {
            const gpu = await results[2].value.json()
            console.debug('GPU payload', gpu)
            setGPU(gpu)
          } catch (e) {
            console.error('Failed to parse GPU JSON', e)
          }
        } else {
          console.error('GPU fetch failed', results[2].reason)
        }
      } catch (err) {
        setError(err.message)
      }
    }

    fetchAll()
    const timer = setInterval(fetchAll, interval)
    return () => clearInterval(timer)
  }, [interval])
}