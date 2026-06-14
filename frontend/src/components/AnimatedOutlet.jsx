/**
 * @summary Route outlet with a soft enter animation on navigation.
 * @author Wesley, Darlington, Mikotaj (shared)
 */
import { useLocation, Outlet } from 'react-router-dom'

export default function AnimatedOutlet() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-enter">
      <Outlet />
    </div>
  )
}
