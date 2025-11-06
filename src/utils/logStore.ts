import { create } from 'zustand'
import type { LogEntry } from '../components/LogPanel'

type LogStore = {
  logs: LogEntry[]
  addLog: (message: string, level?: LogEntry['level']) => void
  clearLogs: () => void
}

export const useLogStore = create<LogStore>((set) => ({
  logs: [],
  addLog: (message: string, level: LogEntry['level'] = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1)
    set((state) => ({
      logs: [...state.logs, { message, timestamp, level }]
    }))
  },
  clearLogs: () => set({ logs: [] })
}))