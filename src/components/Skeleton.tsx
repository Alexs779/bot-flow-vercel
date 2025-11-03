import "./Skeleton.css"

type SkeletonProps = {
  variant?: "text" | "rect" | "circle"
  width?: string | number
  height?: string | number
  className?: string
}

export default function Skeleton({ 
  variant = "text", 
  width, 
  height, 
  className = "" 
}: SkeletonProps) {
  const style = {
    width: width || (variant === "text" ? "100%" : undefined),
    height: height || (variant === "text" ? "1em" : undefined),
  }

  return (
    <div 
      className={`skeleton skeleton--${variant} ${className}`}
      style={style}
      role="status"
      aria-label="Loading content..."
    >
      <div className="skeleton__shimmer"></div>
    </div>
  )
}