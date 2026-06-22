/**
 * @summary Sign-in form with one-click demo logins.
 * @author Wesley (Dev 1 — Gatekeeper)
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getApiErrorMessage } from '../../services/client'
import { useAuth } from '../../services/AuthContext'
import GlassCard from '../../components/GlassCard'
import PageHeader from '../../components/PageHeader'
import { DEMO_ACCOUNTS } from '../../constants/demoAccounts'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function performLogin(credentials) {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      })
      login(data)
      if (data.role === 'CUSTOMER' && !data.approved) {
        navigate('/waiting')
      } else if (data.role === 'EMPLOYEE') {
        navigate('/employee/approvals')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await performLogin(form)
  }

  async function loginAsDemo(account) {
    setForm({ email: account.email, password: account.password })
    await performLogin(account)
  }

  const customerDemos = DEMO_ACCOUNTS.filter((a) => a.role === 'CUSTOMER')
  const employeeDemo = DEMO_ACCOUNTS.find((a) => a.role === 'EMPLOYEE')

  return (
    <div className="auth-layout auth-layout-single">
      <GlassCard>
        <PageHeader
          title="Welcome back"
          subtitle="Sign in with your email and password."
        />
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="vstack gap-3">
          <div>
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-brand w-100" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="demo-login-section mt-4">
          <p className="small text-muted mb-2">Quick demo login</p>
          <div className="demo-login-grid">
            {customerDemos.map((account) => (
              <button
                key={account.id}
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => loginAsDemo(account)}
                disabled={loading}
              >
                {account.label}
              </button>
            ))}
          </div>
          {employeeDemo && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm w-100 mt-2"
              onClick={() => loginAsDemo(employeeDemo)}
              disabled={loading}
            >
              {employeeDemo.label} (employee)
            </button>
          )}
        </div>

        <p className="mt-3 mb-0 small text-muted">
          Customers use password <code>customer123</code>, employee uses <code>employee123</code>
        </p>
        <p className="mt-2 mb-0 small">
          No account? <Link to="/register">Register</Link>
        </p>
      </GlassCard>
    </div>
  )
}
