// @summary New customer registration form.
// Owner: Wesley (Dev 1 — Gatekeeper)
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import GlassCard from '../../components/GlassCard'
import PageHeader from '../../components/PageHeader'

const FIELDS = [
  { key: 'firstName', label: 'First name', type: 'text' },
  { key: 'lastName', label: 'Last name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'bsn', label: 'BSN (9 digits)', type: 'text', pattern: '\\d{9}' },
  { key: 'phoneNumber', label: 'Phone number', type: 'tel' },
  { key: 'password', label: 'Password (min 8 chars)', type: 'password', minLength: 8 },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', bsn: '', phoneNumber: '', password: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const { data } = await api.post('/register', form)
      setMessage(data.message)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="auth-layout auth-layout-single">
      <GlassCard>
        <PageHeader
          title="Open your account"
          subtitle="Register to get started. An employee will review your application."
        />
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="row g-3">
          {FIELDS.map(({ key, label, type, pattern, minLength }) => (
            <div className="col-md-6" key={key}>
              <label className="form-label">{label}</label>
              <input
                className="form-control"
                type={type}
                value={form[key]}
                pattern={pattern}
                minLength={minLength}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
              />
            </div>
          ))}
          <div className="col-12">
            <button className="btn btn-brand" type="submit">Create account</button>
          </div>
        </form>
        <p className="mt-3 mb-0 small">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </GlassCard>
    </div>
  )
}
