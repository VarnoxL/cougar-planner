import RatingBadge from './RatingBadge'

function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function RmpReviewCard({ review }) {
  const date = formatDate(review.date)

  return (
    <div className="py-[14px] border-b border-border last:border-none">

      <div className="flex items-center gap-[10px] mb-2 flex-wrap">

        <span className="text-[10px] font-semibold uppercase tracking-wider text-c-red bg-c-red/10 border border-c-red/20 px-2 py-0.5 rounded-[2px] shrink-0">
          RateMyProfessors
        </span>

        {date && (
          <span className="text-[11px] text-text-muted">{date}</span>
        )}

        <RatingBadge rating={review.rating ?? null} />

        {review.difficulty != null && (
          <span className="font-mono text-[11px] text-text-secondary">
            Diff {Number(review.difficulty).toFixed(1)}
          </span>
        )}

        {review.would_take_again != null && (
          <span className="font-mono text-[11px] text-text-muted">
            Would take again: {review.would_take_again ? 'Yes' : 'No'}
          </span>
        )}
      </div>

      <div>
        {review.comment && (
          <p className="text-[13px] text-text-secondary leading-[1.65]">
            {review.comment}
          </p>
        )}
        {review.course && (
          <p className="font-mono text-[11px] text-text-muted mt-1">
            {review.course}
          </p>
        )}
      </div>

    </div>
  )
}
