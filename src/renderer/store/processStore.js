import { create } from 'zustand'

const useProcessStore = create((set) => ({
  processes: [],
  aiProcesses: [],
  topProcesses: [],
  aiResources: {
    totalCPUPercent: 0,
    totalRAMBytes: 0,
    totalRAMPercent: 0,
    totalRAMGB: 0,
    processCount: 0,
    breakdown: [],
  },
  isLoading: true,
  error: null,

  setProcesses: (data) => set({
    processes: data.all || [],
    aiProcesses: data.ai || [],
    topProcesses: data.top || [],
    aiResources: data.aiResources || {
      totalCPUPercent: 0,
      totalRAMBytes: 0,
      totalRAMPercent: 0,
      totalRAMGB: 0,
      processCount: 0,
      breakdown: [],
    },
    isLoading: false,
  }),

  setError: (error) => set({ error, isLoading: false }),
}))

export default useProcessStore