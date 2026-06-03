import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}

export default function RegisterPage() {
  const { register, signInWithGoogle, resendVerification, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const from = location.state?.from?.pathname || '/schedules'

  useEffect(() => {
    if (user?.emailVerified) navigate(from, { replace: true })
  }, [user])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => {
      setCooldown(c => (c <= 1 ? 0 : c - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [cooldown > 0])

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

  async function handleGoogle() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
    } finally {
      setLoading(false)
    }
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
        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-sm text-c-red hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
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
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[12px] text-text-muted">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-bg-card border border-border text-text-primary text-sm font-semibold py-2 rounded-lg hover:border-text-muted transition-colors disabled:opacity-50"
      >
        <GoogleIcon /> Continue with Google
      </button>
      <p className="text-[13px] text-text-muted mt-4">
        Have an account? <Link to="/login" className="text-c-red hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
