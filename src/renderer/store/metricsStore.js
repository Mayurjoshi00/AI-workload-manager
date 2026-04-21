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
      cpu: [...state.history.cpu.slice(-59), {
        time: new Date().toLocaleTimeString(),
        value: parseFloat(data.cpu.usage),
      }],
      memory: [...state.history.memory.slice(-59), {
        time: new Date().toLocaleTimeString(),
        value: parseFloat(data.memory.usedPercent),
      }],
    }
  })),

  setGPU: (data) => set((state) => ({
    gpu: data,
    history: {
      ...state.history,
      gpu: [...state.history.gpu.slice(-59), {
        time: new Date().toLocaleTimeString(),
        value: parseFloat(data?.primary?.usagePercent ?? 0),
      }],
    },
  })),
  setError: (error) => set({ error, isLoading: false }),
}))

export default useMetricsStore