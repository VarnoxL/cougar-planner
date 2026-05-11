import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchSchedule, addSection, removeSection } from '../api/schedules'
import { fetchCourses, fetchCourse } from '../api/courses'
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

  // --- Effect: load schedule on mount ---
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
    // Short all-letter queries (e.g. "CS", "MATH") are subject codes — use exact subject match
    // to avoid false positives from names ending in "-ics" (Statistics, Economics, etc.)
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
    return SEMESTER_OPTIONS.find(o => o.value === value)?.label ?? value
  }

  function toggleCourseExpansion(courseId) {
    setExpandedCourseId(prev => (prev === courseId ? null : courseId))
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
        // Discriminate by presence of conflicts array, not by message string
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

  // --- Ordered early returns ---
  if (authLoading) return <LoadingSpinner />
  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-text-secondary text-sm mb-4">Sign in to build a schedule.</p>
      <Link to="/login" className="text-c-red text-sm hover:underline">Sign in</Link>
    </div>
  )
  if (!dbUser) return <LoadingSpinner />
  if (pageLoading) return <LoadingSpinner />
  if (pageError) return <EmptyState message={pageError} />
  if (!schedule) return <EmptyState message="Schedule not found." />

  const addedSectionIds = new Set(schedule.sections.map(s => s.id))

  return (
    <div className="max-w-screen-2xl mx-auto px-2 py-6">
      <div className="mb-4">
        <Link to="/schedules" className="text-xs text-text-muted hover:text-c-red transition-colors">
          ← My Schedules
        </Link>
      </div>

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
          {/* Header */}
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <h1 className="font-mono font-bold text-text-primary text-base">{schedule.name}</h1>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {semesterLabel(schedule.semester)} · {schedule.sections.length} section{schedule.sections.length !== 1 ? 's' : ''}
            </p>
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
    </div>
  )
}
