import { Link } from 'react-router-dom'
import RatingBadge from './RatingBadge'

export default function ProfessorBadge({ professor, showDifficulty = false }) {
  if (!professor) {
    return <span className="text-text-muted text-sm">TBA</span>
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Link
        to={`/professors/${professor.id}`}
        className="text-text-primary text-sm hover:text-c-red transition-colors"
      >
        {professor.name}
      </Link>
      <RatingBadge rating={professor.rating} />
      {showDifficulty && (
        <span className="text-text-muted text-xs">
          Diff: {professor.difficulty?.toFixed(1) ?? '—'}
        </span>
      )}
    </span>
  )
}
