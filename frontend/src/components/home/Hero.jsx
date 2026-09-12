import { useEffect, useState } from 'react'
import { MdVerifiedUser, MdKeyboardArrowDown } from 'react-icons/md'
import { FiUsers, FiMapPin } from 'react-icons/fi'
import { useSite } from '../../context/SiteContext'
import { HERO_SLIDES, HERO_WORDS, onImageError } from '../../data/constants'
import HeroSearch from './HeroSearch'
import './Hero.css'

const SLIDE_MS = 6000
const WORD_MS = 2600

const TRUST = [
  { label: 'RERA Registered Listings', icon: MdVerifiedUser },
  { label: '1,200+ Happy Families', icon: FiUsers },
  { label: '18+ Years in Faridabad', icon: FiMapPin }
]

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Rotates `length` indexes on an interval, pausing while the tab is hidden and
 * standing still entirely when the visitor asked for reduced motion.
 */
function useRotator(length, delay) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (length < 2 || reduceMotion()) return undefined
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      setIndex((i) => (i + 1) % length)
    }, delay)
    return () => clearInterval(id)
  }, [length, delay])

  return [index, setIndex]
}

/**
 * The home page hero: Ken-Burns crossfade slideshow of the Delhi-NCR skyline
 * behind the headline, the search card and the trust pills.
 */
export default function Hero() {
  const { settings } = useSite()

  const source = Array.isArray(settings?.heroSlides) && settings.heroSlides.length
    ? settings.heroSlides
    : HERO_SLIDES
  const slides = source.slice(0, 4)

  const [slide, setSlide] = useRotator(slides.length, SLIDE_MS)
  const [word] = useRotator(HERO_WORDS.length, WORD_MS)

  const prevWord = (word - 1 + HERO_WORDS.length) % HERO_WORDS.length

  return (
    <section className="rk-hero" aria-label="Find your property in Faridabad">
      <div className="rk-hero__bg" aria-hidden="true">
        {slides.map((item, i) => (
          <div
            key={item.image || item.id || i}
            className={`rk-hero__slide ${i === slide ? 'is-active' : ''}`.trim()}
          >
            <img
              className="rk-hero__img"
              src={item.image}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              onError={onImageError}
            />
          </div>
        ))}
      </div>

      <span className="rk-hero__overlay" aria-hidden="true" />
      <span className="rk-hero__glow" aria-hidden="true" />

      <div className="rk-container rk-hero__inner">
        <p className="rk-hero__eyebrow">
          <span className="rk-hero__eyebrow-rule" aria-hidden="true" />
          Faridabad&rsquo;s Trusted Property Consultant
        </p>

        <h1 className="rk-hero__title">
          Looking For Luxury{' '}
          <span className="rk-hero__rotator">
            <span className="sr-only">Homes, Plots, Offices and Shops</span>
            <span className="rk-hero__words" aria-hidden="true">
              {HERO_WORDS.map((w, i) => (
                <span
                  key={w}
                  className={`rk-hero__word ${
                    i === word ? 'is-active' : i === prevWord ? 'is-leaving' : ''
                  }`.trim()}
                >
                  {w}
                </span>
              ))}
            </span>
          </span>{' '}
          in Faridabad?
        </h1>

        <p className="rk-hero__sub">
          Flats, plots, shops and offices across Greater Faridabad, the old sectors and the Bypass
          Road belt &mdash; shortlisted, RERA-checked and negotiated by a team that works this one
          city only.
        </p>

        <HeroSearch />

        <ul className="rk-hero__pills">
          {TRUST.map(({ label, icon: Icon }) => (
            <li key={label} className="rk-hero__pill">
              <Icon className="rk-hero__pill-icon" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>

        <div className="rk-hero__foot">
          {slides.length > 1 && (
            <div className="rk-hero__dots" role="group" aria-label="Choose a hero image">
              {slides.map((item, i) => (
                <button
                  key={item.image || item.id || i}
                  type="button"
                  className={`rk-hero__dot ${i === slide ? 'is-active' : ''}`.trim()}
                  aria-current={i === slide ? 'true' : undefined}
                  aria-label={`Show image ${i + 1}${item.caption ? `: ${item.caption}` : ''}`}
                  onClick={() => setSlide(i)}
                >
                  <span className="rk-hero__dot-fill" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}

          <a className="rk-hero__cue" href="#explore">
            <span className="rk-hero__cue-text">Explore Faridabad</span>
            <span className="rk-hero__cue-arrow rk-anim-float" aria-hidden="true">
              <MdKeyboardArrowDown />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
