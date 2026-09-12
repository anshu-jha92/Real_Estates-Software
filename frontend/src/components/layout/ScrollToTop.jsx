import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Router side-effect, renders nothing: every navigation starts at the top of
 * the page. A hash (e.g. `/about#team`) scrolls to that section instead, which
 * the browser cannot do on its own in a client-rendered app.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior = reduced ? 'auto' : 'smooth'

    if (hash) {
      const target = document.querySelector(hash)
      if (target) {
        target.scrollIntoView({ behavior, block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}
