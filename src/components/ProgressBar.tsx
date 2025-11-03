import "./ProgressBar.css"

type ProgressBarProps = {
  value: number
  max?: number
  showPercentage?: boolean
  className?: string
}

export default function ProgressBar({ 
  value, 
  max = 100, 
  showPercentage = false, 
  className = "" 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={`progress-bar ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div 
        className="progress-bar__fill" 
        style={{ width: `${percentage}%` }}
      >
        {showPercentage && (
          <span className="progress-bar__text">{Math.round(percentage)}%</span>
        )}
      </div>
    </div>
  )
}