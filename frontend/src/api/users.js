import apiFetch from './client'

export function syncUser() {
  return apiFetch('/api/users', { method: 'POST' })
}

export function fetchUser(id) {
  if (id == null) throw new Error('fetchUser requires an id')
  return apiFetch(`/api/users/${id}`)
}

export function updateUser(id, data) {
  if (id == null) throw new Error('updateUser requires an id')
  return apiFetch(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}
