import { create } from 'zustand'

const useProcessStore = create((set) => ({
  processes: [],
  aiProcesses: [],
  isLoading: true,
  error: null,

  setProcesses: (data) => set({
    processes: data.all,
    aiProcesses: data.ai,
    isLoading: false,
  }),

  setError: (error) => set({ error, isLoading: false }),
}))

export default useProcessStore