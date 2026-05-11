import { useEffect } from 'react'
import { formatTime } from '../utils/formatTime'
import { formatDay } from '../utils/formatDay'

export default function ConflictModal({ conflicts, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-xl w-full max-w-md mx-4 p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-mono font-bold text-text-primary text-sm mb-2">Schedule Conflict</h2>
        <p className="text-xs text-text-secondary mb-4">
          This section overlaps with an existing section:
        </p>

        <div className="flex flex-col gap-2 mb-6">
          {conflicts.map((c, i) => (
            <div key={i} className="bg-bg-input border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-mono">
              CRN {c.conflicting_crn} — {formatDay(c.day)} {formatTime(c.existing_start)}–{formatTime(c.existing_end)} overlaps with {formatTime(c.new_start)}–{formatTime(c.new_end)}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full px-3 py-2 bg-bg-input border border-border text-text-secondary text-sm rounded-lg hover:border-text-muted transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
