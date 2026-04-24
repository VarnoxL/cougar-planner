export function seatsColor(open, total) {
  const ratio = open / total
  if (ratio > 0.3) return 'text-seats-green'
  if (ratio > 0) return 'text-seats-yellow'
  return 'text-seats-red'
}
