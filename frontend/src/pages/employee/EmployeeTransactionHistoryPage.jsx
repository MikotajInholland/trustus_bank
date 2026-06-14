// @summary Employee view of a customer's transactions.
// Owner: Mikotaj (Dev 3 — Auditor)
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/client'
import PageHeader from '../../components/PageHeader'
import Pagination from '../../components/Pagination'
import TransactionFilters, { buildTransactionParams } from '../../components/TransactionFilters'
import TransactionTable from '../../components/TransactionTable'

const EMPTY_FILTERS = {
  startDate: '', endDate: '', minAmount: '', maxAmount: '', exactAmount: '', iban: '',
}

export default function EmployeeTransactionHistoryPage() {
  const { customerId } = useParams()
  const [transactions, setTransactions] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const load = useCallback(() => {
    const params = buildTransactionParams(appliedFilters, page, 20)
    api.get(`/employee/customers/${customerId}/transactions`, { params })
      .then(({ data }) => {
        setTransactions(data.content || [])
        setTotalPages(data.totalPages || 0)
      })
      .catch(() => setTransactions([]))
  }, [customerId, appliedFilters, page])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <PageHeader
        title="Customer Transaction History"
        subtitle={`Transactions for customer #${customerId}.`}
      />      <TransactionFilters filters={filters} onChange={setFilters} onApply={() => { setPage(0); setAppliedFilters({ ...filters }) }} />
      <TransactionTable transactions={transactions} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
