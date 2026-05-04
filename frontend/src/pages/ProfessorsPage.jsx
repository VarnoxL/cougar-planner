import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProfessors } from '../api/professors'
import { useDebounce } from '../hooks/useDebounce'
import { usePagination } from '../hooks/usePagination'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import RatingBadge from '../components/RatingBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const MIN_RATING_OPTIONS = [
  { label: 'Any rating', value: '' },
  { label: '3.0+',       value: '3.0' },
  { label: '3.5+',       value: '3.5' },
  { label: '4.0+',       value: '4.0' },
  { label: '4.5+',       value: '4.5' },
]

function ProfessorCard({ professor }) {
  return (
    <Link
      to={`/professors/${professor.id}`}
      className="block bg-bg-card border border-border rounded-lg p-4 hover:border-text-muted transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-text-primary leading-tight">{professor.name}</span>
        <RatingBadge rating={professor.rating} />
      </div>
      <p className="text-xs text-text-muted mb-3 leading-snug">{professor.department || '—'}</p>
      <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
        <span title="Difficulty">
          Diff {professor.difficulty != null ? professor.difficulty.toFixed(1) : '—'}
        </span>
        {professor.would_take_again != null && (
          <span title="Would take again">{professor.would_take_again.toFixed(0)}% again</span>
        )}
        <span className="ml-auto text-text-muted">
          {professor.num_ratings} rating{professor.num_ratings !== 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  )
}

export default function ProfessorsPage() {
  const [search, setSearch] = useState('')
  const [minRating, setMinRating] = useState('')
  const [results, setResults] = useState([])
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const debouncedSearch = useDebounce(search, 300)
  const { page, next, prev, reset } = usePagination(1)

  useEffect(() => {
    reset()
  }, [debouncedSearch, minRating])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchProfessors({
      name: debouncedSearch || undefined,
      min_rating: minRating || undefined,
      page,
      per_page: 20,
    })
      .then((data) => {
        if (!cancelled) {
          setResults(data.results)
          setPages(data.pages)
          setTotal(data.total)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load professors.')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [debouncedSearch, minRating, page])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary mb-1">Professors</h1>
        {!loading && !error && (
          <p className="text-xs text-text-muted font-mono">
            {total} professor{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name..."
          />
        </div>
        <select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-c-red transition-colors"
        >
          {MIN_RATING_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <EmptyState message={error} />
      ) : results.length === 0 ? (
        <EmptyState message="No professors found." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((p) => (
              <ProfessorCard key={p.id} professor={p} />
            ))}
          </div>
          <Pagination
            page={page}
            pages={pages}
            onPrev={prev}
            onNext={() => next(pages)}
          />
        </>
      )}

    </div>
  )
}
