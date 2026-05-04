export default function Pagination({ page, pages, onPrev, onNext }) {
  if (!pages || pages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="px-3 py-1.5 rounded border border-border text-sm text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Prev
      </button>
      <span className="text-sm text-text-muted font-mono">
        Page {page} of {pages}
      </span>
      <button
        onClick={onNext}
        disabled={page === pages}
        className="px-3 py-1.5 rounded border border-border text-sm text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  )
}
