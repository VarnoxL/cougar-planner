import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchCourse } from '../api/courses'
import { fetchGradeDistributionSummary } from '../api/gradeDistributions'
import SectionRow from '../components/SectionRow'
import GradeDistChart from '../components/GradeDistChart'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function CourseDetailPage() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      fetchCourse(id),
      fetchGradeDistributionSummary({ course_id: id }),
    ])
      .then(([courseData, summaryData]) => {
        if (!cancelled) {
          setCourse(courseData)
          setSummary(summaryData)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load course.')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [id])

  if (loading) return <LoadingSpinner />
  if (error) return <EmptyState message={error} />
  if (!course) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <header className="mb-8">
        <div className="flex items-baseline gap-3 mb-1">
          <span className="font-mono text-c-red text-sm font-bold">
            {course.subject} {course.number}
          </span>
          <span className="text-text-muted text-xs">
            {course.credits} credit{course.credits !== 1 ? 's' : ''}
          </span>
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">{course.name}</h1>
        {course.description && (
          <p className="text-sm text-text-secondary leading-relaxed">{course.description}</p>
        )}
      </header>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
          Sections
        </h2>
        <div className="border border-border rounded-lg overflow-hidden bg-bg-card">
          {course.sections.length === 0
            ? <EmptyState message="No sections available." />
            : course.sections.map((s) => <SectionRow key={s.id} section={s} />)
          }
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
          Grade Distribution
        </h2>
        <div className="bg-bg-card border border-border rounded-lg p-4">
          {summary
            ? <GradeDistChart summary={summary} />
            : <p className="text-sm text-text-muted">No grade data available.</p>
          }
        </div>
      </section>

    </div>
  )
}
