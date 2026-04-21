import apiFetch from './client'

export function fetchCourses(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString()
  return apiFetch(`/api/courses${query ? `?${query}` : ''}`)
}

export function fetchCourse(id) {
  return apiFetch(`/api/courses/${id}`)
}
