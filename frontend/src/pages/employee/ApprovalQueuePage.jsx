import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function ApprovalQueuePage() {
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    api.get('/employee/approvals')
      .then(({ data }) => setCustomers(data.content || []))
      .catch(() => setCustomers([]))
  }, [])

  async function approve(customerId) {
    await api.post(`/employee/approvals/${customerId}`, {
      dailyTransferLimit: 1000,
      absoluteTransferLimit: 5000,
    })
    setCustomers((current) => current.filter((customer) => customer.id !== customerId))
  }

  return (
    <div>
      <h1 className="h4">Approval Queue</h1>
      <p className="text-muted small">Developer 1 — employee approval skeleton</p>
      <div className="list-group">
        {customers.length === 0 && <div className="list-group-item text-muted">No pending customers</div>}
        {customers.map((customer) => (
          <div className="list-group-item d-flex justify-content-between align-items-center" key={customer.id}>
            <div>
              <strong>{customer.firstName} {customer.lastName}</strong>
              <div className="small text-muted">{customer.email}</div>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => approve(customer.id)}>Approve</button>
          </div>
        ))}
      </div>
    </div>
  )
}
