import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function EmployeeCustomersPage() {
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    api.get('/employee/customers')
      .then(({ data }) => setCustomers(data.content || []))
      .catch(() => setCustomers([]))
  }, [])

  return (
    <div>
      <h1 className="h4">Active Customers</h1>
      <p className="text-muted small">Developer 2 — paginated customer list skeleton</p>
      <div className="table-responsive card shadow-sm">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.firstName} {customer.lastName}</td>
                <td>{customer.email}</td>
                <td>{customer.phoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
