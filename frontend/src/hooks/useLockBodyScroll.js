import { useLayoutEffect } from 'react'

/**
 * Freezes page scrolling while `locked` is true (mobile drawer, modal,
 * lightbox). Compensates for the scrollbar width so the layout does not jump.
 */
export default function useLockBodyScroll(locked = true) {
  useLayoutEffect(() => {
    if (!locked || typeof document === 'undefined') return undefined

    const { body, documentElement } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const scrollbar = window.innerWidth - documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
    }
  }, [locked])
}

export { useLockBodyScroll }
