// @summary Employee queue to approve new customers.
// Owner: Wesley (Dev 1 — Gatekeeper)
import { useCallback, useEffect, useState } from 'react'
import api from '../../api/client'
import GlassCard from '../../components/GlassCard'
import PageHeader from '../../components/PageHeader'
import Pagination from '../../components/Pagination'

export default function ApprovalQueuePage() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [limits, setLimits] = useState({ dailyTransferLimit: 1000, absoluteTransferLimit: 5000 })
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api.get('/employee/approvals', { params: { search: search || undefined, page, size: 10 } })
      .then(({ data }) => {
        setCustomers(data.content || [])
        setTotalPages(data.totalPages || 0)
      })
      .catch(() => setCustomers([]))
  }, [search, page])

  useEffect(() => { load() }, [load])

  async function approve(customerId) {
    setError('')
    try {
      await api.post(`/employee/approvals/${customerId}`, {
        dailyTransferLimit: Number(limits.dailyTransferLimit),
        absoluteTransferLimit: Number(limits.absoluteTransferLimit),
      })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Approval queue"
        subtitle="Review pending customers and provision their accounts."
      />      {error && <div className="alert alert-danger">{error}</div>}

      <GlassCard className="mb-3">        <h2 className="h6 mb-3">Default limits for new approvals</h2>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label">Daily limit (EUR)</label>
            <input
              type="number"
              className="form-control"
              value={limits.dailyTransferLimit}
              onChange={(e) => setLimits({ ...limits, dailyTransferLimit: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Absolute limit (EUR)</label>
            <input
              type="number"
              className="form-control"
              value={limits.absoluteTransferLimit}
              onChange={(e) => setLimits({ ...limits, absoluteTransferLimit: e.target.value })}
            />
          </div>
        </div>
      </GlassCard>

      <div className="input-group mb-3">
        <input
          className="form-control"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
        />
        <button className="btn btn-brand" onClick={load}>Search</button>
      </div>

      <div className="list-group glass-card mb-0">
        {customers.length === 0 && (
          <div className="list-group-item text-muted text-center py-5">No pending customers</div>
        )}
        {customers.map((customer) => (
          <div className="list-group-item d-flex justify-content-between align-items-center gap-3" key={customer.id}>
            <div>
              <strong>{customer.firstName} {customer.lastName}</strong>
              <div className="small text-muted">{customer.email} · {customer.phoneNumber}</div>
            </div>
            <button className="btn btn-sm btn-brand" onClick={() => approve(customer.id)}>
              Approve
            </button>
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
