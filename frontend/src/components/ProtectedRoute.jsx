import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, authError, logout, resendVerification, checkVerification } = useAuth()
  const location = useLocation()
  const [notVerifiedYet, setNotVerifiedYet] = useState(false)
  const [resent, setResent] = useState(false)

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (!user.emailVerified) {
    async function handleCheck() {
      setNotVerifiedYet(false)
      const verified = await checkVerification()
      if (!verified) setNotVerifiedYet(true)
    }

    async function handleResend() {
      await resendVerification()
      setResent(true)
      setTimeout(() => setResent(false), 4000)
    }

    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="font-mono text-lg font-bold text-text-primary mb-3">Verify your email</h2>
        <p className="text-sm text-text-muted mb-6">
          Check your inbox and click the verification link to continue.
        </p>
        <button
          onClick={handleCheck}
          className="bg-c-red text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-c-red-hover transition-colors mb-3 block mx-auto"
        >
          I've verified my email
        </button>
        {notVerifiedYet && (
          <p className="text-[12px] text-rating-red mb-3">
            Not verified yet — check your inbox and click the link first.
          </p>
        )}
        <button onClick={handleResend} className="text-sm text-text-muted hover:underline">
          {resent ? 'Email sent!' : 'Resend verification email'}
        </button>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-rating-red text-sm mb-4">{authError}</p>
        <button onClick={logout} className="text-sm underline text-text-muted">
          Sign out and try again
        </button>
      </div>
    )
  }

  return children
}
