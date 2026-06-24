// Glassmorphism card wrapper for page sections.
// @author Wesley, Darlington, Mikotaj (shared)
export default function GlassCard({ children, className = '', padding = true, style = {} }) {
  return (
    <div
      className={`glass-card glass-card-live ${padding ? 'glass-card-padded' : ''} ${className}`}
      style={style}
    >
      <div className="glass-card-shimmer" aria-hidden="true" />
      {children}
    </div>
  )
}
