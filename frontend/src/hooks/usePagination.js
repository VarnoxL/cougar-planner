import { useState } from 'react'

export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage)
  function goTo(n) { setPage(n) }
  function next(totalPages) { setPage((p) => Math.min(p + 1, totalPages)) }
  function prev() { setPage((p) => Math.max(p - 1, 1)) }
  function reset() { setPage(1) }
  return { page, goTo, next, prev, reset }
}
