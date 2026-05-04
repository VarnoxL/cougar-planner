import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProfessor } from '../api/professors'
import { fetchReviews, deleteReview } from '../api/reviews'
import { fetchGradeDistributionSummary } from '../api/gradeDistributions'
import { useAuth } from '../contexts/AuthContext'
import ReviewCard from '../components/ReviewCard'
import GradeDistChart from '../components/GradeDistChart'
import RatingBadge from '../components/RatingBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const TABS = ['Info', 'Reviews', 'Grades']

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function ProfessorDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()

  const [professor, setProfessor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('Info')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      fetchProfessor(id),
      fetchReviews({ professor_id: id }).catch(() => ({ results: [] })),
      fetchGradeDistributionSummary({ professor_id: id }).catch(() => null),
    ])
      .then(([profData, reviewsData, summaryData]) => {
        if (!cancelled) {
          setProfessor(profData)
          setReviews(reviewsData.results ?? [])
          setSummary(summaryData)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load professor.')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [id])

  async function handleDelete(reviewId) {
    await deleteReview(reviewId)
    setReviews(prev => prev.filter(r => r.id !== reviewId))
  }

  if (loading) return <LoadingSpinner />
  if (error) return <EmptyState message={error} />
  if (!professor) return null

  const coursesTaught = (
    <div className="bg-bg-card border border-border rounded-lg p-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
        Courses Taught
      </h2>
      {professor.courses.length === 0 ? (
        <p className="text-[13px] text-text-muted">No courses on record.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {professor.courses.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="font-mono text-[11px] text-text-secondary bg-bg-input border border-border px-2 py-1 rounded-[2px] hover:border-text-muted transition-colors"
            >
              {c.subject} {c.number}
            </Link>
          ))}
        </div>
      )}
    </div>
  )

  const gradesDist = (
    <div className="bg-bg-card border border-border rounded-lg p-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
        Grade Distribution
      </h2>
      {summary
        ? <GradeDistChart summary={summary} />
        : <p className="text-[13px] text-text-muted">No grade data available.</p>
      }
    </div>
  )

  const reviewsList = (
    <div className="bg-bg-card border border-border rounded-lg px-4">
      <div className="py-3 border-b border-border">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Student Reviews
          {reviews.length > 0 && (
            <span className="ml-2 font-mono normal-case tracking-normal text-text-muted">
              — {reviews.length} total
            </span>
          )}
        </h2>
      </div>
      {reviews.length === 0 ? (
        <div className="py-6">
          <EmptyState message="No reviews yet." />
        </div>
      ) : (
        reviews.map((r) => (
          <ReviewCard
            key={r.id}
            review={r}
            onDelete={
              user && r.user?.display_name === user.displayName
                ? handleDelete
                : undefined
            }
          />
        ))
      )}
    </div>
  )

  return (
    <div className="max-w-[820px] mx-auto px-4 py-8">

      <Link
        to="/professors"
        className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-text-secondary transition-colors mb-6"
      >
        ← Professors
      </Link>

      {/* Hero card */}
      <div className="bg-bg-card border border-border rounded-lg p-5 mb-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-bg-input border border-border flex items-center justify-center shrink-0 font-mono text-lg font-bold text-c-red">
            {getInitials(professor.name)}
          </div>
          <div className="min-w-0">
            <h1 className="font-mono text-[22px] font-bold text-text-primary leading-tight mb-1">
              {professor.name}
            </h1>
            <p className="text-[13px] text-text-secondary">
              {professor.department || 'SIUE'}
              {professor.num_ratings > 0 && (
                <span className="text-text-muted">
                  {' '}· {professor.num_ratings} rating{professor.num_ratings !== 1 ? 's' : ''}
                </span>
              )}
            </p>
            {professor.rmp_id && (
              <a
                href={`https://www.ratemyprofessors.com/professor/${professor.rmp_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-c-red hover:underline mt-1 inline-block"
              >
                RateMyProfessors ↗
              </a>
            )}
          </div>
        </div>

        {/* Stat strip */}
        <div className="flex items-center gap-6 pt-4 border-t border-border">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Overall</span>
            <RatingBadge rating={professor.rating} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Difficulty</span>
            <span className="font-mono font-bold text-sm text-text-primary">
              {professor.difficulty != null ? professor.difficulty.toFixed(1) : '—'}
            </span>
          </div>
          {professor.would_take_again != null && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-text-muted uppercase tracking-wider">Again</span>
              <span className="font-mono font-bold text-sm text-text-primary">
                {professor.would_take_again.toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex md:hidden border-b border-border mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[13px] font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-c-red text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Mobile tab content */}
      <div className="md:hidden">
        {activeTab === 'Info' && coursesTaught}
        {activeTab === 'Reviews' && reviewsList}
        {activeTab === 'Grades' && gradesDist}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          {coursesTaught}
          {gradesDist}
        </div>
        {reviewsList}
      </div>

    </div>
  )
}
