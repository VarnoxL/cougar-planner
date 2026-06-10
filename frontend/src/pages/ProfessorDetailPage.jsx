import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProfessor, fetchRmpReviews } from '../api/professors'
import { fetchReviews, deleteReview } from '../api/reviews'
import { fetchGradeDistributionSummary } from '../api/gradeDistributions'
import { useAuth } from '../contexts/AuthContext'
import ReviewCard from '../components/ReviewCard'
import RmpReviewCard from '../components/RmpReviewCard'
import ReviewForm from '../components/ReviewForm'
import GradeDistChart from '../components/GradeDistChart'
import RatingBadge from '../components/RatingBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const TABS = ['Info', 'Grades']

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function ProfessorDetailPage() {
  const { id } = useParams()
  const { user, dbUser } = useAuth()

  const [professor, setProfessor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [rmpReviews, setRmpReviews] = useState([])
  const [rmpPage, setRmpPage] = useState(1)
  const [rmpPages, setRmpPages] = useState(0)
  const [rmpTotal, setRmpTotal] = useState(0)
  const [rmpLoading, setRmpLoading] = useState(false)
  const [rmpError, setRmpError] = useState(null)
  const [rmpFetchError, setRmpFetchError] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('Info')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setRmpFetchError(null)

    fetchProfessor(id)
      .then(async (profData) => {
        if (cancelled) return
        setProfessor(profData)

        const [reviewsData, rmpData, summaryData] = await Promise.all([
          fetchReviews({ professor_id: id }).catch(() => ({ results: [] })),
          fetchRmpReviews(id).catch((err) => {
            if (!cancelled) {
              const msg = err.status === 404
                ? 'RateMyProfessors reviews are not available yet. Restart the backend or redeploy the API.'
                : (err.message || 'Failed to load RateMyProfessors reviews.')
              setRmpFetchError(msg)
            }
            return { results: [], page: 1, pages: 0, total: 0 }
          }),
          fetchGradeDistributionSummary({ professor_id: id }).catch(() => null),
        ])

        if (cancelled) return
        setReviews(reviewsData.results ?? [])
        setRmpReviews(rmpData.results ?? [])
        setRmpPage(rmpData.page ?? 1)
        setRmpPages(rmpData.pages ?? 0)
        setRmpTotal(rmpData.total ?? 0)
        setSummary(summaryData)
        setLoading(false)
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

  async function loadMoreRmpReviews() {
    if (rmpPage >= rmpPages || rmpLoading) return
    setRmpLoading(true)
    setRmpError(null)
    try {
      const data = await fetchRmpReviews(id, { page: rmpPage + 1 })
      setRmpReviews(prev => [...prev, ...(data.results ?? [])])
      setRmpPage(data.page ?? rmpPage + 1)
      setRmpPages(data.pages ?? rmpPages)
      setRmpTotal(data.total ?? rmpTotal)
    } catch (err) {
      setRmpError(err.message || 'Failed to load more RateMyProfessors reviews.')
    } finally {
      setRmpLoading(false)
    }
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

  const cougarReviewsList = (
    <div className="bg-bg-card border border-border rounded-lg px-4">
      <div className="py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            Cougar Planner Reviews
            {reviews.length > 0 && (
              <span className="ml-2 font-mono normal-case tracking-normal text-text-muted">
                — {reviews.length} total
              </span>
            )}
          </h2>
          <p className="text-[11px] text-text-muted mt-1">
            Reviews submitted by SIUE students on this site.
          </p>
        </div>
        {user ? (
          <button
            onClick={() => setShowForm(true)}
            className="text-[11px] font-semibold bg-c-red text-white px-3 py-1 rounded-lg hover:bg-c-red-hover transition-colors shrink-0"
          >
            Write a Review
          </button>
        ) : (
          <Link
            to="/login"
            className="text-[11px] text-text-muted hover:text-text-secondary transition-colors shrink-0"
          >
            Sign in to review
          </Link>
        )}
      </div>
      {reviews.length === 0 ? (
        <div className="py-6">
          <EmptyState message="No Cougar Planner reviews yet." />
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

  const rmpProfileUrl = professor.rmp_legacy_id
    ? `https://www.ratemyprofessors.com/professor/${professor.rmp_legacy_id}`
    : null

  const rmpReviewsList = (
    <div className="bg-bg-card border border-border rounded-lg px-4">
      <div className="py-3 border-b border-border">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          RateMyProfessors Reviews
          {rmpTotal > 0 && (
            <span className="ml-2 font-mono normal-case tracking-normal text-text-muted">
              — {rmpTotal} total
            </span>
          )}
        </h2>
        <p className="text-[11px] text-text-muted mt-1">
          Imported from RateMyProfessors — not submitted on Cougar Planner.
          {rmpProfileUrl && (
            <>
              {' '}
              <a
                href={rmpProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-c-red hover:underline"
              >
                View on RMP ↗
              </a>
            </>
          )}
        </p>
      </div>
      {!professor.rmp_legacy_id ? (
        <div className="py-6">
          <EmptyState message="This professor is not linked to a RateMyProfessors profile." />
        </div>
      ) : rmpFetchError ? (
        <div className="py-6">
          <EmptyState message={rmpFetchError} />
        </div>
      ) : rmpReviews.length === 0 ? (
        <div className="py-6">
          <EmptyState message="No RateMyProfessors reviews found." />
        </div>
      ) : (
        <>
          {rmpReviews.map((r) => (
            <RmpReviewCard key={r.id} review={r} />
          ))}
          {rmpPage < rmpPages && (
            <div className="py-4 flex flex-col items-center gap-2">
              {rmpError && (
                <p className="text-[11px] text-c-red">{rmpError}</p>
              )}
              <button
                onClick={loadMoreRmpReviews}
                disabled={rmpLoading}
                className="text-[11px] font-semibold text-text-secondary border border-border px-3 py-1 rounded-lg hover:border-text-muted transition-colors disabled:opacity-50"
              >
                {rmpLoading ? 'Loading…' : 'Load more from RMP'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )

  const reviewsList = (
    <div className="flex flex-col gap-4">
      {rmpReviewsList}
      {cougarReviewsList}
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
              {(professor.rmp_num_ratings ?? professor.num_ratings) > 0 && (
                <span className="text-text-muted">
                  {' '}· {professor.rmp_num_ratings ?? professor.num_ratings} RMP rating{(professor.rmp_num_ratings ?? professor.num_ratings) !== 1 ? 's' : ''}
                </span>
              )}
            </p>
            {rmpProfileUrl && (
              <a
                href={rmpProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-c-red hover:underline mt-1 inline-block"
              >
                RateMyProfessors ↗
              </a>
            )}
          </div>
        </div>

        {/* Stat strip — RMP aggregates; Cougar Planner rating reserved for SIUE-only reviews */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3">
          RateMyProfessors
        </p>
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Overall</span>
            <RatingBadge rating={professor.rmp_rating ?? professor.rating} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Difficulty</span>
            <span className="font-mono font-bold text-sm text-text-primary">
              {(professor.rmp_difficulty ?? professor.difficulty) != null
                ? (professor.rmp_difficulty ?? professor.difficulty).toFixed(1)
                : '—'}
            </span>
          </div>
          {(professor.rmp_would_take_again ?? professor.would_take_again) != null && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-text-muted uppercase tracking-wider">Again</span>
              <span className="font-mono font-bold text-sm text-text-primary">
                {(professor.rmp_would_take_again ?? professor.would_take_again).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
        {professor.cougar_rating == null && (
          <p className="text-[11px] text-text-muted mt-3 pt-3 border-t border-border">
            Cougar Planner rating — coming soon (SIUE student reviews only).
          </p>
        )}
      </div>

      {/* Reviews — always visible below hero */}
      <div className="mb-5">
        {reviewsList}
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
        {activeTab === 'Grades' && gradesDist}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-4">
        {coursesTaught}
        {gradesDist}
      </div>

      {showForm && dbUser && (
        <ReviewForm
          professorId={Number(id)}
          courses={professor.courses}
          dbUserId={dbUser.id}
          onClose={() => setShowForm(false)}
          onSuccess={(r) => {
            setReviews((prev) => [r, ...prev])
            setShowForm(false)
          }}
        />
      )}

    </div>
  )
}
