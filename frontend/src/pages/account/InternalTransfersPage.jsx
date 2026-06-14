// @summary Move funds between own checking and savings.
// Owner: Darlington (Dev 2 — Teller)
import { useState } from 'react'
import api from '../../api/client'
import GlassCard from '../../components/GlassCard'
import PageHeader from '../../components/PageHeader'

export default function InternalTransfersPage() {
  const [form, setForm] = useState({ fromAccountType: 'CHECKING', toAccountType: 'SAVINGS', amount: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    if (form.fromAccountType === form.toAccountType) {
      setError('Source and destination must be different')
      return
    }
    try {
      await api.post('/customer/transfers/internal', { ...form, amount: Number(form.amount) })
      setMessage('Internal transfer completed')
      setForm({ ...form, amount: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Internal transfers"
        subtitle="Move funds between your checking and savings accounts instantly."
      />      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <GlassCard>        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label className="form-label">From</label>
            <select
              className="form-select"
              value={form.fromAccountType}
              onChange={(e) => setForm({ ...form, fromAccountType: e.target.value })}
            >
              <option value="CHECKING">Checking</option>
              <option value="SAVINGS">Savings</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">To</label>
            <select
              className="form-select"
              value={form.toAccountType}
              onChange={(e) => setForm({ ...form, toAccountType: e.target.value })}
            >
              <option value="SAVINGS">Savings</option>
              <option value="CHECKING">Checking</option>
            </select>
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
          <div className="col-12">
            <button className="btn btn-brand">Transfer funds</button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
