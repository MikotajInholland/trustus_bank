/**
 * @summary Bank-wide transaction ledger for employees.
 * @author Mikotaj (Dev 3 — Auditor)
 */
import { useCallback, useEffect, useState } from 'react'
import api from '../../services/client'
import PageHeader from '../../components/PageHeader'
import Pagination from '../../components/Pagination'
import TransactionTable from '../../components/TransactionTable'

/**
 * @summary Employee page showing every transaction in the system.
 */
export default function GlobalLedgerPage() {
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  /**
   * @summary Fetches a page of transactions from the global ledger API.
   */
  const load = useCallback(() => {
    api.get('/employee/ledger', { params: { page, size: 50 } })
      .then(({ data }) => {
        setTransactions(data.content || [])
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      })
      .catch(() => setTransactions([]))
  }, [page])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <PageHeader
        title="Global Ledger"
        subtitle="Every transaction in the system."
      />      <p className="text-muted small">{totalElements} total transaction(s)</p>
      <TransactionTable transactions={transactions} emptyMessage="No transactions in the system yet" />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
