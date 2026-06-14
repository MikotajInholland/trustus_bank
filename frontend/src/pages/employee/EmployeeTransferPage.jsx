// @summary Employee-initiated external transfers.
// Owner: Mikotaj (Dev 3 — Auditor)
import { useState } from 'react'
import api from '../../api/client'
import PageHeader from '../../components/PageHeader'

export default function EmployeeTransferPage() {
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ toIban: '', amount: '' })
  const [recipientQuery, setRecipientQuery] = useState('')
  const [recipients, setRecipients] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function searchCustomers() {
    const { data } = await api.get('/directory/customers', { params: { query } })
    setCustomers(data)
  }

  async function searchRecipients() {
    const { data } = await api.get('/directory/customers', { params: { query: recipientQuery } })
    setRecipients(data)
  }

  async function submitTransfer(event) {
    event.preventDefault()
    if (!selected) return
    setMessage('')
    setError('')
    try {
      await api.post(`/employee/customers/${selected.customerId}/transfers`, {
        toIban: form.toIban,
        amount: Number(form.amount),
      })
      setMessage(`Transferred ${Number(form.amount).toFixed(2)} EUR on behalf of ${selected.firstName} ${selected.lastName}`)
      setForm({ toIban: '', amount: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Employee Transfers"
        subtitle="Transfer funds between customers on behalf of an account holder."
      />      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <h2 className="h6">1. Select sender (Customer A)</h2>
          <div className="input-group mb-2">
            <input className="form-control" placeholder="Search by name..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <button type="button" className="btn btn-outline-primary" onClick={searchCustomers}>Search</button>
          </div>
          <div className="list-group">
            {customers.map((c) => (
              <button
                key={c.customerId}
                type="button"
                className={`list-group-item list-group-item-action ${selected?.customerId === c.customerId ? 'active' : ''}`}
                onClick={() => setSelected(c)}
              >
                {c.firstName} {c.lastName} — {c.checkingIban}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h6">2. Transfer from {selected.firstName} {selected.lastName}</h2>
            <div className="input-group mb-3">
              <input
                className="form-control"
                placeholder="Find recipient by name..."
                value={recipientQuery}
                onChange={(e) => setRecipientQuery(e.target.value)}
              />
              <button type="button" className="btn btn-outline-secondary" onClick={searchRecipients}>Search</button>
            </div>
            {recipients.length > 0 && (
              <div className="list-group mb-3">
                {recipients.map((r) => (
                  <button
                    key={r.customerId}
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={() => { setForm({ ...form, toIban: r.checkingIban }); setRecipients([]) }}
                  >
                    {r.firstName} {r.lastName} — {r.checkingIban}
                  </button>
                ))}
              </div>
            )}
            <form className="row g-3" onSubmit={submitTransfer}>
              <div className="col-md-5">
                <label className="form-label">Destination IBAN</label>
                <input className="form-control font-monospace" value={form.toIban} onChange={(e) => setForm({ ...form, toIban: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Amount (EUR)</label>
                <input className="form-control" type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button className="btn btn-primary w-100">Execute transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
