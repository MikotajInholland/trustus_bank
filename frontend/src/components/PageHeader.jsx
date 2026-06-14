/**
 * @summary Page title and subtitle block.
 * @author Wesley, Darlington, Mikotaj (shared)
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header mb-4">
      <h1>{title}</h1>
      {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      {children}
    </div>
  )
}
