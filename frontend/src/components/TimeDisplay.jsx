import { formatTime } from '../utils/formatTime'

export default function TimeDisplay({ schedules }) {
  if (!schedules || schedules.length === 0) {
    return <span className="font-mono text-sm text-text-muted">TBA</span>
  }
  const { start_time, end_time } = schedules[0]
  return (
    <span className="font-mono text-sm text-text-primary">
      {formatTime(start_time)} – {formatTime(end_time)}
    </span>
  )
}
