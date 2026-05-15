import apiFetch from './client'

export function fetchSchedules(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString()
  return apiFetch(`/api/schedules${query ? `?${query}` : ''}`)
}

export function createSchedule(data) {
  return apiFetch('/api/schedules', { method: 'POST', body: JSON.stringify(data) })
}

export function fetchSchedule(id) {
  if (id == null) throw new Error('fetchSchedule requires an id')
  return apiFetch(`/api/schedules/${id}`)
}

export function updateSchedule(id, data) {
  if (id == null) throw new Error('updateSchedule requires an id')
  return apiFetch(`/api/schedules/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteSchedule(id) {
  if (id == null) throw new Error('deleteSchedule requires an id')
  return apiFetch(`/api/schedules/${id}`, { method: 'DELETE' })
}

export function addSection(id, sectionId) {
  if (id == null) throw new Error('addSection requires a schedule id')
  if (sectionId == null) throw new Error('addSection requires a section_id')
  return apiFetch(`/api/schedules/${id}/sections`, {
    method: 'POST',
    body: JSON.stringify({ section_id: sectionId }),
  })
}

export function removeSection(id, sectionId) {
  if (id == null) throw new Error('removeSection requires a schedule id')
  if (sectionId == null) throw new Error('removeSection requires a section_id')
  return apiFetch(`/api/schedules/${id}/sections/${sectionId}`, { method: 'DELETE' })
}

export function shareSchedule(id) {
  if (id == null) throw new Error('shareSchedule requires an id')
  return apiFetch(`/api/schedules/${id}/share`, { method: 'POST' })
}

export function fetchSharedSchedule(token) {
  if (!token) throw new Error('fetchSharedSchedule requires a token')
  return apiFetch(`/api/schedules/share/${token}`)
}
