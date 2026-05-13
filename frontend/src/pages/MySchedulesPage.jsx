import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchSchedules, createSchedule } from '../api/schedules'
import { SEMESTER_OPTIONS } from '../utils/constants'
import LoadingSpinner from '../components/LoadingSpinner'

export default function MySchedulesPage() {
  const { dbUser, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState(null)
  const [newName, setNewName] = useState('')
  const [newSemester, setNewSemester] = useState(SEMESTER_OPTIONS[0].value)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!dbUser) return
    let cancelled = false
    fetchSchedules({ user_id: dbUser.id })
      .then(data => {
        if (!cancelled) {
          const results = data.results ?? []
          if (results.length > 0) {
            navigate(`/schedules/${results[0].id}`, { replace: true })
          } else {
            setPageLoading(false)
          }
        }
      })
      .catch(err => {
        if (!cancelled) {
          setPageError(err.message || 'Failed to load schedules.')
          setPageLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [dbUser, navigate])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim() || creating) return
    setCreating(true)
    try {
      const created = await createSchedule({ user_id: dbUser.id, name: newName.trim(), semester: newSemester })
      navigate(`/schedules/${created.id}`)
    } catch {
      setCreating(false)
    }
  }

  if (authLoading || pageLoading) return <LoadingSpinner />
  if (pageError) return (
    <div className="max-w-sm mx-auto px-4 py-16 text-center">
      <p className="text-text-secondary text-sm">{pageError}</p>
    </div>
  )

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-mono text-xl font-bold text-text-primary mb-2">Create your first schedule</h1>
      <p className="text-sm text-text-muted mb-8">Give it a name and pick a semester to get started.</p>
      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <input
          autoFocus
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="e.g. Spring Plan A"
          className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-c-red transition-colors"
          required
        />
        <select
          value={newSemester}
          onChange={e => setNewSemester(e.target.value)}
          className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-c-red transition-colors"
        >
          {SEMESTER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={creating}
          className="bg-c-red text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {creating ? 'Creating…' : 'Create Schedule'}
        </button>
      </form>
    </div>
  )
}
