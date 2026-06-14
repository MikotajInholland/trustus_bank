import { useState } from 'react'
import api from '../../api/client'

export default function LimitManagementPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [limits, setLimits] = useState({ dailyTransferLimit: 0, absoluteTransferLimit: 0 })

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
    const { data } = await api.put(`/employee/customers/${selected.customerId}/limits`, limits)
    setSelected(data)
  }

  return (
    <div className="vstack gap-3">
      <h1 className="h4">Limit Management</h1>
      <p className="text-muted small">Developer 3 — employee limit update skeleton</p>
      <div className="input-group">
        <input className="form-control" placeholder="Search customer by name" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn btn-outline-primary" onClick={searchCustomers}>Search</button>
      </div>
      <div className="list-group">
        {results.map((customer) => (
          <button key={customer.customerId} className="list-group-item list-group-item-action" onClick={() => loadLimits(customer.customerId)}>
            {customer.firstName} {customer.lastName}
          </button>
        ))}
      </div>
      {selected && (
        <div className="card">
          <div className="card-body row g-3">
            <div className="col-md-6">
              <label className="form-label">Daily limit</label>
              <input className="form-control" type="number" value={limits.dailyTransferLimit} onChange={(e) => setLimits({ ...limits, dailyTransferLimit: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Absolute limit</label>
              <input className="form-control" type="number" value={limits.absoluteTransferLimit} onChange={(e) => setLimits({ ...limits, absoluteTransferLimit: e.target.value })} />
            </div>
            <div className="col-12">
              <button className="btn btn-primary" onClick={saveLimits}>Save limits</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
