import { useEffect, useState } from "react"
import "./Toast.css"

type ToastType = "success" | "error" | "info"

type ToastProps = {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
}

export default function Toast({ 
  message, 
  type = "info", 
  duration = 3000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => window.clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div className={`toast toast--${type}`} role="alert" aria-live="polite">
      <div className="toast__content">
        <span className="toast__message">{message}</span>
      </div>
    </div>
  )
}