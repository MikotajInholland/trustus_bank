import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/client'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bsn: '',
    phoneNumber: '',
    password: '',
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
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h1 className="h4 mb-3">Customer Registration</h1>
        <p className="text-muted small">Developer 1 — onboarding skeleton with validation</p>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="row g-3">
          {['firstName', 'lastName', 'email', 'bsn', 'phoneNumber', 'password'].map((field) => (
            <div className="col-md-6" key={field}>
              <input
                className="form-control"
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                placeholder={field}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
              />
            </div>
          ))}
          <div className="col-12">
            <button className="btn btn-primary" type="submit">Register</button>
          </div>
        </form>
        <p className="mt-3 mb-0 small">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
