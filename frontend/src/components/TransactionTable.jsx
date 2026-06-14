/**
 * @summary Table for displaying ledger transactions.
 * @author Mikotaj (Dev 3 — Auditor)
 */
export default function TransactionTable({ transactions, emptyMessage = 'No transactions found' }) {
  return (
    <div className="table-responsive glass-card">
      <table className="table table-hover mb-0">
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
            <tr><td colSpan="5" className="text-muted text-center py-5">{emptyMessage}</td></tr>
          )}
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td><span className="tx-badge">{tx.type.replace(/_/g, ' ')}</span></td>
              <td className="font-monospace small">{tx.fromIban || '—'}</td>
              <td className="font-monospace small">{tx.toIban || '—'}</td>
              <td className="fw-semibold" style={{ color: '#34d399' }}>
                {Number(tx.amount).toFixed(2)} {tx.currency}
              </td>
              <td className="small text-muted">{new Date(tx.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
