// View and update customer transfer limits.
// @author Mikotaj (Dev 3 — Auditor)
import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../../services/client'
import useDebouncedValue from '../../services/useDebouncedValue'
import PageHeader from '../../components/PageHeader'

// Employee page for viewing and updating customer transfer limits.
export default function LimitManagementPage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return undefined
    }

    let cancelled = false
    api.get('/directory/customers', { params: { query: debouncedQuery } })
      .then(({ data }) => { if (!cancelled) setResults(data) })
      .catch(() => { if (!cancelled) setResults([]) })

    return () => { cancelled = true }
  }, [debouncedQuery])

  // Loads daily and absolute limits for the selected customer.
  async function loadLimits(customerId) {
    const { data } = await api.get(`/employee/customers/${customerId}/limits`)
    setSelected(data)
  }

  // Persists updated transfer limits to the backend.
  async function saveLimits() {
    setMessage('')
    setError('')
    try {
      const { data } = await api.put(`/employee/customers/${selected.customerId}/limits`, {
        dailyTransferLimit: Number(selected.dailyTransferLimit),
        absoluteTransferLimit: Number(selected.absoluteTransferLimit),
      })
      setSelected(data)
      setMessage('Limits updated successfully')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Update failed'))
    }
  }

  return (
    <div className="vstack gap-3">
      <PageHeader
        title="Limit Management"
        subtitle="Update daily and absolute transfer limits."
      />      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <input
        className="form-control"
        placeholder="Search customer by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

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
                  value={selected.dailyTransferLimit}
                  onChange={(e) => setSelected({ ...selected, dailyTransferLimit: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Absolute transfer limit (EUR)</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={selected.absoluteTransferLimit}
                  onChange={(e) => setSelected({ ...selected, absoluteTransferLimit: e.target.value })}
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
