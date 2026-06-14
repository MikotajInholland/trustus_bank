import { useState } from 'react'
import api from '../../api/client'

export default function AtmPage() {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleAction(action) {
    setMessage('')
    setError('')
    try {
      await api.post(`/atm/${action}`, { amount: Number(amount) })
      setMessage(`${action} successful`)
    } catch (err) {
      setError(err.response?.data?.message || `${action} failed`)
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h1 className="h4">Mock ATM</h1>
        <p className="text-muted small">Developer 2 — deposit and withdrawal skeleton</p>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="input-group mb-3">
          <span className="input-group-text">EUR</span>
          <input
            className="form-control"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={() => handleAction('deposit')}>Deposit</button>
          <button className="btn btn-danger" onClick={() => handleAction('withdraw')}>Withdraw</button>
        </div>
      </div>
    </div>
  )
}
