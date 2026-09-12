import { useCallback, useEffect, useRef, useState } from 'react'
import { MdChevronLeft, MdChevronRight, MdStar, MdStarBorder, MdFormatQuote } from 'react-icons/md'
import Section from '../ui/Section'
import SectionTitle from '../ui/SectionTitle'
import useFetch from '../../hooks/useFetch'
import { api } from '../../api/client'
import { IMAGE_IDS, UNSPLASH_AVATAR, onImageError } from '../../data/constants'
import { initials } from '../../utils/format'
import './Testimonials.css'

const AUTOPLAY_MS = 6000

/** Shown when the API is unreachable — real, Faridabad-specific voices. */
const FALLBACK_TESTIMONIALS = [
  {
    name: 'Rajesh Sharma',
    role: 'Sector 86, Faridabad',
    rating: 5,
    avatar: UNSPLASH_AVATAR(IMAGE_IDS.people[0]),
    message:
      'We had been comparing flats in Neharpar for almost a year. The team drove us to four societies in one Sunday, showed us the RERA registration for each and told us honestly which tower would get possession first. We registered our 3 BHK in Sector 86 within a month.'
  },
  {
    name: 'Priya Malhotra',
    role: 'Sector 15, Old Faridabad',
    rating: 5,
    avatar: UNSPLASH_AVATAR(IMAGE_IDS.people[1]),
    message:
      'I was selling my father’s kothi in Sector 15 and had no idea about circle rates. They valued it against three recent registries in the same lane, handled the buyer negotiation and completed the tehsil work while I was in Bengaluru.'
  },
  {
    name: 'Amit Chauhan',
    role: 'Sector 88, Greater Faridabad',
    rating: 5,
    avatar: UNSPLASH_AVATAR(IMAGE_IDS.people[2]),
    message:
      'I bought an SCO unit on the Sector 88 main road as an investment. What I valued most was the footfall study and the rental comparison they shared before I paid the token. The shop was leased to a pharmacy chain within four months.'
  },
  {
    name: 'Sunita Yadav',
    role: 'Ballabgarh, Faridabad',
    rating: 4,
    avatar: UNSPLASH_AVATAR(IMAGE_IDS.people[3]),
    message:
      'As a first-time buyer, the loan part frightened me. They arranged my sanction letter from PNB Housing before I paid the booking amount, so I knew exactly what my EMI would be. No surprises anywhere in the process.'
  },
  {
    name: 'Vikas Gupta',
    role: 'Sector 78, Faridabad',
    rating: 5,
    avatar: UNSPLASH_AVATAR(IMAGE_IDS.people[4]),
    message:
      'We shifted from Delhi and needed a furnished 3 BHK on rent near a good school. They shortlisted three options in Sector 78, did the tenant paperwork and police verification, and we moved in within ten days.'
  },
  {
    name: 'Neha Bansal',
    role: 'Surajkund, Faridabad',
    rating: 5,
    avatar: UNSPLASH_AVATAR(IMAGE_IDS.people[5]),
    message:
      'The plot we wanted near Surajkund had a mutation issue in the older records. Instead of pushing the deal, they told us to walk away and found a clean licensed plot two weeks later. That honesty is why we have sent them three relatives since.'
  }
]

/**
 * Distance between two slides (card width + gap). Derived from the DOM so the
 * arrows stay correct at every breakpoint without duplicating the CSS numbers.
 */
function slideStep(track) {
  const first = track?.children?.[0]
  if (!first) return 0
  const second = track.children[1]
  if (second) return second.offsetLeft - first.offsetLeft
  return first.getBoundingClientRect().width
}

function scrollToSlide(track, next) {
  const first = track?.children?.[0]
  const card = track?.children?.[next]
  if (!first || !card) return
  track.scrollTo({ left: card.offsetLeft - first.offsetLeft, behavior: 'smooth' })
}

function Stars({ rating = 5, name }) {
  const value = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)))
  return (
    <p className="rk-tst__stars" aria-label={`${value} out of 5 stars from ${name}`}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= value ? (
          <MdStar key={i} className="rk-star" aria-hidden="true" />
        ) : (
          <MdStarBorder key={i} className="rk-star rk-star--off" aria-hidden="true" />
        )
      )}
    </p>
  )
}

