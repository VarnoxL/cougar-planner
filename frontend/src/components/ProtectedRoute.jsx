import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, authError, logout, resendVerification, checkVerification } = useAuth()
  const location = useLocation()
  const [notVerifiedYet, setNotVerifiedYet] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => {
      setCooldown(c => (c <= 1 ? 0 : c - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [cooldown > 0])

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (!user.emailVerified) {
    async function handleCheck() {
      setNotVerifiedYet(false)
      const verified = await checkVerification()
      if (!verified) setNotVerifiedYet(true)
    }

    async function handleResend() {
      if (cooldown > 0) return
      try {
        await resendVerification()
        setCooldown(60)
      } catch {
        // silently ignore — Firebase rate-limits this
      }
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
        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-sm text-text-muted hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
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
