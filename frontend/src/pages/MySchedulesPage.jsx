import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchSchedules, createSchedule, updateSchedule, deleteSchedule } from '../api/schedules'
import { SEMESTER_OPTIONS } from '../utils/constants'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function MySchedulesPage() {
  const { user, dbUser, loading: authLoading } = useAuth()

  const [schedules, setSchedules] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState(null)

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSemester, setNewSemester] = useState(SEMESTER_OPTIONS[0].value)
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [renaming, setRenaming] = useState(false)

  const [deletingId, setDeletingId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!dbUser) return
    let cancelled = false
    setPageLoading(true)
    setPageError(null)
    fetchSchedules({ user_id: dbUser.id })
      .then(data => {
        if (!cancelled) {
          setSchedules(data.results ?? [])
          setPageLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setPageError(err.message || 'Failed to load schedules.')
          setPageLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [dbUser])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const created = await createSchedule({ user_id: dbUser.id, name: newName.trim(), semester: newSemester })
      setSchedules(prev => [created, ...prev])
      setShowCreate(false)
      setNewName('')
      setNewSemester(SEMESTER_OPTIONS[0].value)
    } catch {
      // ignore for MVP
    } finally {
      setCreating(false)
    }
  }

  function startEdit(s) {
    setEditingId(s.id)
    setEditingName(s.name)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingName('')
  }

  async function commitEdit() {
    if (renaming) return
    const trimmed = editingName.trim()
    const original = schedules.find(s => s.id === editingId)?.name
    if (!trimmed || trimmed === original) { cancelEdit(); return }
    setRenaming(true)
    try {
      await updateSchedule(editingId, { name: trimmed })
      setSchedules(prev => prev.map(s => s.id === editingId ? { ...s, name: trimmed } : s))
      setEditingId(null)
    } catch {
      cancelEdit()
    } finally {
      setRenaming(false)
    }
  }

  async function handleDelete(id) {
    setDeleting(true)
    try {
      await deleteSchedule(id)
      setSchedules(prev => prev.filter(s => s.id !== id))
      setDeletingId(null)
    } catch {
      // ignore for MVP
    } finally {
      setDeleting(false)
    }
  }

  function semesterLabel(value) {
    return SEMESTER_OPTIONS.find(o => o.value === value)?.label ?? value
  }

  if (authLoading) return <LoadingSpinner />
  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-text-secondary text-sm mb-4">Sign in to view your schedules.</p>
      <Link to="/login" className="text-c-red text-sm hover:underline">Sign in</Link>
    </div>
  )
  if (!dbUser) return <LoadingSpinner />
  if (pageLoading) return <LoadingSpinner />
  if (pageError) return <EmptyState message={pageError} />

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-text-primary">My Schedules</h1>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="px-3 py-1.5 bg-c-red text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
        >
          + New Schedule
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-bg-card border border-border rounded-lg p-4 mb-4 flex flex-col sm:flex-row gap-3"
        >
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Schedule name..."
            className="flex-1 bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-c-red transition-colors"
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
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="px-3 py-2 bg-c-red text-white text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setNewName('') }}
              className="px-3 py-2 bg-bg-input border border-border text-text-secondary text-sm rounded-lg hover:border-text-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {schedules.length === 0 ? (
        <EmptyState message="No schedules yet. Create one to get started." />
      ) : (
        <div className="flex flex-col gap-3">
          {schedules.map(s => (
            <div key={s.id} className="bg-bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                {editingId === s.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="flex-1 bg-bg-input border border-border rounded px-2 py-1 text-sm font-mono font-bold text-text-primary focus:outline-none focus:border-c-red transition-colors"
                  />
                ) : (
                  <button
                    onClick={() => startEdit(s)}
                    className="font-mono font-bold text-text-primary text-sm hover:text-c-red transition-colors text-left"
                    title="Click to rename"
                  >
                    {s.name}
                  </button>
                )}
              </div>

              <p className="text-xs text-text-muted font-mono mb-3">
                {semesterLabel(s.semester)} · {s.section_count} section{s.section_count !== 1 ? 's' : ''} · {new Date(s.created_at).toLocaleDateString()}
              </p>

              <div className="flex items-center gap-3">
                <Link
                  to={`/schedules/${s.id}`}
                  className="px-3 py-1.5 bg-c-red text-white text-xs rounded-lg hover:opacity-90 transition-opacity"
                >
                  Open
                </Link>
                {deletingId === s.id ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-text-secondary">Sure?</span>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deleting}
                      className="text-rating-red hover:underline disabled:opacity-50"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-text-secondary hover:underline"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(s.id)}
                    className="text-xs text-text-muted hover:text-rating-red transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
