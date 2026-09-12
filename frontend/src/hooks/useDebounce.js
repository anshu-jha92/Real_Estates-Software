import { useEffect, useState } from 'react'

/**
 * Returns `value` after it has stayed unchanged for `delay` ms.
 * Used by the property search box so we do not hit the API on every keystroke.
 */
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export { useDebounce }
