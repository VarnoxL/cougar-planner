import { useState, useEffect } from 'react'
import { fetchCourses } from '../api/courses'
import { useDebounce } from '../hooks/useDebounce'
import { usePagination } from '../hooks/usePagination'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import CourseCard from '../components/CourseCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function CoursesPage() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const debouncedSearch = useDebounce(search, 300)
  const { page, next, prev, reset } = usePagination(1)

  useEffect(() => {
    reset()
  }, [debouncedSearch])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchCourses({
      search: debouncedSearch || undefined,
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
          setError(err.message || 'Failed to load courses.')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [debouncedSearch, page])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary mb-1">Courses</h1>
        {!loading && !error && (
          <p className="text-xs text-text-muted font-mono">{total} results</p>
        )}
      </div>

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by subject, number, or name..."
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <EmptyState message={error} />
      ) : results.length === 0 ? (
        <EmptyState message="No courses found." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((c) => (
              <CourseCard key={c.id} course={c} />
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
