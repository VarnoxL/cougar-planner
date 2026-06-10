import apiFetch from './client'

export function fetchProfessors(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString()
  return apiFetch(`/api/professors${query ? `?${query}` : ''}`)
}

export function fetchProfessor(id) {
  if (id == null) throw new Error('fetchProfessor requires an id')
  return apiFetch(`/api/professors/${id}`)
}

export function fetchRmpReviews(professorId, params = {}) {
  if (professorId == null) throw new Error('fetchRmpReviews requires a professorId')
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString()
  return apiFetch(`/api/professors/${professorId}/rmp-reviews${query ? `?${query}` : ''}`)
}
