export function formatTime(str) {
  if (!str) return 'TBA'
  let hours = parseInt(str.slice(0, 2))
  const minutes = str.slice(2, 4)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours}:${minutes} ${suffix}`
}
