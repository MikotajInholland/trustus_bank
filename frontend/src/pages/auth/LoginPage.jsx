import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      login(data)
      if (data.role === 'CUSTOMER' && !data.approved) {
        navigate('/waiting')
      } else {
        navigate('/')
      }
    } catch {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h1 className="h4 mb-3">Login</h1>
        <p className="text-muted small">Developer 1 — JWT authentication skeleton</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="vstack gap-3">
          <input
            className="form-control"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="form-control"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button className="btn btn-primary" type="submit">Sign in</button>
        </form>
        <p className="mt-3 mb-0 small">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}
