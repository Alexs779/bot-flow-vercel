import { useEffect } from 'react'
import { useLogStore } from './logStore'

export const useEnvironmentCheck = () => {
  const addLog = useLogStore((state) => state.addLog)

  useEffect(() => {
    // Проверяем наличие API URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    if (!apiBaseUrl) {
      addLog('Environment Check: Missing VITE_API_BASE_URL', 'error')
      return
    }
    addLog('Environment Check: VITE_API_BASE_URL is configured', 'success')

    // Проверяем доступность Telegram WebApp API
    if (!window.Telegram?.WebApp) {
      addLog('Environment Check: Telegram WebApp API is not available', 'error')
      return
    }
    addLog('Environment Check: Telegram WebApp API is available', 'success')

    // Проверяем наличие init data
    const webApp = window.Telegram.WebApp
    if (!webApp.initData) {
      addLog('Environment Check: Missing Telegram init data', 'warning')
      return
    }
    addLog('Environment Check: Telegram init data is present', 'success')
  }, [addLog])
}