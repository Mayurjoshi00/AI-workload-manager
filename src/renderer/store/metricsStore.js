import { create } from 'zustand'

const useMetricsStore = create((set) => ({
  cpu: null,
  memory: null,
  disk: null,
  network: null,
  gpu: null,
  history: {
    cpu: [],
    memory: [],
    gpu: [],
  },
  isLoading: true,
  error: null,

  setMetrics: (data) => set((state) => ({
    cpu: data.cpu,
    memory: data.memory,
    disk: data.disk,
    network: data.network,
    isLoading: false,
    history: {
      cpu: (() => {
        const newVal = parseFloat(data?.cpu?.usage ?? 0)
        const prevEntry = (state.history && state.history.cpu && state.history.cpu[state.history.cpu.length - 1]) || null
        const prevVal = prevEntry ? parseFloat(prevEntry.value) : newVal
        const smoothed = Number((prevVal * 0.6 + newVal * 0.4).toFixed(1))
        return [...(state.history?.cpu || []).slice(-59), { time: new Date().toLocaleTimeString(), value: smoothed }]
      })(),
      memory: [...(state.history?.memory || []).slice(-59), {
        time: new Date().toLocaleTimeString(),
        value: parseFloat(data?.memory?.usedPercent ?? 0),
      }],
      // preserve gpu history if present
      gpu: state.history?.gpu || [],
    }
  })),

  setGPU: (data) => set((state) => {
    const prevGpu = (state.history && state.history.gpu) || []
    return ({
      gpu: data,
      history: {
        ...state.history,
        gpu: [...prevGpu.slice(-59), {
          time: new Date().toLocaleTimeString(),
          value: parseFloat(data?.primary?.usagePercent ?? 0),
        }],
      },
    })
  }),
  setError: (error) => set({ error, isLoading: false }),
}))

export default useMetricsStore