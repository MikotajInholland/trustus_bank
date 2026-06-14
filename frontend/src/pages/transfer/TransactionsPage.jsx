/**
 * @summary Customer transaction history with filters.
 * @author Mikotaj (Dev 3 — Auditor)
 */
import { useCallback, useEffect, useState } from 'react'
import api from '../../api/client'
import PageHeader from '../../components/PageHeader'
import Pagination from '../../components/Pagination'
import TransactionFilters, { buildTransactionParams } from '../../components/TransactionFilters'
import TransactionTable from '../../components/TransactionTable'

const EMPTY_FILTERS = {
  startDate: '', endDate: '', minAmount: '', maxAmount: '', exactAmount: '', iban: '',
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const load = useCallback(() => {
    const params = buildTransactionParams(appliedFilters, page, 20)
    api.get('/customer/transactions', { params })
      .then(({ data }) => {
        setTransactions(data.content || [])
        setTotalPages(data.totalPages || 0)
      })
      .catch(() => setTransactions([]))
  }, [appliedFilters, page])

  useEffect(() => { load() }, [load])

  function applyFilters() {
    setPage(0)
    setAppliedFilters({ ...filters })
  }

  return (
    <div>
      <PageHeader
        title="Transaction History"
        subtitle="Filter by date, amount, or IBAN."
      />      <TransactionFilters filters={filters} onChange={setFilters} onApply={applyFilters} />
      <TransactionTable transactions={transactions} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
