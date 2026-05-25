import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const { register, resendVerification, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [resent, setResent] = useState(false)

  const from = location.state?.from?.pathname || '/schedules'

  useEffect(() => {
    if (user?.emailVerified) navigate(from, { replace: true })
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(email, password)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    try {
      await resendVerification()
      setResent(true)
      setTimeout(() => setResent(false), 4000)
    } catch {
      // silently ignore — Firebase rate-limits this
    }
  }

  const inputClass = 'w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-c-red'

  if (sent) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <h1 className="font-mono text-xl font-bold text-text-primary mb-3">Check your email</h1>
        <p className="text-sm text-text-muted mb-6">
          We sent a verification link to <span className="text-text-primary">{email}</span>.
          Click it to activate your account, then{' '}
          <Link to="/login" className="text-c-red hover:underline">sign in</Link>.
        </p>
        <button onClick={handleResend} className="text-sm text-c-red hover:underline">
          {resent ? 'Email sent!' : 'Resend email'}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-mono text-xl font-bold text-text-primary mb-6">Create Account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
        <input type="password" placeholder="Password (6+ characters)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className={inputClass} />
        {error && <p className="text-[12px] text-rating-red">{error}</p>}
        <button type="submit" disabled={loading} className="bg-c-red text-white font-semibold py-2 rounded-lg hover:bg-c-red-hover transition-colors disabled:opacity-50">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
      <p className="text-[13px] text-text-muted mt-4">
        Have an account? <Link to="/login" className="text-c-red hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
