/**
 * @summary Rotating conic-gradient border wrapper.
 * @author Darlington (Dev 2 — Teller)
 */
export default function GlowBorder({ children, className = '', innerClassName = '', variant = 'default' }) {
  return (
    <div className={`glow-border glow-border-${variant} ${className}`}>
      <div className="glow-border-ring" aria-hidden="true" />
      <div className={`glow-border-inner ${innerClassName}`}>
        {children}
      </div>
    </div>
  )
}
