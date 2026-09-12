import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const easeOut = (t) => 1 - (1 - t) ** 3

/**
 * Counts from 0 to `end` with requestAnimationFrame, starting only when the
 * element scrolls into view. Runs once.
 *
 *   const { ref, value } = useCountUp(1200)
 *   <span ref={ref}>{value}</span>
 */
export default function useCountUp(end = 0, { duration = 1800, decimals = 0, start = 0 } = {}) {
  const target = Number(end) || 0
  const [value, setValue] = useState(start)
  const ref = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const el = ref.current
    const round = (n) => Number(n.toFixed(decimals))

    if (prefersReducedMotion() || !el || typeof IntersectionObserver === 'undefined') {
      setValue(round(target))
      return undefined
    }

    let done = false

    const run = () => {
      const startTime = performance.now()
      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1)
        setValue(round(start + (target - start) * easeOut(progress)))
        if (progress < 1) frameRef.current = requestAnimationFrame(step)
      }
      frameRef.current = requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || done) return
          done = true
          observer.unobserve(entry.target)
          run()
        })
      },
      { threshold: 0.4 }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration, decimals, start])

  return { ref, value }
}

export { useCountUp }
