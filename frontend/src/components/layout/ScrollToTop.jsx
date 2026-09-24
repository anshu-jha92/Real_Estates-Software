import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * The page this component has already handled, as `pathname + hash`. Module
 * scope on purpose: the single <Suspense> in App wraps the layout as well as
 * the page, so a route whose chunk is not loaded yet unmounts this whole shell
 * and mounts it again. A ref would forget, and the visitor would be thrown to
 * the top of a page they had already scrolled.
 */
let handled = null

/**
 * Router side-effect, renders nothing: every navigation starts at the top of
 * the page. A hash (e.g. `/about#team`) scrolls to that section instead, which
 * the browser cannot do on its own in a client-rendered app. Filters and
 * paging only change the query string, so they never move the page.
 *
 * A first paint is left alone — after a reload the browser puts the visitor
 * back where they were, and that is theirs to undo, not ours.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const page = pathname + hash
    if (handled === page) return
    const firstPaint = handled === null
    handled = page

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior = reduced ? 'auto' : 'smooth'

    if (hash) {
      const target = document.querySelector(hash)
      if (target) {
        target.scrollIntoView({ behavior, block: 'start' })
        return
      }
    }

    if (firstPaint) return

    // 'instant', not 'auto': base.css sets scroll-behavior: smooth on html, and
    // 'auto' defers to it — which is why arriving on a page used to look like
    // the page sliding upwards on its own instead of simply starting at the top.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
