import { useState, useEffect } from 'react'

const GRADES = [
  { label: 'A', pctKey: 'a_pct', color: 'bg-rating-green'  },
  { label: 'B', pctKey: 'b_pct', color: 'bg-green-300'     },
  { label: 'C', pctKey: 'c_pct', color: 'bg-rating-yellow' },
  { label: 'D', pctKey: 'd_pct', color: 'bg-orange-500'    },
  { label: 'F', pctKey: 'f_pct', color: 'bg-rating-red'    },
  { label: 'W', pctKey: 'w_pct', color: 'bg-text-muted'    },
]

export default function GradeDistChart({ summary }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (summary && !summary.insufficient_data) {
      const id = requestAnimationFrame(() => setReady(true))
      return () => cancelAnimationFrame(id)
    }
  }, [summary])

  if (!summary) return null

  if (summary.insufficient_data) {
    return <p className="text-[11px] font-mono text-text-muted py-1">{summary.message}</p>
  }

  return (
    <div>
      <div className="flex flex-col gap-[7px]">
        {GRADES.map(({ label, pctKey, color }) => {
          const pct = summary[pctKey] ?? 0
          return (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-text-muted w-3 shrink-0">{label}</span>
              <div className="flex-1 h-2 rounded bg-bg-input relative overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded ${color} transition-[width] duration-[400ms] ease-in-out`}
                  style={{ width: ready ? `${pct}%` : '0%' }}
                />
              </div>
              <span className="text-[11px] font-mono text-text-secondary w-9 text-right shrink-0">
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-[11px] font-mono text-text-muted mt-2">
        {summary.total_students} students · {summary.semesters_included.length} semester{summary.semesters_included.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
