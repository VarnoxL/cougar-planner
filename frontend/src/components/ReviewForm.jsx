import { useState, useEffect } from 'react'
import { createReview } from '../api/reviews'

const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W']

function RatingButtons({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          className={`w-8 h-8 text-[13px] font-mono border rounded transition-colors ${
            value === n
              ? 'bg-c-red text-white border-c-red'
              : 'bg-bg-input border-border text-text-secondary hover:border-text-muted'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

export default function ReviewForm({ professorId, courses, dbUserId, onClose, onSuccess }) {
  const [courseId, setCourseId] = useState('')
  const [rating, setRating] = useState(null)
  const [difficulty, setDifficulty] = useState(null)
  const [grade, setGrade] = useState('')
  const [semester, setSemester] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const body = {
        user_id: dbUserId,
        professor_id: professorId,
        course_id: Number(courseId),
        ...(rating != null && { rating }),
        ...(difficulty != null && { difficulty }),
        ...(grade && { grade_received: grade }),
        ...(semester.trim() && { semester_taken: semester.trim() }),
        ...(comment.trim() && { comment: comment.trim() }),
      }
      const newReview = await createReview(body)
      onSuccess(newReview)
    } catch (err) {
      setError(err.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-c-red'
  const labelClass = 'block text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-1.5'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-lg w-full max-w-md mx-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-[15px] font-bold text-text-primary">Write a Review</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Course *</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.subject} {c.number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Rating</label>
            <RatingButtons value={rating} onChange={setRating} />
          </div>

          <div>
            <label className={labelClass}>Difficulty</label>
            <RatingButtons value={difficulty} onChange={setDifficulty} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Grade Received</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={inputClass}
              >
                <option value="">—</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Semester Taken</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. Fall 2024"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience…"
              maxLength={2000}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <p className="text-[12px] text-rating-red">{error}</p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-text-muted hover:text-text-secondary border border-border rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !courseId}
              className="px-4 py-2 text-[13px] font-semibold bg-c-red text-white rounded-lg hover:bg-c-red-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
