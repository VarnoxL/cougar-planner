import apiFetch from './client'

export function fetchGradeDistributions(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString()
  return apiFetch(`/api/grade-distributions${query ? `?${query}` : ''}`)
}

export function fetchGradeDistributionSummary(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString()
  return apiFetch(`/api/grade-distributions/summary${query ? `?${query}` : ''}`)
}
