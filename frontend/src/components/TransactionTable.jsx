// Table for displaying ledger transactions.
// @author Mikotaj (Dev 3 — Auditor)
// Renders a paginated list of transactions with type, IBANs, amount, and timestamp.
export default function TransactionTable({ transactions, emptyMessage = 'No transactions found' }) {
  return (
    <div className="table-responsive glass-card">
      <table className="table table-hover mb-0 table-stack">
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
            <tr><td colSpan="5" className="text-muted text-center py-5 table-stack-empty">{emptyMessage}</td></tr>
          )}
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td data-label="Type"><span className="tx-badge">{tx.type.replace(/_/g, ' ')}</span></td>
              <td data-label="From" className="font-monospace small">{tx.fromIban || '—'}</td>
              <td data-label="To" className="font-monospace small">{tx.toIban || '—'}</td>
              <td data-label="Amount" className="fw-semibold" style={{ color: '#34d399' }}>
                {Number(tx.amount).toFixed(2)} {tx.currency}
              </td>
              <td data-label="When" className="small text-muted">{new Date(tx.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
