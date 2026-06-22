/**
 * @summary Employee tool to close customer accounts.
 * @author Wesley (Dev 1 — Gatekeeper)
 */
import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../../services/client'
import useDebouncedValue from '../../services/useDebouncedValue'
import GlassCard from '../../components/GlassCard'
import PageHeader from '../../components/PageHeader'

export default function AccountClosurePage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setSelected(null)
      return undefined
    }

    let cancelled = false
    api.get('/directory/customers', { params: { query: debouncedQuery } })
      .then(({ data }) => {
        if (!cancelled) {
          setResults(data)
          setSelected(null)
        }
      })
      .catch(() => { if (!cancelled) setResults([]) })

    return () => { cancelled = true }
  }, [debouncedQuery])

  async function closeAccount() {
    if (!selected) return
    setMessage('')
    setError('')
    if (!window.confirm(`Close all accounts for ${selected.firstName} ${selected.lastName}?`)) return
    try {
      await api.post(`/employee/customers/${selected.customerId}/close`)
      setMessage(`Accounts closed for ${selected.firstName} ${selected.lastName}`)
      setSelected(null)
      setResults((current) => current.filter((c) => c.customerId !== selected.customerId))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Closure failed'))
    }
  }

  return (
    <div>
      <PageHeader
        title="Account closure"
        subtitle="Search a customer and close their accounts."
      />      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <input
        className="form-control mb-3"
        placeholder="Search customer by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="list-group glass-card mb-3">
        {results.map((customer) => (
          <button
            key={customer.customerId}
            type="button"
            className={`list-group-item list-group-item-action ${selected?.customerId === customer.customerId ? 'active' : ''}`}
            onClick={() => setSelected(customer)}
          >
            <strong>{customer.firstName} {customer.lastName}</strong>
            <span className="small ms-2 font-monospace">{customer.checkingIban}</span>
          </button>
        ))}
      </div>

      {selected && (
        <GlassCard className="border-danger-subtle">          <h2 className="h6" style={{ color: '#fca5a5' }}>Close {selected.firstName} {selected.lastName}</h2>
          <p className="small text-muted mb-3">
            Deactivates all accounts and disables the user permanently.
          </p>
          <button className="btn btn-danger" onClick={closeAccount}>Close customer accounts</button>
        </GlassCard>
      )}
    </div>
  )
}
