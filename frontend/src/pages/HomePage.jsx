import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { auth } = useAuth()

  return (
    <div className="card card-skeleton shadow-sm">
      <div className="card-body p-4">
        <h1 className="h3 mb-3">TrustUs Bank</h1>
        <p className="text-muted">
          Skeleton boilerplate for the student banking project. All balances and transactions use EUR.
        </p>

        {!auth && (
          <div className="d-flex gap-2">
            <Link className="btn btn-primary" to="/login">Customer / Employee Login</Link>
            <Link className="btn btn-outline-primary" to="/register">Register</Link>
            <Link className="btn btn-outline-secondary" to="/atm">Mock ATM</Link>
          </div>
        )}

        {auth?.role === 'CUSTOMER' && auth.approved && (
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary" to="/dashboard">Dashboard</Link>
            <Link className="btn btn-outline-primary" to="/transfers">Transfers</Link>
            <Link className="btn btn-outline-primary" to="/transactions">Transactions</Link>
            <Link className="btn btn-outline-secondary" to="/atm">ATM</Link>
          </div>
        )}

        {auth?.role === 'EMPLOYEE' && (
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary" to="/employee/approvals">Approval Queue</Link>
            <Link className="btn btn-outline-primary" to="/employee/customers">Customers</Link>
            <Link className="btn btn-outline-primary" to="/employee/ledger">Global Ledger</Link>
            <Link className="btn btn-outline-primary" to="/employee/limits">Limit Management</Link>
          </div>
        )}
      </div>
    </div>
  )
}
