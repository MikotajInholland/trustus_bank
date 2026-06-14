/**
 * @summary ATM deposit and withdrawal interface.
 * @author Darlington (Dev 2 — Teller)
 */
import { useState } from 'react'
import api, { getApiErrorMessage } from '../../api/client'
import PageHeader from '../../components/PageHeader'

export default function AtmPage() {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAction(action) {
    setMessage('')
    setError('')
    setLoading(true)
    try {
      await api.post(`/atm/${action}`, { amount: Number(amount) })
      setMessage(`${action === 'deposit' ? 'Deposit' : 'Withdrawal'} of €${Number(amount).toFixed(2)} successful`)
      setAmount('')
    } catch (err) {
      setError(getApiErrorMessage(err, `${action} failed`))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="atm-screen shadow-lg">
      <PageHeader
        title="Cash machine"
        subtitle="Deposit to or withdraw from your checking account."
      />
      {message && <div className="alert alert-success py-2">{message}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="input-group input-group-lg mb-4">
        <span className="input-group-text">€</span>
        <input
          className="form-control"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div className="d-grid gap-3" style={{ maxWidth: 360, margin: '0 auto' }}>
        <button
          className="btn btn-success btn-lg"
          disabled={loading || !amount}
          onClick={() => handleAction('deposit')}
        >
          ↑ Deposit
        </button>
        <button
          className="btn btn-danger btn-lg"
          disabled={loading || !amount}
          onClick={() => handleAction('withdraw')}
        >
          ↓ Withdraw
        </button>
      </div>
    </div>
  )
}
