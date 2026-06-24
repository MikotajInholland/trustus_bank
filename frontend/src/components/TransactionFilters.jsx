
 // Filter form for transaction history queries.
 // @author Mikotaj (Dev 3 — Auditor)

export default function TransactionFilters({ filters, onChange }) {
  return (
    <div className="glass-card glass-card-padded mb-3">
      <h2 className="h6 mb-3" style={{ color: 'var(--text-secondary)' }}>Filters</h2>
      <div className="row g-2">
        <div className="col-md-3">
          <label className="form-label">Start date</label>
          <input
            type="datetime-local"
            className="form-control form-control-sm"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">End date</label>
          <input
            type="datetime-local"
            className="form-control form-control-sm"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Min amount</label>
          <input
            type="number"
            step="0.01"
            className="form-control form-control-sm"
            value={filters.minAmount}
            onChange={(e) => onChange({ ...filters, minAmount: e.target.value })}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Max amount</label>
          <input
            type="number"
            step="0.01"
            className="form-control form-control-sm"
            value={filters.maxAmount}
            onChange={(e) => onChange({ ...filters, maxAmount: e.target.value })}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Exact amount</label>
          <input
            type="number"
            step="0.01"
            className="form-control form-control-sm"
            value={filters.exactAmount}
            onChange={(e) => onChange({ ...filters, exactAmount: e.target.value })}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">IBAN</label>
          <input
            className="form-control form-control-sm font-monospace"
            placeholder="NL..."
            value={filters.iban}
            onChange={(e) => onChange({ ...filters, iban: e.target.value })}
          />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button
            className="btn btn-outline-secondary btn-sm w-100"
            onClick={() => onChange({
              startDate: '', endDate: '', minAmount: '', maxAmount: '', exactAmount: '', iban: '',
            })}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

// Converts filter form state into query params for the transactions API.
export function buildTransactionParams(filters, page = 0, size = 20) {
  const params = { page, size }
  if (filters.startDate) params.startDate = new Date(filters.startDate).toISOString()
  if (filters.endDate) params.endDate = new Date(filters.endDate).toISOString()
  if (filters.minAmount) params.minAmount = filters.minAmount
  if (filters.maxAmount) params.maxAmount = filters.maxAmount
  if (filters.exactAmount) params.exactAmount = filters.exactAmount
  if (filters.iban) params.iban = filters.iban
  return params
}
