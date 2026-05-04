import RatingBadge from './RatingBadge'

function getInitials(displayName) {
  if (!displayName) return '?'
  return displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function ReviewCard({ review, onDelete }) {
  const displayName = review.user?.display_name
  const date = formatDate(review.created_at)

  return (
    <div className="py-[14px] border-b border-border last:border-none">

      <div className="flex items-center gap-[10px] mb-2">

        <div className="w-7 h-7 rounded-full bg-bg-input border border-border flex items-center justify-center shrink-0 font-mono text-[10px] font-bold text-c-red">
          {getInitials(displayName)}
        </div>

        <span className="text-[13px] font-semibold text-text-primary">
          {displayName ?? 'Anonymous'}
        </span>

        {date && (
          <span className="text-[11px] text-text-muted">{date}</span>
        )}

        <RatingBadge rating={review.rating ?? null} />

        {review.difficulty != null && (
          <span className="font-mono text-[11px] text-text-secondary">
            Diff {review.difficulty.toFixed(1)}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {review.grade_received && (
            <span className="font-mono text-[11px] text-text-muted bg-bg-input border border-border px-2 py-0.5 rounded-[2px]">
              {review.grade_received}
            </span>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(review.id)}
              className="text-text-muted hover:text-c-red transition-colors text-[13px] leading-none"
              aria-label="Delete review"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="pl-[38px]">
        {review.comment && (
          <p className="text-[13px] text-text-secondary leading-[1.65]">
            {review.comment}
          </p>
        )}
        {review.course && (
          <p className="font-mono text-[11px] text-text-muted mt-1">
            {review.course.subject} {review.course.number}
          </p>
        )}
      </div>

    </div>
  )
}
