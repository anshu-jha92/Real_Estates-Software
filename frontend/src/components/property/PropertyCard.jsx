import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MdLocationOn, MdArrowForward, MdFavorite, MdFavoriteBorder } from 'react-icons/md'
import { IMAGE_FALLBACK, onImageError } from '../../data/constants'
import {
  formatPrice,
  formatArea,
  categoryLabel,
  statusLabel,
  listingLabel,
  bhkLabel,
  locationLine, imageUrl } from '../../utils/format'
import './PropertyCard.css'

/** localStorage key for the saved / shortlisted properties (BUILD_SPEC). */
const SAVED_KEY = 'rk_saved'
/** Fired after any card writes, so every mounted card stays in sync. */
const SAVED_EVENT = 'rk:saved-change'

/** Suffix shown as small text next to the price. */
const PRICE_UNIT_SMALL = {
  total: '',
  'per-sqft': '/ sq. ft.',
  'per-sqyd': '/ sq. yd.',
  'per-month': '/ month'
}

/** Status -> colour tone for the top-left badge. */
const STATUS_TONE = {
  'new-launch': 'gold',
  'under-construction': 'info',
  'ready-to-move': 'success',
  resale: 'dark',
  'sold-out': 'danger'
}

export function readSaved() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(SAVED_KEY) || '[]')
    return Array.isArray(raw) ? raw.filter((v) => typeof v === 'string' && v) : []
  } catch {
    return []
  }
}

function writeSaved(list) {
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(list))
  } catch {
    /* private mode / storage full — the toggle still works for this session */
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(SAVED_EVENT))
}

/**
 * The portfolio card. Whole card navigates to the property; the save toggle
 * sits outside the anchor so it never triggers navigation.
 *
 * @param {{ property: object, variant?: 'grid'|'wide'|'compact', className?: string }} props
 */
export default function PropertyCard({ property, variant = 'grid', className = '' }) {
  const p = property || {}
  const key = p.slug || p._id || p.id || ''
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!key) return undefined
    const sync = () => setSaved(readSaved().includes(key))
    sync()
    window.addEventListener(SAVED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SAVED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [key])

  const toggleSave = useCallback(
    (event) => {
      // Belt and braces: never let the save click reach a parent link.
      event.preventDefault()
      event.stopPropagation()
      if (!key) return
      const current = readSaved()
      const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
      writeSaved(next)
      setSaved(next.includes(key))
    },
    [key]
  )

  if (!property) return null

  const title = p.title || 'Property in Faridabad'
  const to = p.slug ? `/property/${p.slug}` : p._id || p.id ? `/property/${p._id || p.id}` : '/properties'
  const image = p.thumbnail || (Array.isArray(p.images) && p.images[0]) || IMAGE_FALLBACK
  const place = locationLine(p.location) || 'Faridabad, Haryana'
  const status = p.status ? statusLabel(p.status) : ''
  const tone = STATUS_TONE[p.status] || 'dark'
  const category = p.category ? categoryLabel(p.category) : ''
  const listing = p.listingType ? listingLabel(p.listingType) : ''

  const priceMain = formatPrice(p.price, { priceOnRequest: p.priceOnRequest, maxPrice: p.maxPrice })
  const priceUnit = p.priceOnRequest ? '' : PRICE_UNIT_SMALL[p.priceUnit] || ''

  const area = formatArea(p.areaMin, p.areaMax, p.areaUnit || 'sqft')
  const specs = [bhkLabel(p.bedrooms), area !== '—' ? area : '', p.propertyType || ''].filter(Boolean)

  const isCompact = variant === 'compact'
  const featured = Boolean(p.isFeatured) && !isCompact

  return (
    <article
      className={`rk-pcard rk-pcard--${variant} ${featured ? 'rk-pcard--featured' : ''} ${className}`
        .replace(/\s+/g, ' ')
        .trim()}
    >
      <Link to={to} className="rk-pcard__link">
        <div className="rk-pcard__media">
          <img
            className="rk-pcard__img"
            src={imageUrl(image, variant === 'compact' ? 120 : 420)}
            alt={`${title}, ${place}`}
            loading="lazy"
            decoding="async"
            onError={onImageError}
          />
          <span className="rk-pcard__scrim" aria-hidden="true" />

          {status && (
            <span className={`rk-pcard__status rk-pcard__status--${tone}`}>{status}</span>
          )}

          {featured && (
            <span className="rk-pcard__ribbon">
              <span>Featured</span>
            </span>
          )}

          {category && !isCompact && (
            <span className="rk-pcard__cat">
              {category}
              {p.listingType === 'rent' ? ` · ${listing}` : ''}
            </span>
          )}
        </div>

        <div className="rk-pcard__body">
          <p className="rk-pcard__price">
            {priceMain}
            {priceUnit && <small> {priceUnit}</small>}
          </p>

          <h3 className="rk-pcard__title">{title}</h3>

          <p className="rk-pcard__place">
            <MdLocationOn className="rk-pcard__pin" aria-hidden="true" />
            <span>{place}</span>
          </p>

          {specs.length > 0 && (
            <ul className="rk-pcard__specs">
              {specs.map((spec) => (
                <li key={spec} className="rk-pcard__spec">
                  {spec}
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isCompact && (
          <div className="rk-pcard__foot">
            <span className="rk-pcard__dev">{p.developer || 'Rama Kripa Estates'}</span>
            <span className="rk-pcard__more">
              View Details
              <MdArrowForward aria-hidden="true" />
            </span>
          </div>
        )}
      </Link>

      {key && (
        <button
          type="button"
          className="rk-pcard__save"
          onClick={toggleSave}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${title} from your shortlist` : `Save ${title} to your shortlist`}
          title={saved ? 'Saved' : 'Save this property'}
        >
          {saved ? <MdFavorite aria-hidden="true" /> : <MdFavoriteBorder aria-hidden="true" />}
        </button>
      )}
    </article>
  )
}
