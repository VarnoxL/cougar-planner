import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'

export default function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <EmptyState message="Page not found." />
      <Link to="/" className="text-sm text-c-red hover:underline">
        Back to home
      </Link>
    </div>
  )
}
