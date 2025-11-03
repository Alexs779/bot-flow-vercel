import "./LoadingButton.css"
import Spinner from "./Spinner"

type LoadingButtonProps = {
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
  type?: "button" | "submit" | "reset"
}

export default function LoadingButton({ 
  loading = false, 
  disabled = false, 
  children, 
  className = "", 
  onClick,
  type = "button"
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      className={`loading-button ${loading ? "loading-button--loading" : ""} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
    >
      {loading && <Spinner size="small" className="loading-button__spinner" />}
      <span className="loading-button__text">{children}</span>
    </button>
  )
}