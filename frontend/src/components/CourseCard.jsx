import { Link } from 'react-router-dom'

export default function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="block bg-bg-card border border-border rounded-lg p-4 hover:border-text-muted transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-text-primary leading-tight">
          {course.subject} {course.number}
        </span>
        <span className="text-xs text-text-muted shrink-0">{course.credits} cr</span>
      </div>
      <p className="text-xs text-text-muted mb-3 leading-snug line-clamp-2">{course.name}</p>
      <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
        <span>
          {course.credits} credit{course.credits !== 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  )
}
