import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, authError, logout } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
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
