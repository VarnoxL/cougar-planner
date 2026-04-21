import { getAuth } from 'firebase/auth'

async function apiFetch(url, options = {}) {
  const auth = getAuth()
  const user = auth.currentUser
  const token = user ? await user.getIdToken() : null

  const method = (options.method ?? 'GET').toUpperCase()
  const hasBody = !['GET', 'HEAD'].includes(method)

  const headers = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
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

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected content-type: ${contentType}`)
  }

  return res.json()
}

export default apiFetch
