import { formatTime } from '../utils/formatTime'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const GRID_START = 7
const GRID_END = 22
const TOTAL_HOURS = GRID_END - GRID_START

const COURSE_COLORS = [
  { bg: 'bg-blue-500/70',    border: 'border-blue-400' },
  { bg: 'bg-purple-500/70',  border: 'border-purple-400' },
  { bg: 'bg-emerald-600/70', border: 'border-emerald-400' },
  { bg: 'bg-amber-500/70',   border: 'border-amber-400' },
  { bg: 'bg-pink-500/70',    border: 'border-pink-400' },
  { bg: 'bg-teal-500/70',    border: 'border-teal-400' },
  { bg: 'bg-orange-500/70',  border: 'border-orange-400' },
  { bg: 'bg-cyan-500/70',    border: 'border-cyan-400' },
]

function blockStyle(start_time, end_time) {
  const toHours = t => parseInt(t.slice(0, 2)) + parseInt(t.slice(2, 4)) / 60
  const startH = toHours(start_time) - GRID_START
  const endH = toHours(end_time) - GRID_START
  return {
    top: `${(startH / TOTAL_HOURS) * 100}%`,
    height: `${((endH - startH) / TOTAL_HOURS) * 100}%`,
  }
}

function hourLabel(h) {
  if (h === 12) return '12PM'
  return h > 12 ? `${h - 12}PM` : `${h}AM`
}

export default function WeeklyCalendar({ sections }) {
  const courseColorMap = {}
  let nextColorIdx = 0
  for (const sec of sections) {
    const id = sec.course?.id
    if (id != null && !(id in courseColorMap)) {
      courseColorMap[id] = nextColorIdx % COURSE_COLORS.length
      nextColorIdx++
    }
  }

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => GRID_START + i)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[480px]">

        {/* Day header */}
        <div className="flex border-b border-border">
          <div className="w-10 shrink-0" />
          {DAY_LABELS.map(label => (
            <div key={label} className="flex-1 text-center text-xs text-text-secondary font-mono py-1">
              {label}
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div className="flex h-[600px]">

          {/* Time label column */}
          <div className="w-10 shrink-0 relative">
            {hours.map(h => (
              <div
                key={h}
                className="absolute right-1 text-[10px] text-text-muted font-mono leading-none"
                style={{ top: `${((h - GRID_START) / TOTAL_HOURS) * 100}%` }}
              >
                {hourLabel(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map(day => {
            const blocks = sections.flatMap(sec => {
              const colorIdx = courseColorMap[sec.course?.id] ?? 0
              const color = COURSE_COLORS[colorIdx]
              return (sec.schedules ?? [])
                .filter(slot => slot.day === day && slot.start_time && slot.end_time)
                .map((slot, i) => ({ key: `${sec.id}-${i}`, slot, sec, color }))
            })

            return (
              <div key={day} className="flex-1 relative border-l border-border">
                {hours.map(h => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/40"
                    style={{ top: `${((h - GRID_START) / TOTAL_HOURS) * 100}%` }}
                  />
                ))}

                {blocks.map(({ key, slot, sec, color }) => (
                  <div
                    key={key}
                    className={`absolute inset-x-0.5 rounded overflow-hidden border text-white px-1 py-0.5 ${color.bg} ${color.border}`}
                    style={blockStyle(slot.start_time, slot.end_time)}
                  >
                    <p className="text-[10px] font-mono font-bold leading-tight truncate">
                      {sec.course?.subject} {sec.course?.number}
                    </p>
                    <p className="text-[9px] leading-tight truncate opacity-90">
                      {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
                    </p>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {sections.length === 0 && (
          <p className="text-center text-xs text-text-muted pt-4">No sections added yet.</p>
        )}
      </div>
    </div>
  )
}
