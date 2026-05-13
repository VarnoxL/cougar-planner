import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-c-red'

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-mono text-xl font-bold text-text-primary mb-6">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} />
        {error && <p className="text-[12px] text-rating-red">{error}</p>}
        <button type="submit" disabled={loading} className="bg-c-red text-white font-semibold py-2 rounded-lg hover:bg-c-red-hover transition-colors disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <p className="text-[13px] text-text-muted mt-4">
        No account? <Link to="/register" className="text-c-red hover:underline">Register</Link>
      </p>
    </div>
  )
}
