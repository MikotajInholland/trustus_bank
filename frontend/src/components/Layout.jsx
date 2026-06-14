/**
 * @summary App shell with navigation and logout.
 * @author Wesley, Darlington, Mikotaj (shared)
 */
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AmbientField from './AmbientField'
import AnimatedOutlet from './AnimatedOutlet'

export default function Layout() {
  const { auth, logout } = useAuth()

  return (
    <div className="app-shell">
      <div className="ambient-bg" aria-hidden="true" />
      <div className="ambient-noise" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-1" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-2" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-3" aria-hidden="true" />
      <AmbientField />

      <nav className="navbar navbar-expand-lg site-nav">
        <div className="container-fluid px-3">
          <Link className="navbar-brand" to="/">TrustUs Bank</Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {!auth && (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/atm/login">ATM</Link></li>
                </>
              )}
              {auth?.role === 'CUSTOMER' && auth.approved && (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/transfers">Transfers</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/internal-transfers">Internal</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/transactions">History</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/atm">ATM</Link></li>
                </>
              )}
              {auth?.role === 'EMPLOYEE' && (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/employee/approvals">Approvals</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/employee/customers">Customers</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/employee/transfers">Transfers</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/employee/limits">Limits</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/employee/ledger">Ledger</Link></li>
                  <li className="nav-item"><Link className="nav-link nav-link-danger" to="/employee/closure">Closure</Link></li>
                </>
              )}
            </ul>
            <div className="d-flex align-items-center gap-2">
              {auth ? (
                <>
                  <span className="user-email d-none d-md-inline">{auth.email}</span>
                  <span className="role-pill">{auth.role}</span>
                  <button className="btn btn-sm btn-outline-light" onClick={logout}>Logout</button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      <main className="page-shell">
        <AnimatedOutlet />
      </main>

      <footer className="site-footer">
        TrustUs Bank
      </footer>
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
