import { getAuth } from 'firebase/auth'

async function apiFetch(url, options = {}) {
  const auth = getAuth()
  const user = auth.currentUser
  const token = user ? await user.getIdToken() : null

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error || `HTTP ${res.status}`)
    err.status = res.status
    err.body = body
    throw err
  }

  return res.json()
}

export default apiFetch
