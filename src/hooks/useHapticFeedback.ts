import { useCallback, useEffect, useState } from "react"
import type { TelegramWebApp } from "../utils/telegramAuth"

type HapticImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft"
type HapticNotificationType = "error" | "success" | "warning"

export function useHapticFeedback() {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    const webApp = window.Telegram?.WebApp
    setIsAvailable(!!webApp?.HapticFeedback)
  }, [])

  const impactOccurred = useCallback((style: HapticImpactStyle = "light") => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    
    if (prefersReducedMotion || !isAvailable) {
      return
    }

    try {
      const webApp = window.Telegram?.WebApp as TelegramWebApp | undefined
      webApp?.HapticFeedback?.impactOccurred?.(style)
    } catch (error) {
      console.warn("Haptic feedback failed:", error)
    }
  }, [isAvailable])

  const notificationOccurred = useCallback((type: HapticNotificationType) => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    
    if (prefersReducedMotion || !isAvailable) {
      return
    }

    try {
      const webApp = window.Telegram?.WebApp as TelegramWebApp | undefined
      webApp?.HapticFeedback?.notificationOccurred?.(type)
    } catch (error) {
      console.warn("Haptic feedback failed:", error)
    }
  }, [isAvailable])

  const selectionChanged = useCallback(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    
    if (prefersReducedMotion || !isAvailable) {
      return
    }

    try {
      const webApp = window.Telegram?.WebApp as TelegramWebApp | undefined
      webApp?.HapticFeedback?.selectionChanged?.()
    } catch (error) {
      console.warn("Haptic feedback failed:", error)
    }
  }, [isAvailable])

  return {
    impactOccurred,
    notificationOccurred,
    selectionChanged,
    isAvailable,
  }
}
