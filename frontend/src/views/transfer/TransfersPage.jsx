// Send external transfers from checking.
// @author Mikotaj (Dev 3 — Auditor)
import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../../services/client'
import useDebouncedValue from '../../services/useDebouncedValue'
import GlassCard from '../../components/GlassCard'
import PageHeader from '../../components/PageHeader'

// Customer page for sending external transfers from checking.
export default function TransfersPage() {
  const [form, setForm] = useState({ toIban: '', amount: '' })
  const [directoryQuery, setDirectoryQuery] = useState('')
  const debouncedQuery = useDebouncedValue(directoryQuery)
  const [directoryResults, setDirectoryResults] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setDirectoryResults([])
      return undefined
    }

    let cancelled = false
    api.get('/directory/customers', { params: { query: debouncedQuery } })
      .then(({ data }) => { if (!cancelled) setDirectoryResults(data) })
      .catch(() => { if (!cancelled) setDirectoryResults([]) })

    return () => { cancelled = true }
  }, [debouncedQuery])

  // Fills the destination IBAN from a directory search result.
  function selectRecipient(entry) {
    setForm({ ...form, toIban: entry.checkingIban })
    setDirectoryResults([])
    setDirectoryQuery(`${entry.firstName} ${entry.lastName}`)
  }

  // Submits an external transfer to the backend API.
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
        <h2 className="h6 mb-3">Find recipient</h2>
        <input
          className="form-control mb-2"
          placeholder="Search by name..."
          value={directoryQuery}
          onChange={(e) => setDirectoryQuery(e.target.value)}
        />
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
