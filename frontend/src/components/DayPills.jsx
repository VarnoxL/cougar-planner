import { formatDay } from '../utils/formatDay'
import { DAY_ORDER } from '../utils/constants'

export default function DayPills({ schedules }) {
  const active = new Set(
    (schedules ?? []).map(s => formatDay(s.day, true)).filter(Boolean)
  )
  return (
    <span className="flex gap-1">
      {DAY_ORDER.map(abbrev => (
        <span
          key={abbrev}
          className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded-full ${
            active.has(abbrev) ? 'bg-c-red text-white' : 'bg-bg-input text-text-muted'
          }`}
        >
          {abbrev}
        </span>
      ))}
    </span>
  )
}
