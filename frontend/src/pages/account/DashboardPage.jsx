import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/customer/dashboard')
      .then(({ data }) => setDashboard(data))
      .catch(() => setError('Unable to load dashboard'))
  }, [])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!dashboard) return <div className="text-muted">Loading dashboard...</div>

  return (
    <div className="vstack gap-3">
      <div className="card shadow-sm">
        <div className="card-body">
          <h1 className="h4">Customer Dashboard</h1>
          <p className="text-muted small mb-0">Developer 2 — account visibility skeleton</p>
          <p className="mb-0 mt-3">{dashboard.firstName} {dashboard.lastName} · {dashboard.email}</p>
          <p className="fw-semibold mt-2">Combined balance: {dashboard.combinedBalance} {dashboard.currency}</p>
        </div>
      </div>

      <div className="row g-3">
        {dashboard.accounts.map((account) => (
          <div className="col-md-6" key={account.id}>
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h6 text-uppercase text-muted">{account.type}</h2>
                <p className="mb-1"><strong>IBAN:</strong> {account.iban}</p>
                <p className="mb-0"><strong>Balance:</strong> {account.balance} {account.currency}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
