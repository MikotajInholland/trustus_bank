// Reusable paginated list controls (windowed so it never overflows on phones).
// @author Wesley, Darlington, Mikotaj (shared)
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  // Always show first, last, and a window around the current page; gaps become "…".
  const visible = new Set([0, totalPages - 1, page - 1, page, page + 1])
  const pages = [...visible].filter((p) => p >= 0 && p < totalPages).sort((a, b) => a - b)
  const items = []
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) items.push({ gap: true, key: `gap-${p}` })
    items.push({ page: p, key: p })
  })

  return (
    <nav className="mt-3" aria-label="Pagination">
      <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-center justify-content-md-start">
        <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
            Previous
          </button>
        </li>
        {items.map((item) => (
          item.gap ? (
            <li key={item.key} className="page-item disabled"><span className="page-link">…</span></li>
          ) : (
            <li key={item.key} className={`page-item ${item.page === page ? 'active' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(item.page)}>{item.page + 1}</button>
            </li>
          )
        ))}
        <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
            Next
          </button>
        </li>
      </ul>
    </nav>
  )
}
