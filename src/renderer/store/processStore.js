import { create } from 'zustand'

const useProcessStore = create((set) => ({
  processes: [],
  aiProcesses: [],
  topProcesses: [],
  isLoading: true,
  error: null,

  setProcesses: (data) => set({
    processes: data.all,
    topProcesses: data.top || (data.all ? data.all.slice(0, 15) : []),
    aiProcesses: data.ai,
    isLoading: false,
  }),

  setError: (error) => set({ error, isLoading: false }),
}))

export default useProcessStore