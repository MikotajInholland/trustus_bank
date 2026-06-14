/**
 * @summary Neo-bank style account card for the dashboard.
 * @author Darlington (Dev 2 — Teller)
 */
function formatIban(iban) {
  return iban.replace(/(.{4})/g, '$1 ').trim()
}

export default function AccountCard({ account, holderName, index = 0 }) {
  const isChecking = account.type === 'CHECKING'
  const variant = isChecking ? 'checking' : 'savings'

  return (
    <article
      className={`bank-card bank-card-${variant}`}
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <div className="bank-card-shine" aria-hidden="true" />
      <div className="bank-card-noise" aria-hidden="true" />

      <div className="bank-card-top">
        <div className="bank-card-chip" aria-hidden="true" />
        <span className="bank-card-brand">TrustUs</span>
      </div>

      <div className="bank-card-middle">
        <p className="bank-card-label">IBAN</p>
        <p className="bank-card-iban">{formatIban(account.iban)}</p>
      </div>

      <div className="bank-card-bottom">
        <div>
          <p className="bank-card-label">Balance</p>
          <p className="bank-card-balance">
            €{Number(account.balance).toFixed(2)}
          </p>
        </div>
        <div className="bank-card-meta">
          <p className="bank-card-label">Account</p>
          <p className="bank-card-type">{isChecking ? 'Checking' : 'Savings'}</p>
          {holderName && (
            <p className="bank-card-holder">{holderName}</p>
          )}
        </div>
      </div>

      {!account.active && (
        <span className="bank-card-status">Inactive</span>
      )}
    </article>
  )
}
