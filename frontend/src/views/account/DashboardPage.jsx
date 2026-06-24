// Customer account balances and profile overview.
// @author Darlington (Dev 2 — Teller)
import { useEffect, useState } from 'react'
import api from '../../services/client'
import AccountCard from '../../components/AccountCard'
import GlowBorder from '../../components/GlowBorder'
import MagneticLink from '../../components/MagneticLink'
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

  const holderName = `${dashboard.firstName} ${dashboard.lastName}`

  return (
    <div className="dashboard-ecosystem vstack gap-4">
      <div className="dashboard-aurora dashboard-aurora-a" aria-hidden="true" />
      <div className="dashboard-aurora dashboard-aurora-b" aria-hidden="true" />

      <PageHeader
        title="Your dashboard"
        subtitle="Your accounts and balances at a glance."
      />

      <GlowBorder className="balance-hero-frame" variant="hero">
        <div className="balance-hero">
          <div className="balance-hero-glass" aria-hidden="true" />
          <div className="balance-hero-content d-flex flex-wrap justify-content-between align-items-end gap-3">
            <div>
              <div className="small text-white-50 mb-1">Total balance</div>
              <div className="balance-amount">
                €{Number(dashboard.combinedBalance).toFixed(2)}
              </div>
              <div className="mt-2 text-white-50">
                {holderName} · {dashboard.email}
              </div>
            </div>
            <div className="text-end text-white-50 small">
              {dashboard.phoneNumber}
            </div>
          </div>
        </div>
      </GlowBorder>

      <section className="dashboard-accounts">
        <h2 className="section-title">Your accounts</h2>
        <div className="account-cards-grid">
          {dashboard.accounts.map((account, index) => (
            <AccountCard
              key={account.id}
              account={account}
              holderName={holderName}
              index={index}
            />
          ))}
        </div>
      </section>

      <div className="d-flex flex-wrap gap-2 dashboard-actions">
        <MagneticLink className="btn btn-outline-primary btn-sm" to="/internal-transfers">
          Internal transfer
        </MagneticLink>
        <MagneticLink className="btn btn-outline-primary btn-sm" to="/transfers">
          External transfer
        </MagneticLink>
        <MagneticLink className="btn btn-outline-secondary btn-sm" to="/atm">
          ATM
        </MagneticLink>
      </div>
    </div>
  )
}
