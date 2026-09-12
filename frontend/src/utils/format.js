/**
 * Rama Kripa Estates — formatting helpers.
 * Indian conventions throughout: Lac / Cr, en-IN digit grouping, ₹.
 * Dependency-free on purpose so it can be imported anywhere cheaply.
 */

const INR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

const PRICE_UNIT_SUFFIX = {
  total: '',
  'per-sqft': ' / sq. ft.',
  'per-sqyd': ' / sq. yd.',
  'per-month': ' / month'
}

const AREA_UNIT_LABEL = {
  sqft: 'sq. ft.',
  sqyd: 'sq. yd.',
  acre: 'acre'
}

const CATEGORY_LABELS = {
  residential: 'Residential',
  commercial: 'Commercial',
  plots: 'Plots',
  rent: 'Rent',
  'office-space': 'Office Space'
}

const STATUS_LABELS = {
  'new-launch': 'New Launch',
  'under-construction': 'Under Construction',
  'ready-to-move': 'Ready to Move',
  resale: 'Resale',
  'sold-out': 'Sold Out'
}

const LISTING_LABELS = {
  sale: 'For Sale',
  rent: 'For Rent'
}

const FURNISHING_LABELS = {
  unfurnished: 'Unfurnished',
  'semi-furnished': 'Semi-furnished',
  furnished: 'Furnished'
}

export const PRICE_ON_REQUEST = 'Price on Request'

/** Drop a trailing ".00"; keep other decimals as-is ("1.10" stays "1.10"). */
const crValue = (n) => (n / 1e7).toFixed(2).replace(/\.00$/, '')

/** Trim every trailing zero ("85.50" -> "85.5", "10.00" -> "10"). */
const lacValue = (n) => (n / 1e5).toFixed(2).replace(/\.?0+$/, '')

function amount(value) {
  const n = Math.abs(Number(value))
  if (!Number.isFinite(n)) return null
  if (n >= 1e7) return `₹${crValue(n)} Cr`
  if (n >= 1e5) return `₹${lacValue(n)} Lac`
  return `₹${INR.format(Math.round(n))}`
}

/**
 * formatPrice(9000000)                                  -> "₹90 Lac"
 * formatPrice(12500000)                                 -> "₹1.25 Cr"
 * formatPrice(65000, { priceUnit: 'per-sqyd' })         -> "₹65,000 / sq. yd."
 * formatPrice(11000000, { maxPrice: 16500000 })         -> "₹1.10 Cr - ₹1.65 Cr"
 * formatPrice(0, { priceOnRequest: true })              -> "Price on Request"
 */
export function formatPrice(value, options = {}) {
  const { priceOnRequest = false, priceUnit = 'total', maxPrice } = options
  const suffix = PRICE_UNIT_SUFFIX[priceUnit] ?? ''

  if (priceOnRequest) return PRICE_ON_REQUEST

  const low = amount(value)
  if (!low || Number(value) <= 0) return PRICE_ON_REQUEST

  const highNum = Number(maxPrice)
  if (Number.isFinite(highNum) && highNum > Number(value)) {
    return `${low} - ${amount(highNum)}${suffix}`
  }

  return `${low}${suffix}`
}

/**
 * formatArea(1450, 1890, 'sqft') -> "1,450 - 1,890 sq. ft."
 * formatArea(180, null, 'sqyd')  -> "180 sq. yd."
 */
export function formatArea(min, max, unit = 'sqft') {
  const label = AREA_UNIT_LABEL[unit] || unit || ''
  const lo = Number(min)
  const hi = Number(max)
  const hasLo = Number.isFinite(lo) && lo > 0
  const hasHi = Number.isFinite(hi) && hi > 0

  if (!hasLo && !hasHi) return '—'
  if (hasLo && hasHi && hi > lo) return `${INR.format(lo)} - ${INR.format(hi)} ${label}`.trim()
  return `${INR.format(hasLo ? lo : hi)} ${label}`.trim()
}

/** Short counts for stat tiles: 1250 -> "1.2K", 250000 -> "2.5L", 32000000 -> "3.2Cr". */
export function formatCompact(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  const trim = (x) => String(Number(x.toFixed(1)))
  if (Math.abs(n) >= 1e7) return `${trim(n / 1e7)}Cr`
  if (Math.abs(n) >= 1e5) return `${trim(n / 1e5)}L`
  if (Math.abs(n) >= 1e3) return `${trim(n / 1e3)}K`
  return INR.format(Math.round(n))
}

/** Plain en-IN grouped number, no currency. */
export function formatNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? INR.format(Math.round(n)) : '0'
}

