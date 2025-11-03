import { useEffect, useState } from "react"
import "./Ripple.css"

type RippleEffect = {
  id: number
  x: number
  y: number
}

type RippleProps = {
  ripples: RippleEffect[]
  duration?: number
}

export default function Ripple({ ripples, duration = 600 }: RippleProps) {
  return (
    <>
      {ripples.map((ripple) => (
        <RippleCircle
          key={ripple.id}
          x={ripple.x}
          y={ripple.y}
          duration={duration}
        />
      ))}
    </>
  )
}

type RippleCircleProps = {
  x: number
  y: number
  duration: number
}

function RippleCircle({ x, y, duration }: RippleCircleProps) {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  if (!isAnimating) {
    return null
  }

  return (
    <span
      className="ripple"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDuration: `${duration}ms`,
      }}
    />
  )
}
