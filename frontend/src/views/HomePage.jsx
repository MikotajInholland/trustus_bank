/**
 * @summary Landing page with links to login and register.
 * @author Wesley, Darlington, Mikotaj (shared)
 */
import { Link } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'

export default function HomePage() {
  const { auth } = useAuth()

  return (
    <div className="vstack gap-5">
      <section className="hero-section hero-section-reveal">
        <div className="hero-aurora" aria-hidden="true" />
        <p className="hero-eyebrow">TrustUs Bank</p>
        <h1 className="display-title gradient-text gradient-text-live">Banking built on trust</h1>
        <p className="hero-lead">
          Manage accounts, transfer funds, and track every transaction — all in EUR.
        </p>

        {!auth && (
          <div className="hero-actions">
            <Link className="btn btn-brand btn-lg" to="/login">Sign in</Link>
            <Link className="btn btn-outline-primary btn-lg" to="/register">Open an account</Link>
            <Link className="btn btn-outline-secondary btn-lg" to="/atm/login">Use ATM</Link>
          </div>
        )}

        {auth?.role === 'CUSTOMER' && !auth.approved && (
          <div className="alert alert-warning d-inline-block mt-3">
            Your account is pending approval. <Link to="/waiting">View status</Link>
          </div>
        )}

        {auth?.role === 'CUSTOMER' && auth.approved && (
          <div className="hero-actions">
            <Link className="btn btn-brand" to="/dashboard">Dashboard</Link>
            <Link className="btn btn-outline-primary" to="/transfers">Transfers</Link>
            <Link className="btn btn-outline-primary" to="/transactions">History</Link>
            <Link className="btn btn-outline-secondary" to="/atm">ATM</Link>
          </div>
        )}

        {auth?.role === 'EMPLOYEE' && (
          <div className="hero-actions">
            <Link className="btn btn-brand" to="/employee/approvals">Approval Queue</Link>
            <Link className="btn btn-outline-primary" to="/employee/customers">Customers</Link>
            <Link className="btn btn-outline-primary" to="/employee/ledger">Global Ledger</Link>
            <Link className="btn btn-outline-danger" to="/employee/closure">Account Closure</Link>
          </div>
        )}
      </section>
    </div>
  )
}
