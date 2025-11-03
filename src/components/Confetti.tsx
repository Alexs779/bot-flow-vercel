import { useEffect, useState } from "react"
import "./Confetti.css"

type ConfettiPiece = {
  id: number
  x: number
  y: number
  color: string
  delay: number
  rotation: number
}

type ConfettiProps = {
  trigger: number
  duration?: number
}

const CONFETTI_COLORS = ["#ff365f", "#4fd1c5", "#22d3ee", "#ff6f91", "#38bdf8"]

export default function Confetti({ trigger, duration = 2000 }: ConfettiProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger === 0) {
      return
    }

    const pieces: ConfettiPiece[] = []
    const pieceCount = 30

    for (let i = 0; i < pieceCount; i++) {
      pieces.push({
        id: trigger * 1000 + i,
        x: Math.random() * 100,
        y: Math.random() * 30,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 200,
        rotation: Math.random() * 360,
      })
    }

    setConfetti(pieces)
    setIsActive(true)

    const timer = setTimeout(() => {
      setIsActive(false)
      setConfetti([])
    }, duration)

    return () => clearTimeout(timer)
  }, [trigger, duration])

  if (!isActive || confetti.length === 0) {
    return null
  }

  return (
    <div className="confetti-container">
      {confetti.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}ms`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
