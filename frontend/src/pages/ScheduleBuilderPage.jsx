import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchSchedules, fetchSchedule, addSection, removeSection, createSchedule, updateSchedule, deleteSchedule, shareSchedule } from '../api/schedules'
import { fetchCourses, fetchCourse, fetchSemesters } from '../api/courses'
import { useDebounce } from '../hooks/useDebounce'
import { SEMESTER_OPTIONS } from '../utils/constants'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import SearchInput from '../components/SearchInput'
import SectionRow from '../components/SectionRow'
import WeeklyCalendar from '../components/WeeklyCalendar'
import ConflictModal from '../components/ConflictModal'

export default function ScheduleBuilderPage() {
  const { id: scheduleIdParam } = useParams()
  const scheduleId = Number(scheduleIdParam)
  const { user, dbUser, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // --- Core schedule state ---
  const [schedule, setSchedule] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState(null)

  // --- Search state (left panel) ---
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  // --- Expanded course detail state ---
  const [expandedCourseId, setExpandedCourseId] = useState(null)
  const [expandedCourse, setExpandedCourse] = useState(null)
  const [expandedLoading, setExpandedLoading] = useState(false)

  // --- Mutation state ---
  const [adding, setAdding] = useState(false)
  const [conflictData, setConflictData] = useState(null)
  const [duplicateFlashId, setDuplicateFlashId] = useState(null)

  // --- Switcher state ---
  const [semesterOptions, setSemesterOptions] = useState(SEMESTER_OPTIONS)
  const [allSchedules, setAllSchedules] = useState([])
  const [showSwitcher, setShowSwitcher] = useState(false)
  const switcherRef = useRef(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newSchName, setNewSchName] = useState('')
  const [newSchSemester, setNewSchSemester] = useState(SEMESTER_OPTIONS[0].value)
  const [creatingNew, setCreatingNew] = useState(false)
  const [editingName, setEditingName] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // --- Share state ---
  const [shareLabel, setShareLabel] = useState('Share')
  const [showToast, setShowToast] = useState(false)

  // --- Effect: load schedule ---
  useEffect(() => {
    if (!dbUser) return
    if (!Number.isFinite(scheduleId)) {
      setPageError('Invalid schedule ID.')
      setPageLoading(false)
      return
    }
    let cancelled = false
    setPageLoading(true)
    setPageError(null)
    fetchSchedule(scheduleId)
      .then(data => {
        if (!cancelled) {
          setSchedule(data)
          setEditingName(data.name)
          setPageLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setPageError(err.message || 'Failed to load schedule.')
          setPageLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [dbUser, scheduleId])

  // --- Effect: reset switcher UI when schedule changes ---
  useEffect(() => {
    setShowSwitcher(false)
    setShowNewForm(false)
    setConfirmDelete(false)
  }, [scheduleId])

  // --- Effect: load available semesters ---
  useEffect(() => {
    fetchSemesters()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSemesterOptions(data)
          setNewSchSemester(data[0].value)
        }
      })
      .catch(() => {})
  }, [])

  // --- Effect: load all schedules for switcher ---
  useEffect(() => {
    if (!dbUser) return
    fetchSchedules({ user_id: dbUser.id })
      .then(data => setAllSchedules(data.results ?? []))
      .catch(() => {})
  }, [dbUser])

  // --- Effect: close switcher on outside click ---
  useEffect(() => {
    function handleClick(e) {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setShowSwitcher(false)
        setShowNewForm(false)
        setConfirmDelete(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // --- Effect: debounced course search ---
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([])
      setSearching(false)
      return
    }
    let cancelled = false
    setSearching(true)
    const q = debouncedQuery.trim()
    const isSubjectCode = /^[a-zA-Z]{1,5}$/.test(q)
    const params = isSubjectCode ? { subject: q, per_page: 10 } : { search: q, per_page: 10 }
    fetchCourses(params)
      .then(data => {
        if (!cancelled) {
          setSearchResults(data.results ?? [])
          setSearching(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSearchResults([])
          setSearching(false)
        }
      })
    return () => { cancelled = true }
  }, [debouncedQuery])

  // --- Effect: load expanded course detail ---
  useEffect(() => {
    if (expandedCourseId == null) {
      setExpandedCourse(null)
      return
    }
    let cancelled = false
    setExpandedLoading(true)
    setExpandedCourse(null)
    fetchCourse(expandedCourseId)
      .then(data => {
        if (!cancelled) {
          setExpandedCourse(data)
          setExpandedLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExpandedCourse(null)
          setExpandedLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [expandedCourseId])

  // --- Helpers ---
  async function refreshSchedule() {
    try {
      const data = await fetchSchedule(scheduleId)
      setSchedule(data)
    } catch (err) {
      setPageError(err.message || 'Failed to reload schedule.')
    }
  }

  function semesterLabel(value) {
    return semesterOptions.find(o => o.value === value)?.label ?? value
  }

  function toggleCourseExpansion(courseId) {
    setExpandedCourseId(prev => (prev === courseId ? null : courseId))
  }

  async function handleShare() {
    try {
      const data = await shareSchedule(schedule.id)
      const url = `${window.location.origin}/s/${data.share_token}`
      await navigator.clipboard.writeText(url)
      setShareLabel('Copied!')
      setShowToast(true)
      setTimeout(() => { setShareLabel('Share'); setShowToast(false) }, 2000)
    } catch {
      setShareLabel('Error')
      setTimeout(() => setShareLabel('Share'), 2000)
    }
  }

  // --- Handlers ---
  async function handleAdd(sectionId) {
    if (adding) return
    setAdding(true)
    setDuplicateFlashId(null)
    try {
      await addSection(scheduleId, sectionId)
      await refreshSchedule()
    } catch (err) {
      if (err?.status === 409) {
        if (Array.isArray(err.body?.conflicts) && err.body.conflicts.length > 0) {
          setConflictData(err.body.conflicts)
        } else {
          setDuplicateFlashId(sectionId)
          setTimeout(() => {
            setDuplicateFlashId(curr => (curr === sectionId ? null : curr))
          }, 2000)
        }
      }
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(sectionId) {
    try {
      await removeSection(scheduleId, sectionId)
      await refreshSchedule()
    } catch {
      // ignore for MVP
    }
  }

  async function handleCreateNew(e) {
    e.preventDefault()
    if (!newSchName.trim() || creatingNew) return
    setCreatingNew(true)
    try {
      const created = await createSchedule({ user_id: dbUser.id, name: newSchName.trim(), semester: newSchSemester })
      navigate(`/schedules/${created.id}`)
    } catch {
      setCreatingNew(false)
    }
  }

  async function handleRename(e) {
    if (e) e.preventDefault()
    const trimmed = editingName.trim()
    if (!trimmed || trimmed === schedule?.name || renaming) return
    setRenaming(true)
    try {
      await updateSchedule(scheduleId, { name: trimmed })
      await refreshSchedule()
      setAllSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, name: trimmed } : s))
      setShowSwitcher(false)
    } catch {
      // ignore
    } finally {
      setRenaming(false)
    }
  }

  async function handleDelete() {
    if (deleting) return
    setDeleting(true)
    try {
      await deleteSchedule(scheduleId)
      const remaining = allSchedules.filter(s => s.id !== scheduleId)
      navigate(remaining.length > 0 ? `/schedules/${remaining[0].id}` : '/schedules', { replace: true })
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  // --- Early returns ---
  if (authLoading) return <LoadingSpinner />
  if (!user) return null
  if (!dbUser) return <LoadingSpinner />
  if (pageLoading) return <LoadingSpinner />
  if (pageError) return <EmptyState message={pageError} />
  if (!schedule) return <EmptyState message="Schedule not found." />

  const addedSectionIds = new Set(schedule.sections.map(s => s.id))
  const otherSchedules = allSchedules.filter(s => s.id !== scheduleId)

  return (
    <div className="max-w-screen-2xl mx-auto px-2 py-6">
      <div className="flex flex-col md:flex-row gap-4">

        {/* ============ LEFT PANEL — Course Search ============ */}
        <div className="md:w-1/3 shrink-0 bg-bg-card border border-border rounded-lg p-4">
          <h2 className="font-mono font-bold text-text-primary text-sm mb-3">Add Courses</h2>

          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search courses (e.g., CS 150)..."
          />

          <div className="mt-4">
            {searching && <LoadingSpinner />}

            {!searching && debouncedQuery.trim() && searchResults.length === 0 && (
              <EmptyState message="No courses match that search." />
            )}

            {!searching && !debouncedQuery.trim() && (
              <p className="py-8 text-center text-xs text-text-muted">
                Start typing to find courses.
              </p>
            )}

            <div className="flex flex-col gap-2">
              {searchResults.map(course => {
                const isExpanded = expandedCourseId === course.id
                return (
                  <div key={course.id} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCourseExpansion(course.id)}
                      className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-bg-input hover:bg-bg-hover transition-colors text-left"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono font-bold text-sm text-text-primary">
                          {course.subject} {course.number}
                        </span>
                        <span className="text-xs text-text-secondary truncate">
                          {course.name}
                        </span>
                      </div>
                      <span className="text-text-muted text-xs shrink-0">
                        {isExpanded ? '▾' : '▸'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="bg-bg-card">
                        {expandedLoading && <LoadingSpinner />}
                        {!expandedLoading && expandedCourse && expandedCourse.id === course.id && (
                          <>
                            {expandedCourse.sections.length === 0 ? (
                              <EmptyState message="No sections offered." />
                            ) : (
                              expandedCourse.sections.map(section => {
                                const alreadyAdded = addedSectionIds.has(section.id)
                                const showFlash = duplicateFlashId === section.id
                                return (
                                  <div key={section.id}>
                                    <SectionRow
                                      section={section}
                                      onAdd={alreadyAdded || adding ? undefined : () => handleAdd(section.id)}
                                    />
                                    {(alreadyAdded || showFlash) && (
                                      <p className="px-4 pb-2 -mt-1 text-[11px] font-mono text-text-muted">
                                        {showFlash ? 'Already added' : 'In schedule'}
                                      </p>
                                    )}
                                  </div>
                                )
                              })
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ============ RIGHT PANEL — Schedule View ============ */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Header with schedule switcher */}
          <div ref={switcherRef} className="bg-bg-card border border-border rounded-lg p-4 relative">
            <button
              onClick={() => {
                setShowSwitcher(v => !v)
                setShowNewForm(false)
                setEditingName(schedule.name)
                setConfirmDelete(false)
              }}
              className="flex items-center gap-1.5 font-mono font-bold text-text-primary text-base hover:text-c-red transition-colors"
            >
              {schedule.name}
              <span className="text-text-muted text-xs">{showSwitcher ? '▴' : '▾'}</span>
            </button>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {semesterLabel(schedule.semester)} · {schedule.sections.length} section{schedule.sections.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleShare}
              className="mt-2 text-xs text-text-secondary border border-border rounded px-2 py-1 hover:border-text-muted transition-colors"
            >
              {shareLabel}
            </button>

            {showSwitcher && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-bg-card border border-border rounded-lg shadow-xl z-20 overflow-hidden">

                {/* Switch to another schedule */}
                {otherSchedules.length > 0 && (
                  <div className="py-1 border-b border-border">
                    {otherSchedules.map(s => (
                      <button key={s.id}
                        onClick={() => { setShowSwitcher(false); navigate(`/schedules/${s.id}`) }}
                        className="w-full text-left px-4 py-2.5 hover:bg-bg-hover transition-colors">
                        <span className="font-mono text-sm text-text-primary block">{s.name}</span>
                        <span className="text-xs text-text-muted">{semesterLabel(s.semester)}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* New schedule */}
                <div className="border-b border-border">
                  {showNewForm ? (
                    <form onSubmit={handleCreateNew} className="p-3 flex flex-col gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={newSchName}
                        onChange={e => setNewSchName(e.target.value)}
                        placeholder="Schedule name…"
                        className="bg-bg-input border border-border rounded px-2 py-1.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-c-red"
                      />
                      <select
                        value={newSchSemester}
                        onChange={e => setNewSchSemester(e.target.value)}
                        className="bg-bg-input border border-border rounded px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-c-red"
                      >
                        {semesterOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button type="submit" disabled={creatingNew}
                          className="flex-1 bg-c-red text-white text-xs py-1.5 rounded hover:opacity-90 disabled:opacity-50">
                          {creatingNew ? 'Creating…' : 'Create'}
                        </button>
                        <button type="button" onClick={() => setShowNewForm(false)}
                          className="flex-1 bg-bg-input border border-border text-text-secondary text-xs py-1.5 rounded hover:border-text-muted transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => { setShowNewForm(true); setConfirmDelete(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-c-red hover:bg-bg-hover transition-colors">
                      + New Schedule
                    </button>
                  )}
                </div>

                {/* Rename / Delete */}
                <div className="py-1">
                  {confirmDelete ? (
                    <div className="px-4 py-2.5 flex items-center gap-3 text-xs">
                      <span className="text-text-secondary">Delete this schedule?</span>
                      <button onClick={handleDelete} disabled={deleting}
                        className="text-rating-red hover:underline disabled:opacity-50">
                        {deleting ? 'Deleting…' : 'Yes, delete'}
                      </button>
                      <button onClick={() => setConfirmDelete(false)}
                        className="text-text-secondary hover:underline">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <form onSubmit={handleRename} className="flex-1 flex items-center gap-1.5 px-3 py-1.5">
                        <input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          className="flex-1 bg-bg-input border border-border rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-c-red min-w-0"
                          placeholder="Rename…"
                        />
                        <button type="submit"
                          disabled={renaming || !editingName.trim() || editingName.trim() === schedule.name}
                          className="text-xs text-c-red hover:underline disabled:opacity-30 disabled:no-underline whitespace-nowrap">
                          {renaming ? '…' : 'Save'}
                        </button>
                      </form>
                      <button
                        onClick={() => { setConfirmDelete(true); setShowNewForm(false) }}
                        className="pr-4 py-1.5 text-xs text-text-muted hover:text-rating-red transition-colors shrink-0">
                        Delete
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <WeeklyCalendar sections={schedule.sections} />
          </div>

          {/* Sections in schedule */}
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <h2 className="font-mono font-bold text-text-primary text-sm mb-2">Your Sections</h2>
            {schedule.sections.length === 0 ? (
              <EmptyState message="No sections yet. Search a course on the left to add one." />
            ) : (
              <div className="flex flex-col">
                {schedule.sections.map(section => (
                  <SectionRow
                    key={section.id}
                    section={section}
                    onRemove={() => handleRemove(section.id)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {conflictData && (
        <ConflictModal
          conflicts={conflictData}
          onClose={() => setConflictData(null)}
        />
      )}

      <div
        style={{ transition: 'opacity 0.2s, transform 0.2s' }}
        className={`fixed bottom-6 right-6 z-50 bg-bg-card border border-border rounded-lg px-4 py-3 shadow-xl flex items-center gap-2 text-sm font-mono text-text-primary pointer-events-none ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        <span className="text-green-400">✓</span> Link copied to clipboard
      </div>
    </div>
  )
}