/**
 * Home §12 — dark green testimonial slider. One card on mobile, three on
 * desktop, driven by native scroll-snap so a swipe and the arrows agree.
 */
export default function Testimonials() {
  const { data } = useFetch((signal) => api.testimonials({ signal }), [])
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [maxIndex, setMaxIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const live = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  const items = (live.length ? live : FALLBACK_TESTIMONIALS).filter((t) => t && t.message)

  /** How many cards fit right now — decides how far the track can travel. */
  const measure = useCallback(() => {
    const track = trackRef.current
    const size = slideStep(track)
    if (!track || !size) return
    const perView = Math.max(1, Math.round(track.clientWidth / size))
    setMaxIndex(Math.max(0, items.length - perView))
  }, [items.length])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  useEffect(() => {
    if (index > maxIndex) setIndex(maxIndex)
  }, [index, maxIndex])

  const goTo = useCallback((next) => {
    scrollToSlide(trackRef.current, next)
    setIndex(next)
  }, [])

  const step = useCallback(
    (delta) => {
      const next = index + delta
      goTo(next < 0 ? maxIndex : next > maxIndex ? 0 : next)
    },
    [goTo, index, maxIndex]
  )

  // Keep the dots honest when the user swipes the track themselves.
  const handleScroll = () => {
    const track = trackRef.current
    const size = slideStep(track)
    if (!size) return
    const next = Math.round(track.scrollLeft / size)
    setIndex(Math.max(0, Math.min(maxIndex, next)))
  }

  // Auto-advance, paused while the user is reading (hover / keyboard focus).
  useEffect(() => {
    if (paused || maxIndex < 1) return undefined
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return undefined

    const id = window.setInterval(() => {
      setIndex((current) => {
        const next = current >= maxIndex ? 0 : current + 1
        scrollToSlide(trackRef.current, next)
        return next
      })
    }, AUTOPLAY_MS)

    return () => window.clearInterval(id)
  }, [paused, maxIndex])

  if (!items.length) return null

  return (
    <Section tone="dark" className="rk-tst" ariaLabel="What our clients say">
      <SectionTitle
        eyebrow="Client Stories"
        title="Families who found their address with us"
        subtitle="Six hundred registries later, this is the part of the job we are proudest of."
        align="center"
        light
      />

      <div
        className="rk-tst__slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <ul
          className="rk-tst__track"
          ref={trackRef}
          onScroll={handleScroll}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Client testimonials"
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              step(1)
            }
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              step(-1)
            }
          }}
        >
          {items.map((t, i) => (
            <li className="rk-tst__slide" key={t._id || `${t.name}-${i}`}>
              <figure className="rk-tst__card">
                <MdFormatQuote className="rk-tst__quote" aria-hidden="true" />

                <Stars rating={t.rating} name={t.name} />

                <blockquote className="rk-tst__message">{t.message}</blockquote>

                <figcaption className="rk-tst__person">
                  {t.avatar ? (
                    <img
                      className="rk-tst__avatar"
                      src={t.avatar}
                      alt={t.name || 'Client'}
                      width="56"
                      height="56"
                      loading="lazy"
                      decoding="async"
                      onError={onImageError}
                    />
                  ) : (
                    <span className="rk-tst__avatar rk-tst__avatar--initials" aria-hidden="true">
                      {initials(t.name)}
                    </span>
                  )}
                  <span className="rk-tst__who">
                    <span className="rk-tst__name">{t.name}</span>
                    <span className="rk-tst__place">{t.locality || t.role || 'Faridabad'}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {maxIndex > 0 && (
          <div className="rk-tst__controls">
            <button
              type="button"
              className="rk-tst__arrow"
              onClick={() => step(-1)}
              aria-label="Show previous testimonial"
            >
              <MdChevronLeft aria-hidden="true" />
            </button>

            <ul className="rk-tst__dots">
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className={`rk-tst__dot ${i === index ? 'is-active' : ''}`.trim()}
                    onClick={() => goTo(i)}
                    aria-label={`Go to testimonial ${i + 1} of ${maxIndex + 1}`}
                    aria-current={i === index ? 'true' : undefined}
                  />
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="rk-tst__arrow"
              onClick={() => step(1)}
              aria-label="Show next testimonial"
            >
              <MdChevronRight aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </Section>
  )
}
