import "./Spinner.css"

type SpinnerProps = {
  size?: "small" | "medium" | "large"
  className?: string
}

export default function Spinner({ size = "medium", className = "" }: SpinnerProps) {
  return (
    <div 
      className={`spinner spinner--${size} ${className}`}
      role="status"
      aria-label="Loading..."
    >
      <div className="spinner__circle"></div>
    </div>
  )
}