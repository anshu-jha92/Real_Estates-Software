import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic data hook.
 *
 *   const { data, loading, error, refetch } = useFetch(
 *     (signal) => api.properties({ page }, { signal }),
 *     [page]
 *   )
 *
 * `fetcher` receives an AbortSignal. The request is aborted on unmount and
 * whenever the deps change, so a slow response can never overwrite a newer one.
 */
export default function useFetch(fetcher, deps = [], { skip = false, initialData = null } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (skip) {
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()
    let cancelled = false

    setLoading(true)
    setError(null)

    Promise.resolve()
      .then(() => fetcherRef.current(controller.signal))
      .then((result) => {
        if (cancelled || !mountedRef.current) return
        setData(result)
        setError(null)
      })
      .catch((err) => {
        if (cancelled || controller.signal.aborted || err?.name === 'AbortError') return
        if (!mountedRef.current) return
        setError(err)
      })
      .finally(() => {
        if (cancelled || !mountedRef.current) return
        setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, tick, ...deps])

  const refetch = useCallback(() => setTick((n) => n + 1), [])

  return { data, loading, error, refetch, setData }
}

export { useFetch }
