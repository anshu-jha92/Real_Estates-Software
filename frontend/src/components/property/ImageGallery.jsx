import { useCallback, useEffect, useRef, useState } from 'react'
import { MdChevronLeft, MdChevronRight, MdZoomOutMap } from 'react-icons/md'
import Modal from '../ui/Modal'
import { IMAGE_FALLBACK, onImageError } from '../../data/constants'
import './ImageGallery.css'
import { imageUrl } from '../../utils/format'

const SWIPE_PX = 45
const AUTOPLAY_MS = 5000
/** Must match the animation length in ImageGallery.css. */
const FADE_MS = 900

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Property image gallery: 16:9 stage, arrows, counter, dots, thumbnail strip,
 * lightbox with arrow-key / Escape / swipe support.
 *
 * @param {{ images?: string[], title?: string, className?: string }} props
 */
export default function ImageGallery({ images, title = 'Property', className = '' }) {
  const cleaned = (Array.isArray(images) ? images : []).filter(
    (src) => typeof src === 'string' && src.trim()
  )
  const list = cleaned.length ? cleaned : [IMAGE_FALLBACK]
  const count = list.length

  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [hovered, setHovered] = useState(false)
  /** The photo on its way out, kept underneath while the new one fades in over it. */
  const [leaving, setLeaving] = useState(null)
  const shownRef = useRef(0)
  const touchX = useRef(null)
  const stripRef = useRef(null)
  const didMount = useRef(false)

  const current = Math.min(index, count - 1)

  const go = useCallback(
    (next) => setIndex(((next % count) + count) % count),
    [count]
  )

  const prev = useCallback(() => go(current - 1), [go, current])
  const next = useCallback(() => go(current + 1), [go, current])

  // Reset when a different property is rendered into the same slot.
  useEffect(() => {
    setIndex(0)
  }, [count, title])

  // Crossfade: remember what was showing. It is dropped when the incoming
  // photo's fade ends (onAnimationEnd below); the timer is only a fallback for
  // reduced-motion, where there is no animation and so no end event.
  useEffect(() => {
    if (shownRef.current === current) return undefined
    setLeaving(shownRef.current)
    shownRef.current = current
    const id = setTimeout(() => setLeaving(null), FADE_MS + 300)
    return () => clearTimeout(id)
  }, [current])

  // Fetch the next photo ahead of time so the fade never reveals a blank frame.
  useEffect(() => {
    if (count < 2) return
    const img = new Image()
    img.src = imageUrl(list[(current + 1) % count], 1400)
  }, [current, count, list])

  // Slideshow. `current` is a dependency on purpose: every change, whether the
  // timer's or the visitor's, restarts the 3s so a click never gets jumped on.
  useEffect(() => {
    if (count < 2 || hovered || lightbox || reduceMotion()) return undefined
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      setIndex((i) => (i + 1) % count)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [count, current, hovered, lightbox])

  // Arrow keys drive the lightbox (Escape is handled by Modal).
  useEffect(() => {
    if (!lightbox) return undefined
    const onKey = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        prev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  // Keep the active thumbnail in view on narrow screens (never on first paint,
  // which would scroll the page down to the gallery).
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
    const strip = stripRef.current
    if (!strip) return
    const active = strip.querySelector('[data-active="true"]')
    if (active && typeof active.scrollIntoView === 'function') {
      active.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }, [current])

  const onTouchStart = (event) => {
    touchX.current = event.changedTouches?.[0]?.clientX ?? null
  }

  const onTouchEnd = (event) => {
    if (touchX.current === null) return
    const endX = event.changedTouches?.[0]?.clientX ?? touchX.current
    const delta = endX - touchX.current
    touchX.current = null
    if (Math.abs(delta) < SWIPE_PX) return
    if (delta > 0) prev()
    else next()
  }

  const alt = (i) => `${title} — photo ${i + 1} of ${count}`

  return (
    <section className={`rk-gal ${className}`.trim()} aria-label={`${title} photo gallery`}>
      <div
        className="rk-gal__main"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          type="button"
          className="rk-gal__stage"
          onClick={() => setLightbox(true)}
          aria-label={`Open ${title} photos in full screen`}
        >
          {leaving !== null && leaving !== current && (
            <img
              key={`under-${leaving}`}
              className="rk-gal__img rk-gal__img--under"
              src={imageUrl(list[leaving], 1400)}
              alt=""
              aria-hidden="true"
              decoding="async"
              onError={onImageError}
            />
          )}
          <img
            key={`shown-${current}`}
            className="rk-gal__img rk-gal__img--in"
            src={imageUrl(list[current], 1400)}
            alt={alt(current)}
            loading={current === 0 ? 'eager' : 'lazy'}
            decoding="async"
            onError={onImageError}
            onAnimationEnd={() => setLeaving(null)}
          />
          <span className="rk-gal__zoom" aria-hidden="true">
            <MdZoomOutMap />
          </span>
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              className="rk-gal__nav rk-gal__nav--prev"
              onClick={prev}
              aria-label="Previous photo"
            >
              <MdChevronLeft aria-hidden="true" />
            </button>

            <button
              type="button"
              className="rk-gal__nav rk-gal__nav--next"
              onClick={next}
              aria-label="Next photo"
            >
              <MdChevronRight aria-hidden="true" />
            </button>

            <p className="rk-gal__counter" aria-live="polite">
              {current + 1} / {count}
            </p>

            <ul className="rk-gal__dots">
              {list.map((src, i) => (
                <li key={`dot-${src}-${i}`}>
                  <button
                    type="button"
                    className={`rk-gal__dot ${i === current ? 'is-active' : ''}`.trim()}
                    onClick={() => go(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-current={i === current ? 'true' : undefined}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="rk-gal__strip" ref={stripRef}>
          {list.map((src, i) => (
            <li key={`thumb-${src}-${i}`} className="rk-gal__thumbitem">
              <button
                type="button"
                className={`rk-gal__thumb ${i === current ? 'is-active' : ''}`.trim()}
                onClick={() => go(i)}
                data-active={i === current ? 'true' : 'false'}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === current ? 'true' : undefined}
              >
                <img src={imageUrl(src, 160)} alt="" loading="lazy" decoding="async" onError={onImageError} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={lightbox}
        onClose={() => setLightbox(false)}
        title={title}
        size="full"
        className="rk-gal__lightbox"
      >
        <div className="rk-gal__lbstage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <img
            className="rk-gal__lbimg"
            src={list[current]}
            alt={alt(current)}
            decoding="async"
            onError={onImageError}
          />

          {count > 1 && (
            <>
              <button
                type="button"
                className="rk-gal__nav rk-gal__nav--prev"
                onClick={prev}
                aria-label="Previous photo"
              >
                <MdChevronLeft aria-hidden="true" />
              </button>

              <button
                type="button"
                className="rk-gal__nav rk-gal__nav--next"
                onClick={next}
                aria-label="Next photo"
              >
                <MdChevronRight aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        <p className="rk-gal__lbcounter" aria-live="polite">
          Photo {current + 1} of {count} · use the arrow keys or swipe to browse
        </p>
      </Modal>
    </section>
  )
}
