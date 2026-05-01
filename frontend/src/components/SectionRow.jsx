import DayPills from './DayPills'
import TimeDisplay from './TimeDisplay'
import ProfessorBadge from './ProfessorBadge'
import SeatsBadge from './SeatsBadge'

export default function SectionRow({ section, onAdd, onRemove }) {
  const location = section.schedules[0]?.location ?? 'TBA'
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border py-3 px-4 hover:bg-bg-hover transition-colors">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 flex-1 min-w-0">
        <span className="font-mono text-xs text-text-muted">CRN {section.crn}</span>
        <span className="font-mono text-xs text-text-secondary">§{section.section_num}</span>
        <DayPills schedules={section.schedules} />
        <TimeDisplay schedules={section.schedules} />
        <span className="text-xs text-text-muted">{location}</span>
        <ProfessorBadge professor={section.professor} />
        <SeatsBadge capacity={section.capacity} enrolled={section.enrolled} />
        <span className="text-xs px-1.5 py-0.5 rounded bg-bg-input text-text-secondary">
          {section.delivery_method}
        </span>
      </div>
      {(onAdd || onRemove) && (
        <div className="flex items-center gap-2 shrink-0">
          {onAdd && (
            <button
              onClick={onAdd}
              className="bg-c-red hover:bg-c-red-hover text-white text-sm px-3 py-1 rounded transition-colors"
            >
              Add
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="border border-border text-text-secondary hover:text-c-red text-sm px-3 py-1 rounded transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}
