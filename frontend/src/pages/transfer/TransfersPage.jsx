/**
 * @summary Send external transfers from checking.
 * @author Mikotaj (Dev 3 — Auditor)
 */
import { useState } from 'react'
import api, { getApiErrorMessage } from '../../api/client'
import GlassCard from '../../components/GlassCard'
import PageHeader from '../../components/PageHeader'

export default function TransfersPage() {
  const [form, setForm] = useState({ toIban: '', amount: '' })
  const [directoryQuery, setDirectoryQuery] = useState('')
  const [directoryResults, setDirectoryResults] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function searchDirectory() {
    if (!directoryQuery.trim()) return
    const { data } = await api.get('/directory/customers', { params: { query: directoryQuery } })
    setDirectoryResults(data)
  }

  function selectRecipient(entry) {
    setForm({ ...form, toIban: entry.checkingIban })
    setDirectoryResults([])
    setDirectoryQuery(`${entry.firstName} ${entry.lastName}`)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await api.post('/customer/transfers/external', { ...form, amount: Number(form.amount) })
      setMessage(`Transfer of €${Number(form.amount).toFixed(2)} to ${form.toIban} completed`)
      setForm({ toIban: '', amount: '' })
      setDirectoryQuery('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Transfer failed'))
    }
  }

  return (
    <div>
      <PageHeader
        title="External transfers"
        subtitle="Send EUR from your checking account."
      />      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <GlassCard className="mb-3">
        <h2 className="h6 mb-3">Find recipient</h2>        <div className="input-group mb-2">
          <input
            className="form-control"
            placeholder="Search by name..."
            value={directoryQuery}
            onChange={(e) => setDirectoryQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchDirectory())}
          />
          <button type="button" className="btn btn-outline-secondary" onClick={searchDirectory}>Search</button>
        </div>
        {directoryResults.length > 0 && (
          <div className="list-group">
            {directoryResults.map((entry) => (
              <button
                key={entry.customerId}
                type="button"
                className="list-group-item list-group-item-action"
                onClick={() => selectRecipient(entry)}
              >
                {entry.firstName} {entry.lastName} — <span className="font-monospace">{entry.checkingIban}</span>
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard>        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label className="form-label">Destination IBAN</label>
            <input
              className="form-control font-monospace"
              value={form.toIban}
              onChange={(e) => setForm({ ...form, toIban: e.target.value })}
              placeholder="NL..."
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Amount (EUR)</label>
            <input
              className="form-control"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-brand w-100">Send</button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
