export function ratingColor(val) {
  if (val == null) return 'text-text-muted'
  if (val >= 4) return 'text-rating-green'
  if (val >= 3) return 'text-rating-yellow'
  return 'text-rating-red'
}
