/**
 * @summary Link/button wrapper with subtle magnetic cursor pull.
 * @author Darlington (Dev 2 — Teller)
 */
import { Link } from 'react-router-dom'
import { useMagnetic } from '../services/useMotionFx'

export default function MagneticLink({ to, className = '', children, strength }) {
  const ref = useMagnetic(strength ?? 0.2, 88)

  return (
    <span ref={ref} className="magnetic-wrap">
      <Link to={to} className={className}>
        {children}
      </Link>
    </span>
  )
}
