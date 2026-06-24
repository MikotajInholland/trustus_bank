// Employee view of a customer's transactions.
// @author Mikotaj (Dev 3 — Auditor)
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/client'
import useDebouncedValue from '../../services/useDebouncedValue'
import PageHeader from '../../components/PageHeader'
import Pagination from '../../components/Pagination'
import TransactionFilters, { buildTransactionParams } from '../../components/TransactionFilters'
import TransactionTable from '../../components/TransactionTable'

const EMPTY_FILTERS = {
  startDate: '', endDate: '', minAmount: '', maxAmount: '', exactAmount: '', iban: '',
}

// Employee page for viewing a specific customer's transaction history.
export default function EmployeeTransactionHistoryPage() {
  const { customerId } = useParams()
  const [transactions, setTransactions] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const debouncedFilters = useDebouncedValue(filters)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => { setPage(0) }, [debouncedFilters])

  // Fetches paginated transactions for the customer from the employee API.
  const load = useCallback(() => {
    const params = buildTransactionParams(debouncedFilters, page, 20)
    api.get(`/employee/customers/${customerId}/transactions`, { params })
      .then(({ data }) => {
        setTransactions(data.content || [])
        setTotalPages(data.totalPages || 0)
      })
      .catch(() => setTransactions([]))
  }, [customerId, debouncedFilters, page])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <PageHeader
        title="Customer Transaction History"
        subtitle={`Transactions for customer #${customerId}.`}
      />      <TransactionFilters filters={filters} onChange={setFilters} />
      <TransactionTable transactions={transactions} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
