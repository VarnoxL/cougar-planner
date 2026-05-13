import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchCourses, fetchCourse } from '../api/courses'
import { useDebounce } from '../hooks/useDebounce'
import { SEMESTER_OPTIONS } from '../utils/constants'
import { loadGuestSchedule, saveGuestSchedule, detectConflicts, isDuplicate } from '../utils/guestSchedule'
import SearchInput from '../components/SearchInput'
import SectionRow from '../components/SectionRow'
import WeeklyCalendar from '../components/WeeklyCalendar'
import ConflictModal from '../components/ConflictModal'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function GuestScheduleBuilderPage() {
  const [semester, setSemester] = useState(SEMESTER_OPTIONS[0].value)
  const [sections, setSections] = useState([])

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const [expandedCourseId, setExpandedCourseId] = useState(null)
  const [expandedCourse, setExpandedCourse] = useState(null)
  const [expandedLoading, setExpandedLoading] = useState(false)

  const [conflictData, setConflictData] = useState(null)
  const [duplicateFlashId, setDuplicateFlashId] = useState(null)
  const [pendingSemester, setPendingSemester] = useState(null)

  useEffect(() => {
    const saved = loadGuestSchedule()
    setSemester(saved.semester)
    setSections(saved.sections)
  }, [])

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

  function semesterLabel(value) {
    return SEMESTER_OPTIONS.find(o => o.value === value)?.label ?? value
  }

  function toggleCourseExpansion(courseId) {
    setExpandedCourseId(prev => (prev === courseId ? null : courseId))
  }

  function handleSemesterChange(newValue) {
    if (newValue === semester) return
    if (sections.length === 0) {
      setSemester(newValue)
      saveGuestSchedule({ semester: newValue, sections: [] })
    } else {
      setPendingSemester(newValue)
    }
  }

  function confirmSemesterChange() {
    const updated = { semester: pendingSemester, sections: [] }
    setSemester(pendingSemester)
    setSections([])
    saveGuestSchedule(updated)
    setPendingSemester(null)
    setExpandedCourseId(null)
    setSearchResults([])
    setSearchQuery('')
  }

  function handleAdd(section) {
    if (isDuplicate(sections, section.id)) {
      setDuplicateFlashId(section.id)
      setTimeout(() => {
        setDuplicateFlashId(curr => (curr === section.id ? null : curr))
      }, 2000)
      return
    }
    const conflicts = detectConflicts(sections, section)
    if (conflicts.length > 0) {
      setConflictData(conflicts)
      return
    }
    const updated = { semester, sections: [...sections, section] }
    setSections(updated.sections)
    saveGuestSchedule(updated)
  }

  function handleRemove(sectionId) {
    const updated = { semester, sections: sections.filter(s => s.id !== sectionId) }
    setSections(updated.sections)
    saveGuestSchedule(updated)
  }

  const addedSectionIds = new Set(sections.map(s => s.id))
  const semesterSections = expandedCourse
    ? expandedCourse.sections.filter(s => s.semester === semester)
    : []

  return (
    <>
      <div className="bg-bg-card border-b border-border px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-text-secondary">
          <span className="font-mono text-c-red font-bold">Guest mode</span>
          {' '}— Your schedule is saved in this browser only.
        </p>
        <Link to="/register" className="text-sm font-medium text-c-red hover:underline shrink-0">
          Sign up to save permanently →
        </Link>
      </div>

      <div className="max-w-screen-2xl mx-auto px-2 py-6">
        <div className="flex flex-col md:flex-row gap-4">

          {/* LEFT PANEL — Course Search */}
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
                          <span className="text-xs text-text-secondary truncate">{course.name}</span>
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
                              {semesterSections.length === 0 ? (
                                <EmptyState message="No sections offered this semester." />
                              ) : (
                                semesterSections.map(section => {
                                  const alreadyAdded = addedSectionIds.has(section.id)
                                  const showFlash = duplicateFlashId === section.id
                                  return (
                                    <div key={section.id}>
                                      <SectionRow
                                        section={section}
                                        onAdd={alreadyAdded ? undefined : () => handleAdd(section)}
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

          {/* RIGHT PANEL — Schedule View */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Header */}
            <div className="bg-bg-card border border-border rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-mono font-bold text-text-primary text-base">Guest Schedule</p>
                <p className="text-xs text-text-muted font-mono mt-0.5">
                  {semesterLabel(semester)} · {sections.length} section{sections.length !== 1 ? 's' : ''}
                </p>
              </div>
              <select
                value={semester}
                onChange={e => handleSemesterChange(e.target.value)}
                className="bg-bg-input border border-border rounded px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-c-red"
              >
                {SEMESTER_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Calendar */}
            <div className="bg-bg-card border border-border rounded-lg p-4">
              <WeeklyCalendar sections={sections} />
            </div>

            {/* Sections list */}
            <div className="bg-bg-card border border-border rounded-lg p-4">
              <h2 className="font-mono font-bold text-text-primary text-sm mb-2">Your Sections</h2>
              {sections.length === 0 ? (
                <EmptyState message="No sections yet. Search a course on the left to add one." />
              ) : (
                <div className="flex flex-col">
                  {sections.map(section => (
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
      </div>

      {conflictData && (
        <ConflictModal
          conflicts={conflictData}
          onClose={() => setConflictData(null)}
        />
      )}

      {pendingSemester && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setPendingSemester(null)}
        >
          <div
            className="bg-bg-card border border-border rounded-xl w-full max-w-sm mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-mono font-bold text-text-primary text-sm mb-2">Change Semester?</h2>
            <p className="text-xs text-text-secondary mb-4">
              Switching to {semesterLabel(pendingSemester)} will clear all {sections.length} section{sections.length !== 1 ? 's' : ''} from your guest schedule.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmSemesterChange}
                className="flex-1 bg-c-red text-white text-xs py-1.5 rounded hover:opacity-90"
              >
                Yes, switch
              </button>
              <button
                onClick={() => setPendingSemester(null)}
                className="flex-1 bg-bg-input border border-border text-text-secondary text-xs py-1.5 rounded hover:border-text-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
