// @summary View and update customer transfer limits.
// Owner: Mikotaj (Dev 3 — Auditor)
import { useState } from 'react'
import api from '../../api/client'
import PageHeader from '../../components/PageHeader'

export default function LimitManagementPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [limits, setLimits] = useState({ dailyTransferLimit: 0, absoluteTransferLimit: 0 })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function searchCustomers() {
    const { data } = await api.get('/directory/customers', { params: { query } })
    setResults(data)
  }

  async function loadLimits(customerId) {
    const { data } = await api.get(`/employee/customers/${customerId}/limits`)
    setSelected(data)
    setLimits({
      dailyTransferLimit: data.dailyTransferLimit,
      absoluteTransferLimit: data.absoluteTransferLimit,
    })
  }

  async function saveLimits() {
    setMessage('')
    setError('')
    try {
      const { data } = await api.put(`/employee/customers/${selected.customerId}/limits`, {
        dailyTransferLimit: Number(limits.dailyTransferLimit),
        absoluteTransferLimit: Number(limits.absoluteTransferLimit),
      })
      setSelected(data)
      setMessage('Limits updated successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    }
  }

  return (
    <div className="vstack gap-3">
      <PageHeader
        title="Limit Management"
        subtitle="Update daily and absolute transfer limits."
      />      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="input-group">
        <input
          className="form-control"
          placeholder="Search customer by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchCustomers()}
        />
        <button className="btn btn-outline-primary" onClick={searchCustomers}>Search</button>
      </div>

      <div className="list-group">
        {results.map((customer) => (
          <button
            key={customer.customerId}
            type="button"
            className="list-group-item list-group-item-action"
            onClick={() => loadLimits(customer.customerId)}
          >
            {customer.firstName} {customer.lastName}
            <span className="small text-muted ms-2 font-monospace">{customer.checkingIban}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h6">Limits for {selected.customerName}</h2>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Daily transfer limit (EUR)</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={limits.dailyTransferLimit}
                  onChange={(e) => setLimits({ ...limits, dailyTransferLimit: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Absolute transfer limit (EUR)</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={limits.absoluteTransferLimit}
                  onChange={(e) => setLimits({ ...limits, absoluteTransferLimit: e.target.value })}
                />
              </div>
              <div className="col-12">
                <button className="btn btn-primary" onClick={saveLimits}>Save limits</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