export function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const categoryLabel = (key) => CATEGORY_LABELS[key] || titleCase(key)
export const statusLabel = (key) => STATUS_LABELS[key] || titleCase(key)
export const listingLabel = (key) => LISTING_LABELS[key] || titleCase(key)
export const furnishingLabel = (key) => FURNISHING_LABELS[key] || titleCase(key)
export const areaUnitLabel = (key) => AREA_UNIT_LABEL[key] || key || ''

/** "sector-88" / "SECTOR_88" -> "Sector 88" */
export function titleCase(value) {
  if (!value) return ''
  return String(value)
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** "Sector 88, Greater Faridabad" -> "sector-88-greater-faridabad" */
export function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Object -> query string params, dropping empty values. Returns a plain object. */
export function buildQuery(obj = {}) {
  const out = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (typeof value === 'string' && value.trim() === '') return
    if (Array.isArray(value)) {
      const kept = value.filter((v) => v !== undefined && v !== null && v !== '')
      if (kept.length) out[key] = kept
      return
    }
    if (typeof value === 'boolean' && value === false) return
    out[key] = value
  })
  return out
}

/** Same, but returns the encoded string including a leading "?" (or ""). */
export function buildQueryString(obj = {}) {
  const sp = new URLSearchParams()
  Object.entries(buildQuery(obj)).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((v) => sp.append(key, String(v)))
    else sp.append(key, String(value))
  })
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

/** URLSearchParams -> plain object (repeated keys become arrays). */
export function parseQuery(searchParams) {
  const sp =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(String(searchParams || ''))
  const out = {}
  sp.forEach((value, key) => {
    if (value === '') return
    if (out[key] === undefined) out[key] = value
    else if (Array.isArray(out[key])) out[key].push(value)
    else out[key] = [out[key], value]
  })
  return out
}

export function truncate(text, length = 140) {
  const str = String(text || '').trim()
  if (str.length <= length) return str
  const cut = str.slice(0, length)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > length * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/** "Rajesh Kumar Sharma" -> "RS" */
export function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return 'RK'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** "+91 98110 00000" -> "tel:+919811000000" */
export function phoneHref(phone) {
  const digits = String(phone || '').replace(/[^\d+]/g, '')
  return `tel:${digits}`
}

/** "+91 98110 00000" -> "https://wa.me/919811000000?text=..." */
export function whatsappHref(phone, text = '') {
  let digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) digits = `91${digits}`
  const base = `https://wa.me/${digits}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export function mailtoHref(email, subject = '', body = '') {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const qs = params.toString()
  return `mailto:${email}${qs ? `?${qs}` : ''}`
}

/** Bedrooms -> "3 BHK" (0/undefined -> ""). */
export function bhkLabel(bedrooms) {
  const n = Number(bedrooms)
  return Number.isFinite(n) && n > 0 ? `${n} BHK` : ''
}

/** "Sector 88" + "Greater Faridabad" -> "Sector 88, Greater Faridabad, Faridabad" */
export function locationLine(location = {}) {
  return [location.sector, location.locality, location.city]
    .filter((part, index, arr) => part && arr.indexOf(part) === index)
    .join(', ')
}

/* ------------------------------------------------------------------ */
/* Responsive image sizing                                             */
/* ------------------------------------------------------------------ */

/**
 * Ask the CDN for the width the layout actually needs.
 *
 * Uploads are stored capped at 2000px, which is right for a full-screen gallery
 * and five times too big for a 400px card. Cloudinary resizes on delivery, so
 * pushing the width into the URL turns a 154 KB card image into 31 KB — the
 * single biggest saving on the free plan's shared credit pool.
 *
 * Unsplash takes a `w=` parameter for the same job. Anything else is returned
 * untouched, so a hand-pasted URL from a builder's site still works.
 *
 * @param {string} url
 * @param {number} width  CSS pixels the image occupies at its largest
 * `dpr` defaults to 1.5, not 2. Measured on a real listing photo, a card that
 * displays at ~420px costs 20 KB at w_440, 35 KB at w_630 (dpr 1.5) and 60 KB at
 * w_880 (dpr 2). 1.5 still looks sharp on a retina screen and keeps a 12-card
 * listings page near 420 KB instead of 730 KB.
 *
 * @param {{dpr?: number}} [options]
 */
export function imageUrl(url, width, { dpr = 1.5 } = {}) {
  const src = String(url || '').trim()
  if (!src || !width || src.startsWith('data:')) return src

  const target = Math.min(2000, Math.round(width * dpr))

  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    // Never stack a second w_ on a URL that already carries one.
    if (/\/upload\/[^/]*\bw_\d+/.test(src)) return src
    return src.replace(
      /\/upload\/([^/]*)\//,
      (whole, params) => `/upload/${params ? `${params},` : ''}w_${target},c_limit/`
    )
  }

  if (src.includes('images.unsplash.com')) {
    return src.replace(/([?&])w=\d+/, `$1w=${target}`)
  }

  return src
}
