import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    api.get('/customer/transactions')
      .then(({ data }) => setTransactions(data.content || []))
      .catch(() => setTransactions([]))
  }, [])

  return (
    <div>
      <h1 className="h4">Transaction History</h1>
      <p className="text-muted small">Developer 3 — pagination and filters to be implemented</p>
      <div className="table-responsive card shadow-sm">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr><td colSpan="5" className="text-muted">No transactions yet</td></tr>
            )}
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.type}</td>
                <td>{tx.fromIban || '-'}</td>
                <td>{tx.toIban || '-'}</td>
                <td>{tx.amount} {tx.currency}</td>
                <td>{new Date(tx.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
