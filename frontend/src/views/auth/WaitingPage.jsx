/**
 * @summary Screen shown while account approval is pending.
 * @author Wesley (Dev 1 — Gatekeeper)
 */
import { Link } from 'react-router-dom'
import GlassCard from '../../components/GlassCard'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../services/AuthContext'

export default function WaitingPage() {
  const { auth } = useAuth()

  return (
    <GlassCard className="text-center">
      <div className="py-4">
        <div className="waiting-icon mb-3">⏳</div>
        <PageHeader
          title="Almost there"
          subtitle="Your account is pending employee approval. Banking features unlock once approved."
        />
        <p className="text-muted mb-4">
          Signed in as <strong style={{ color: 'var(--text-primary)' }}>{auth?.email}</strong>
        </p>
        <Link className="btn btn-outline-primary" to="/">Back to home</Link>
      </div>
    </GlassCard>
  )
}
