import { useState } from 'react'
import api from '../../api/client'

export default function TransfersPage() {
  const [external, setExternal] = useState({ toIban: '', amount: '' })
  const [internal, setInternal] = useState({ fromAccountType: 'CHECKING', toAccountType: 'SAVINGS', amount: '' })
  const [message, setMessage] = useState('')

  async function submitExternal(event) {
    event.preventDefault()
    await api.post('/customer/transfers/external', { ...external, amount: Number(external.amount) })
    setMessage('External transfer submitted')
  }

  async function submitInternal(event) {
    event.preventDefault()
    await api.post('/customer/transfers/internal', { ...internal, amount: Number(internal.amount) })
    setMessage('Internal transfer submitted')
  }

  return (
    <div className="vstack gap-3">
      <h1 className="h4">Transfers</h1>
      <p className="text-muted small">Developer 3 — external and internal transfer skeleton</p>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <div className="card-body">
          <h2 className="h6">External transfer</h2>
          <form className="row g-2" onSubmit={submitExternal}>
            <div className="col-md-6"><input className="form-control" placeholder="Destination IBAN" value={external.toIban} onChange={(e) => setExternal({ ...external, toIban: e.target.value })} required /></div>
            <div className="col-md-3"><input className="form-control" type="number" placeholder="Amount" value={external.amount} onChange={(e) => setExternal({ ...external, amount: e.target.value })} required /></div>
            <div className="col-md-3"><button className="btn btn-primary w-100">Send</button></div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="h6">Internal transfer</h2>
          <form className="row g-2" onSubmit={submitInternal}>
            <div className="col-md-3">
              <select className="form-select" value={internal.fromAccountType} onChange={(e) => setInternal({ ...internal, fromAccountType: e.target.value })}>
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={internal.toAccountType} onChange={(e) => setInternal({ ...internal, toAccountType: e.target.value })}>
                <option value="SAVINGS">Savings</option>
                <option value="CHECKING">Checking</option>
              </select>
            </div>
            <div className="col-md-3"><input className="form-control" type="number" placeholder="Amount" value={internal.amount} onChange={(e) => setInternal({ ...internal, amount: e.target.value })} required /></div>
            <div className="col-md-3"><button className="btn btn-outline-primary w-100">Move funds</button></div>
          </form>
        </div>
      </div>
    </div>
  )
}
