// ATM session login for customers.
// @author Darlington (Dev 2 — Teller)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getApiErrorMessage } from '../../services/client'
import { useAuth } from '../../services/AuthContext'

export default function AtmLoginPage() {  const navigate = useNavigate()
  const { auth, login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  if (auth?.role === 'CUSTOMER' && auth.approved) {
    navigate('/atm', { replace: true })
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      if (data.role !== 'CUSTOMER') {
        setError('ATM is for customers only')
        return
      }
      if (!data.approved) {
        setError('Your account is not yet approved')
        return
      }
      login(data)
      navigate('/atm')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password'))
    }
  }

  return (
    <div className="atm-screen shadow-lg mx-auto" style={{ maxWidth: 480 }}>
      <div className="text-center mb-4">
        <h1 className="atm-title mb-1">TrustUs ATM</h1>        <p className="text-muted small mb-0">Insert credentials to access your account</p>
      </div>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={handleSubmit} className="vstack gap-3">
        <input
          className="form-control form-control-lg"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="form-control form-control-lg"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="btn btn-success btn-lg w-100" type="submit">Access ATM</button>
      </form>
    </div>
  )
}
