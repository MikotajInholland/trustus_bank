// @summary Glassmorphism card wrapper for page sections.
export default function GlassCard({ children, className = '', padding = true, style = {} }) {
  return (
    <div
      className={`glass-card ${padding ? 'glass-card-padded' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
