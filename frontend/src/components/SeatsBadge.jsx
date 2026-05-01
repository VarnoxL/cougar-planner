import { seatsColor } from '../utils/seatsColor'

const bgTint = {
  'text-seats-green': 'bg-seats-green/10',
  'text-seats-yellow': 'bg-seats-yellow/10',
  'text-seats-red': 'bg-seats-red/10',
}

export default function SeatsBadge({ capacity, enrolled }) {
  const open = capacity - enrolled
  const textClass = seatsColor(open, capacity)
  const bgClass = bgTint[textClass]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-sm ${bgClass} ${textClass}`}>
      {enrolled} / {capacity}
    </span>
  )
}
