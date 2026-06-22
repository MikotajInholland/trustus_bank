/**
 * @summary Searchable list of active customers.
 * @author Darlington (Dev 2 — Teller)
 */
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/client'
import useDebouncedValue from '../../services/useDebouncedValue'
import PageHeader from '../../components/PageHeader'
import Pagination from '../../components/Pagination'

export default function EmployeeCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const load = useCallback(() => {
    api.get('/employee/customers', { params: { search: debouncedSearch || undefined, page, size: 15 } })
      .then(({ data }) => {
        setCustomers(data.content || [])
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      })
      .catch(() => setCustomers([]))
  }, [debouncedSearch, page])

  useEffect(() => { setPage(0) }, [debouncedSearch])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <PageHeader
        title="Active customers"
        subtitle="Search and browse approved customers."
      />
      <input
        className="form-control mb-3"
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <p className="text-muted small">{totalElements} active customer(s)</p>

      <div className="table-responsive glass-card">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr><td colSpan="4" className="text-muted text-center py-5">No customers found</td></tr>
            )}
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.firstName} {customer.lastName}</td>
                <td>{customer.email}</td>
                <td>{customer.phoneNumber}</td>
                <td>
                  <Link
                    className="btn btn-sm btn-outline-primary"
                    to={`/employee/customers/${customer.id}/transactions`}
                  >
                    Transactions
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
