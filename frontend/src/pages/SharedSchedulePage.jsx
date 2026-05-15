import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchSharedSchedule } from '../api/schedules'
import WeeklyCalendar from '../components/WeeklyCalendar'
import EmptyState from '../components/EmptyState'

const SEMESTER_LABELS = {
  '202510': 'Spring 2025',
  '202520': 'Summer 2025',
  '202530': 'Fall 2025',
  '202610': 'Spring 2026',
  '202620': 'Summer 2026',
  '202630': 'Fall 2026',
}

export default function SharedSchedulePage() {
  const { token } = useParams()
  const [schedule, setSchedule] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSharedSchedule(token)
      .then(setSchedule)
      .catch(() => setError('Schedule not found.'))
  }, [token])

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState message={error} />
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState message="Loading…" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-mono font-bold text-xl text-text-primary">{schedule.name}</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {SEMESTER_LABELS[schedule.semester] ?? schedule.semester} · {schedule.sections.length} section{schedule.sections.length !== 1 ? 's' : ''}
        </p>
      </div>
      <WeeklyCalendar sections={schedule.sections} />
    </div>
  )
}
