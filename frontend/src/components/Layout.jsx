import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { auth, logout } = useAuth()

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand fw-semibold" to="/">TrustUs Bank</Link>
          <div className="navbar-nav ms-auto gap-2 flex-row align-items-center">
            {auth ? (
              <>
                <span className="navbar-text text-white-50 small">{auth.email}</span>
                <button className="btn btn-sm btn-outline-light" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="nav-link" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  )
}

export function ProtectedRoute({ roles, requireApproved = false, children }) {
  const { auth } = useAuth()

  if (!auth) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(auth.role)) {
    return <Navigate to="/" replace />
  }

  if (requireApproved && auth.role === 'CUSTOMER' && !auth.approved) {
    return <Navigate to="/waiting" replace />
  }

  return children
}
