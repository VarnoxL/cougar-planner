import { ratingColor } from '../utils/ratingColor'

const bgTint = {
  'text-rating-green': 'bg-rating-green/10',
  'text-rating-yellow': 'bg-rating-yellow/10',
  'text-rating-red': 'bg-rating-red/10',
  'text-text-muted': 'bg-bg-input',
}

export default function RatingBadge({ rating }) {
  const textClass = ratingColor(rating)
  const bgClass = bgTint[textClass]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-sm ${bgClass} ${textClass}`}>
      {rating != null ? rating.toFixed(1) : '—'}
    </span>
  )
}
