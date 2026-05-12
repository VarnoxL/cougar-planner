import { Link } from 'react-router-dom'

export default function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="block bg-bg-card border border-border rounded-lg p-4 hover:border-text-muted transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-c-red text-sm">{course.subject} {course.number}</span>
        <span className="text-xs text-text-muted shrink-0">{course.credits} cr</span>
      </div>
      <h3 className="text-sm font-semibold text-text-primary mt-1 line-clamp-2">{course.name}</h3>
      {course.description && (
        <p className="text-xs text-text-secondary line-clamp-2 mt-1">{course.description}</p>
      )}
    </Link>
  )
}
