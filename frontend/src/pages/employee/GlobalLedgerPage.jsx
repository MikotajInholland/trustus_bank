import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function GlobalLedgerPage() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    api.get('/employee/ledger')
      .then(({ data }) => setTransactions(data.content || []))
      .catch(() => setTransactions([]))
  }, [])

  return (
    <div>
      <h1 className="h4">Global Ledger</h1>
      <p className="text-muted small">Developer 3 — audit trail skeleton</p>
      <div className="table-responsive card shadow-sm">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.type}</td>
                <td>{tx.fromIban || '-'}</td>
                <td>{tx.toIban || '-'}</td>
                <td>{tx.amount} {tx.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
