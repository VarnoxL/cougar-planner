import apiFetch from './client'

export function fetchReviews(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString()
  return apiFetch(`/api/reviews${query ? `?${query}` : ''}`)
}

export function createReview(data) {
  return apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify(data) })
}

export function deleteReview(id) {
  if (id == null) throw new Error('deleteReview requires an id')
  return apiFetch(`/api/reviews/${id}`, { method: 'DELETE' })
}
