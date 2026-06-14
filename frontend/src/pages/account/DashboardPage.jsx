// @summary Customer account balances and profile overview.
// Owner: Darlington (Dev 2 — Teller)
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import GlassCard from '../../components/GlassCard'
import PageHeader from '../../components/PageHeader'

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/customer/dashboard')
      .then(({ data }) => setDashboard(data))
      .catch(() => setError('Unable to load dashboard'))
  }, [])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!dashboard) return <div className="loading-shimmer py-5 text-center">Loading your dashboard...</div>

  return (
    <div className="vstack gap-4">
      <PageHeader
        title="Your dashboard"
        subtitle="Your accounts and balances at a glance."
      />

      <div className="balance-hero">
        <div className="balance-hero-content d-flex flex-wrap justify-content-between align-items-end gap-3">
          <div>
            <div className="small text-white-50 mb-1">Total balance</div>
            <div className="balance-amount">
              €{Number(dashboard.combinedBalance).toFixed(2)}
            </div>
            <div className="mt-2 text-white-50">
              {dashboard.firstName} {dashboard.lastName} · {dashboard.email}
            </div>
          </div>
          <div className="text-end text-white-50 small">
            {dashboard.phoneNumber}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {dashboard.accounts.map((account) => (
          <div className="col-md-6" key={account.id}>
            <GlassCard
              className="account-card h-100"
              style={{
                '--accent-color': account.type === 'CHECKING' ? '#22d3ee' : '#fbbf24',
              }}
            >
              <span className={`account-type-badge account-type-${account.type.toLowerCase()}`}>
                {account.type}
              </span>
              <p className="mt-3 mb-2">
                <span className="text-muted small d-block">IBAN</span>
                <span className="font-monospace">{account.iban}</span>
              </p>
              <p className="mb-0 display-title" style={{ fontSize: '1.75rem', color: account.type === 'CHECKING' ? '#67e8f9' : '#fde68a' }}>
                €{Number(account.balance).toFixed(2)}
              </p>
            </GlassCard>
          </div>
        ))}
      </div>

      <div className="d-flex flex-wrap gap-2">
        <Link className="btn btn-outline-primary btn-sm" to="/internal-transfers">Internal transfer</Link>
        <Link className="btn btn-outline-primary btn-sm" to="/transfers">External transfer</Link>
        <Link className="btn btn-outline-secondary btn-sm" to="/atm">ATM</Link>
      </div>
    </div>
  )
}
