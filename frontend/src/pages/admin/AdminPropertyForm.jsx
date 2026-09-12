import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  MdAdd,
  MdArrowDownward,
  MdArrowUpward,
  MdAttachMoney,
  MdClose,
  MdCollections,
  MdDeleteOutline,
  MdErrorOutline,
  MdExpandMore,
  MdFlag,
  MdInfoOutline,
  MdLocationOn,
  MdSearch,
  MdSquareFoot,
  MdStarBorder,
  MdViewList
} from 'react-icons/md'
import Field from '../../components/forms/Field'
import MediaInput from '../../components/forms/MediaInput'
import Loader from '../../components/ui/Loader'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../api/client'
import {
  AMENITY_ICONS,
  AREA_UNITS,
  CATEGORIES,
  FURNISHING_OPTIONS,
  LISTING_TYPES,
  PROPERTY_TYPES,
  STATUS_OPTIONS
} from '../../data/constants'
import { getToken, handleAuthError } from './auth'
import './admin.css'

/* ------------------------------------------------------------------ */
/* Options                                                             */
/* ------------------------------------------------------------------ */

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.key, label: c.label }))
const TYPE_OPTIONS = PROPERTY_TYPES.map((t) => ({ value: t, label: t }))
const PRICE_UNIT_OPTIONS = [
  { value: 'total', label: 'Total price' },
  { value: 'per-sqft', label: 'Per sq. ft.' },
  { value: 'per-sqyd', label: 'Per sq. yd.' },
  { value: 'per-month', label: 'Per month (rent)' }
]
const AMENITY_SUGGESTIONS = Object.keys(AMENITY_ICONS)
const BADGE_SUGGESTIONS = [
  'RERA Approved',
  'Ready to Move',
  'New Launch',
  'Corner Unit',
  'Park Facing',
  'Metro Nearby',
  'Loan Approved',
  'Investor Choice',
  'Limited Units'
]

const EMPTY_FORM = {
  title: '',
  category: 'residential',
  propertyType: '3 BHK Apartment',
  listingType: 'sale',
  status: 'ready-to-move',
  developer: '',
  reraNumber: '',
  possession: '',
  shortDescription: '',
  description: '',

  price: '',
  maxPrice: '',
  priceOnRequest: false,
  priceUnit: 'total',

  areaMin: '',
  areaMax: '',
  areaUnit: 'sqft',
  bedrooms: '',
  bathrooms: '',
  balconies: '',
  floorsTotal: '',
  parking: '',
  furnishing: 'unfurnished',

  location: {
    locality: '',
    sector: '',
    city: 'Faridabad',
    state: 'Haryana',
    pincode: '',
    address: '',
    landmark: '',
    lat: '',
    lng: ''
  },

  thumbnail: '',
  images: [''],
  brochureUrl: '',
  videoUrl: '',

  configurations: [],
  amenities: [],
  highlights: [],
  nearby: [],

  badges: [],
  isFeatured: false,
  isTrending: false,
  isActive: true,
  order: 100,

  seo: { metaTitle: '', metaDescription: '', keywords: [] }
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Section({ icon: Icon, title, hint, children, defaultOpen = false }) {
  return (
    <details className="rk-adm-section" open={defaultOpen}>
      <summary className="rk-adm-section__summary">
        <span className="rk-adm-section__icon" aria-hidden="true">
          <Icon />
        </span>
        <span className="rk-adm-section__label">
          {title}
          {hint && <small>{hint}</small>}
        </span>
        <MdExpandMore className="rk-adm-section__chevron" aria-hidden="true" />
      </summary>
      <div className="rk-adm-section__body">{children}</div>
    </details>
  )
}

/** Chip list + typeahead. Enter adds, the × removes. */
function TagInput({ label, hint, values, suggestions = [], placeholder, onChange }) {
  const [draft, setDraft] = useState('')
  const listId = `rk-tags-${useId().replace(/:/g, '')}`

  const add = (raw) => {
    const value = String(raw || '').trim()
    if (!value) return
    if (values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      setDraft('')
      return
    }
    onChange([...values, value])
    setDraft('')
  }

  return (
    <div className="rk-adm-span-2">
      <span className="rk-label">{label}</span>

      {values.length > 0 && (
        <ul className="rk-adm-tags" style={{ marginBottom: 10, listStyle: 'none' }}>
          {values.map((value, index) => (
            <li className="rk-adm-tag" key={`${value}-${index}`}>
              {value}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
                aria-label={`Remove ${value}`}
              >
                <MdClose aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rk-adm-tagadd">
        <Field
          label={`Add ${label.toLowerCase()}`}
          name={listId}
          value={draft}
          placeholder={placeholder}
          hint={hint}
          list={suggestions.length ? listId : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(draft)
            }
          }}
        />
        <button type="button" className="rk-btn rk-btn--outline rk-btn--sm" onClick={() => add(draft)}>
          <MdAdd className="rk-btn__icon" aria-hidden="true" />
          Add
        </button>
      </div>

      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  )
}

function RowTools({ onRemove, onUp, onDown, label, canUp, canDown }) {
  return (
    <div className="rk-adm-row__tools">
      {onUp && (
        <button
          type="button"
          className="rk-adm-iconbtn"
          onClick={onUp}
          disabled={!canUp}
          aria-label={`Move ${label} up`}
          title="Move up"
        >
          <MdArrowUpward aria-hidden="true" />
        </button>
      )}
      {onDown && (
        <button
          type="button"
          className="rk-adm-iconbtn"
          onClick={onDown}
          disabled={!canDown}
          aria-label={`Move ${label} down`}
          title="Move down"
        >
          <MdArrowDownward aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        className="rk-adm-iconbtn rk-adm-iconbtn--danger"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        title="Remove"
      >
        <MdDeleteOutline aria-hidden="true" />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Payload helpers                                                     */
/* ------------------------------------------------------------------ */

/** "" -> null so Mongoose keeps the field empty instead of casting to 0. */
const num = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const int = (value) => {
  const n = num(value)
  return n === null ? 0 : Math.max(0, Math.round(n))
}

/** Turn the server document back into form state (numbers become strings). */
function toForm(doc) {
  const str = (v) => (v === null || v === undefined ? '' : String(v))
  return {
    ...EMPTY_FORM,
    ...doc,
    price: str(doc.price),
    maxPrice: str(doc.maxPrice),
    areaMin: str(doc.areaMin),
    areaMax: str(doc.areaMax),
    bedrooms: str(doc.bedrooms),
    bathrooms: str(doc.bathrooms),
    balconies: str(doc.balconies),
    floorsTotal: str(doc.floorsTotal),
    parking: str(doc.parking),
    order: str(doc.order ?? 100),
    location: {
      ...EMPTY_FORM.location,
      ...(doc.location || {}),
      lat: str(doc.location?.lat),
      lng: str(doc.location?.lng)
    },
    images: doc.images?.length ? doc.images : [''],
    configurations: (doc.configurations || []).map((c) => ({
      label: c.label || '',
      areaValue: str(c.areaValue),
      areaUnit: c.areaUnit || 'sqft',
      price: str(c.price),
      priceOnRequest: Boolean(c.priceOnRequest)
    })),
    amenities: doc.amenities || [],
    highlights: doc.highlights || [],
    nearby: doc.nearby || [],
    badges: doc.badges || [],
    seo: {
      metaTitle: doc.seo?.metaTitle || '',
      metaDescription: doc.seo?.metaDescription || '',
      keywords: doc.seo?.keywords || []
    }
  }
}

function toPayload(form) {
  const images = form.images.map((u) => u.trim()).filter(Boolean)

  return {
    title: form.title.trim(),
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    category: form.category,
    propertyType: form.propertyType.trim(),
    listingType: form.listingType,
    status: form.status,
    developer: form.developer.trim(),
    reraNumber: form.reraNumber.trim(),
    possession: form.possession.trim(),

    price: num(form.price),
    maxPrice: num(form.maxPrice),
    priceOnRequest: Boolean(form.priceOnRequest),
    priceUnit: form.priceUnit,

    areaMin: num(form.areaMin),
    areaMax: num(form.areaMax),
    areaUnit: form.areaUnit,
    bedrooms: int(form.bedrooms),
    bathrooms: int(form.bathrooms),
    balconies: int(form.balconies),
    floorsTotal: int(form.floorsTotal),
    parking: int(form.parking),
    furnishing: form.furnishing,

    location: {
      locality: form.location.locality.trim(),
      sector: form.location.sector.trim(),
      city: form.location.city.trim() || 'Faridabad',
      state: form.location.state.trim() || 'Haryana',
      pincode: form.location.pincode.trim(),
      address: form.location.address.trim(),
      landmark: form.location.landmark.trim(),
      ...(num(form.location.lat) === null ? {} : { lat: num(form.location.lat) }),
      ...(num(form.location.lng) === null ? {} : { lng: num(form.location.lng) })
    },

    images,
    thumbnail: form.thumbnail.trim() || images[0] || '',
    brochureUrl: form.brochureUrl.trim(),
    videoUrl: form.videoUrl.trim(),

    configurations: form.configurations
      .filter((c) => c.label.trim())
      .map((c) => ({
        label: c.label.trim(),
        areaValue: num(c.areaValue),
        areaUnit: c.areaUnit,
        price: num(c.price),
        priceOnRequest: Boolean(c.priceOnRequest)
      })),
    amenities: form.amenities,
    highlights: form.highlights,
    nearby: form.nearby.filter((n) => n.label.trim()).map((n) => ({
      label: n.label.trim(),
      distance: n.distance.trim()
    })),

    badges: form.badges,
    isFeatured: Boolean(form.isFeatured),
    isTrending: Boolean(form.isTrending),
    isActive: Boolean(form.isActive),
    order: int(form.order),

    seo: {
      metaTitle: form.seo.metaTitle.trim(),
      metaDescription: form.seo.metaDescription.trim(),
      keywords: form.seo.keywords
    }
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AdminPropertyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    document.title = `${isEdit ? 'Edit' : 'Add'} property — Rama Kripa Estates Admin`
  }, [isEdit])

  useEffect(() => {
    if (!isEdit) return undefined
    let alive = true

    ;(async () => {
      setLoading(true)
      setLoadError('')
      try {
        const res = await api.property(id)
        if (alive) setForm(toForm(res.data || {}))
      } catch (err) {
        if (handleAuthError(err)) return
        if (alive) setLoadError(err.message || 'We could not load this property.')
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [id, isEdit])

  /* ---------- field helpers ---------- */

  const set = useCallback((name, value) => {
    setForm((prev) => {
      if (!name.includes('.')) return { ...prev, [name]: value }
      const [group, key] = name.split('.')
      return { ...prev, [group]: { ...prev[group], [key]: value } }
    })
  }, [])

  const onInput = (name) => (e) =>
    set(name, e.target.type === 'checkbox' ? e.target.checked : e.target.value)

  const listAdd = (key, blank) => setForm((p) => ({ ...p, [key]: [...p[key], blank] }))
  const listRemove = (key, index) =>
    setForm((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== index) }))
  const listPatch = (key, index, patch) =>
    setForm((p) => ({
      ...p,
      [key]: p[key].map((row, i) => (i === index ? { ...row, ...patch } : row))
    }))
  const listMove = (key, index, delta) =>
    setForm((p) => {
      const next = [...p[key]]
      const target = index + delta
      if (target < 0 || target >= next.length) return p
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...p, [key]: next }
    })

  /* ---------- validation ---------- */

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'Give the listing a title, e.g. "3 BHK in BPTP Park Elite, Sector 86".'
    else if (form.title.trim().length > 180) next.title = 'Keep the title under 180 characters.'

    if (!form.category) next.category = 'Choose a category.'
    if (!form.location.locality.trim() && !form.location.sector.trim()) {
      next['location.locality'] = 'Enter at least a locality or a sector so buyers can find it.'
    }
    if (!form.priceOnRequest && num(form.price) === null) {
      next.price = 'Enter a price, or switch on "Price on request".'
    }
    if (num(form.maxPrice) !== null && num(form.price) !== null && num(form.maxPrice) < num(form.price)) {
      next.maxPrice = 'The maximum price must be higher than the starting price.'
    }
    if (num(form.areaMax) !== null && num(form.areaMin) !== null && num(form.areaMax) < num(form.areaMin)) {
      next.areaMax = 'The maximum area must be larger than the minimum area.'
    }
    if (form.shortDescription.length > 320) {
      next.shortDescription = 'The card summary must stay under 320 characters.'
    }

    setErrors(next)
    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const found = validate()

    if (Object.keys(found).length) {
      toast.error('Please check the form', 'Some required details are missing or invalid.')
      // Open every section so the error is not hidden inside a collapsed panel.
      document.querySelectorAll('.rk-adm-section').forEach((el) => {
        el.open = true
      })
      requestAnimationFrame(() => {
        const first = document.querySelector('[aria-invalid="true"]')
        first?.scrollIntoView({ block: 'center', behavior: 'smooth' })
        first?.focus({ preventScroll: true })
      })
      return
    }

    setSaving(true)
    try {
      const payload = toPayload(form)
      const token = getToken()
      const res = isEdit
        ? await api.admin.updateProperty(id, payload, token)
        : await api.admin.createProperty(payload, token)

      toast.success(
        isEdit ? 'Property updated' : 'Property published',
        `"${res.data?.title || payload.title}" is now live on ramakripaestate.com.`
      )
      navigate('/admin/properties')
    } catch (err) {
      if (handleAuthError(err)) return
      if (err.errors) setErrors(err.errors)
      toast.error('Could not save', err.message || 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const previewCount = useMemo(() => form.images.filter((u) => u.trim()).length, [form.images])

  if (loading) return <Loader full label="Loading this property…" />

  if (loadError) {
    return (
      <div className="rk-adm">
        <p className="rk-adm-alert" role="alert">
          <MdErrorOutline aria-hidden="true" />
          <span>{loadError}</span>
        </p>
        <Link className="rk-btn rk-btn--outline rk-btn--sm" to="/admin/properties" style={{ alignSelf: 'flex-start' }}>
          Back to properties
        </Link>
      </div>
    )
  }

  return (
    <div className="rk-adm">
      <header className="rk-adm-head">
        <div className="rk-adm-head__text">
          <h2 className="rk-adm-head__title">{isEdit ? 'Edit property' : 'Add a property'}</h2>
          <p className="rk-adm-head__sub">
            Only the Basics and Pricing sections are required — everything else makes the listing page
            richer. Sections stay collapsed so you can fill them in whatever order suits you.
          </p>
        </div>
      </header>

      <form className="rk-adm-form" onSubmit={handleSubmit} noValidate>
        {/* ---------------- Basics ---------------- */}
        <Section icon={MdInfoOutline} title="Basics" hint="Title, category and description" defaultOpen>
          <div className="rk-adm-grid rk-adm-grid--2">
            <Field
              className="rk-adm-span-2"
              label="Listing title"
              name="title"
              value={form.title}
              onChange={onInput('title')}
              error={errors.title}
              placeholder="3 BHK Apartment in BPTP Park Elite Floors, Sector 86"
              required
            />
            <Field
              as="select"
              label="Category"
              name="category"
              options={CATEGORY_OPTIONS}
              value={form.category}
              onChange={onInput('category')}
              error={errors.category}
              required
            />
            <Field
              label="Property type"
              name="propertyType"
              value={form.propertyType}
              onChange={onInput('propertyType')}
              list="rk-property-types"
              placeholder="3 BHK Apartment"
              hint="Pick a suggestion or type your own."
            />
            <datalist id="rk-property-types">
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value} />
              ))}
            </datalist>
            <Field
              as="select"
              label="Listing type"
              name="listingType"
              options={LISTING_TYPES}
              value={form.listingType}
              onChange={onInput('listingType')}
            />
            <Field
              as="select"
              label="Construction status"
              name="status"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={onInput('status')}
            />
            <Field
              label="Developer / owner"
              name="developer"
              value={form.developer}
              onChange={onInput('developer')}
              placeholder="BPTP, Omaxe, Puri Constructions…"
            />
            <Field
              label="RERA number"
              name="reraNumber"
              value={form.reraNumber}
              onChange={onInput('reraNumber')}
              placeholder="HRERA-PKL-FBD-123-2023"
            />
            <Field
              label="Possession"
              name="possession"
              value={form.possession}
              onChange={onInput('possession')}
              placeholder="Ready to move / Dec 2027"
            />
            <Field
              as="textarea"
              className="rk-adm-span-2"
              label="Card summary"
              name="shortDescription"
              rows={3}
              value={form.shortDescription}
              onChange={onInput('shortDescription')}
              error={errors.shortDescription}
              hint={`Shown on the property card and in search results. ${form.shortDescription.length}/320 characters.`}
              placeholder="Park-facing 3 BHK with covered parking, 5 minutes from the Sector 88 market and the Faridabad bypass."
            />
            <Field
              as="textarea"
              className="rk-adm-span-2"
              label="Full description"
              name="description"
              rows={8}
              value={form.description}
              onChange={onInput('description')}
              hint="The long write-up on the property page. Mention the sector, connectivity, schools and hospitals nearby."
              placeholder="This 3 BHK independent floor sits in a licensed colony off the Faridabad bypass…"
            />
          </div>
        </Section>

        {/* ---------------- Pricing ---------------- */}
        <Section icon={MdAttachMoney} title="Pricing" hint="Rupee values, entered in full (no commas)">
          <div className="rk-adm-grid rk-adm-grid--3">
            <Field
              label="Price (₹)"
              name="price"
              type="number"
              min="0"
              step="1000"
              inputMode="numeric"
              value={form.price}
              onChange={onInput('price')}
              error={errors.price}
              hint="e.g. 6500000 for ₹65 Lac"
              disabled={form.priceOnRequest}
            />
            <Field
              label="Maximum price (₹)"
              name="maxPrice"
              type="number"
              min="0"
              step="1000"
              inputMode="numeric"
              value={form.maxPrice}
              onChange={onInput('maxPrice')}
              error={errors.maxPrice}
              hint="Only for a range, e.g. ₹65 Lac – ₹82 Lac"
              disabled={form.priceOnRequest}
            />
            <Field
              as="select"
              label="Price shown as"
              name="priceUnit"
              options={PRICE_UNIT_OPTIONS}
              value={form.priceUnit}
              onChange={onInput('priceUnit')}
            />
            <label className="rk-adm-check rk-adm-span-2">
              <input
                type="checkbox"
                checked={form.priceOnRequest}
                onChange={onInput('priceOnRequest')}
              />
              <span>
                <strong>Price on request</strong>
                <small>Hides the amount and shows “Price on Request” across the site.</small>
              </span>
            </label>
          </div>
        </Section>

        {/* ---------------- Area & rooms ---------------- */}
        <Section icon={MdSquareFoot} title="Area &amp; rooms" hint="Carpet / plot size and the room count">
          <div className="rk-adm-grid rk-adm-grid--3">
            <Field
              label="Area from"
              name="areaMin"
              type="number"
              min="0"
              inputMode="numeric"
              value={form.areaMin}
              onChange={onInput('areaMin')}
            />
            <Field
              label="Area to"
              name="areaMax"
              type="number"
              min="0"
              inputMode="numeric"
              value={form.areaMax}
              onChange={onInput('areaMax')}
              error={errors.areaMax}
            />
            <Field
              as="select"
              label="Area unit"
              name="areaUnit"
              options={AREA_UNITS}
              value={form.areaUnit}
              onChange={onInput('areaUnit')}
            />
            <Field
              label="Bedrooms"
              name="bedrooms"
              type="number"
              min="0"
              max="20"
              inputMode="numeric"
              value={form.bedrooms}
              onChange={onInput('bedrooms')}
            />
            <Field
              label="Bathrooms"
              name="bathrooms"
              type="number"
              min="0"
              max="20"
              inputMode="numeric"
              value={form.bathrooms}
              onChange={onInput('bathrooms')}
            />
            <Field
              label="Balconies"
              name="balconies"
              type="number"
              min="0"
              max="20"
              inputMode="numeric"
              value={form.balconies}
              onChange={onInput('balconies')}
            />
            <Field
              label="Total floors"
              name="floorsTotal"
              type="number"
              min="0"
              max="100"
              inputMode="numeric"
              value={form.floorsTotal}
              onChange={onInput('floorsTotal')}
            />
            <Field
              label="Car parking"
              name="parking"
              type="number"
              min="0"
              max="20"
              inputMode="numeric"
              value={form.parking}
              onChange={onInput('parking')}
            />
            <Field
              as="select"
              label="Furnishing"
              name="furnishing"
              options={FURNISHING_OPTIONS}
              value={form.furnishing}
              onChange={onInput('furnishing')}
            />
          </div>
        </Section>

        {/* ---------------- Location ---------------- */}
        <Section icon={MdLocationOn} title="Location" hint="Sector, locality and map coordinates">
          <div className="rk-adm-grid rk-adm-grid--3">
            <Field
              label="Locality"
              name="location.locality"
              value={form.location.locality}
              onChange={onInput('location.locality')}
              error={errors['location.locality']}
              placeholder="Greater Faridabad (Neharpar)"
            />
            <Field
              label="Sector"
              name="location.sector"
              value={form.location.sector}
              onChange={onInput('location.sector')}
              placeholder="Sector 86"
            />
            <Field
              label="City"
              name="location.city"
              value={form.location.city}
              onChange={onInput('location.city')}
              placeholder="Faridabad"
            />
            <Field
              label="State"
              name="location.state"
              value={form.location.state}
              onChange={onInput('location.state')}
              placeholder="Haryana"
            />
            <Field
              label="PIN code"
              name="location.pincode"
              inputMode="numeric"
              maxLength={6}
              value={form.location.pincode}
              onChange={onInput('location.pincode')}
              placeholder="121002"
            />
            <Field
              label="Landmark"
              name="location.landmark"
              value={form.location.landmark}
              onChange={onInput('location.landmark')}
              placeholder="Opposite Sector 86 community centre"
            />
            <Field
              className="rk-adm-span-2"
              label="Full address"
              name="location.address"
              value={form.location.address}
              onChange={onInput('location.address')}
              placeholder="Plot 21, Block C, Sector 86, Greater Faridabad, Haryana"
            />
            <Field
              label="Latitude"
              name="location.lat"
              type="number"
              step="any"
              value={form.location.lat}
              onChange={onInput('location.lat')}
              hint="Optional — pins the map exactly. Faridabad is around 28.40."
            />
            <Field
              label="Longitude"
              name="location.lng"
              type="number"
              step="any"
              value={form.location.lng}
              onChange={onInput('location.lng')}
              hint="Around 77.31 for Faridabad."
            />
          </div>
        </Section>

        {/* ---------------- Media ---------------- */}
        <Section
          icon={MdCollections}
          title="Media"
          hint={`Cover photo, gallery (${previewCount}), brochure and video`}
        >
          <div style={{ marginBottom: 18 }}>
            <MediaInput
              label="Cover photo"
              value={form.thumbnail}
              onChange={(url) => set('thumbnail', url)}
              folder="properties"
              previewShape="wide"
              hint="Leave blank to use the first gallery image."
            />
          </div>

          <span className="rk-label">Gallery images</span>
          <div className="rk-adm-rows" style={{ marginBottom: 14 }}>
            {form.images.map((url, index) => (
              <div className="rk-adm-row rk-adm-row--single" key={`img-${index}`}>
                <MediaInput
                  compact
                  label={`Image ${index + 1}`}
                  value={url}
                  folder="properties"
                  previewShape="square"
                  onChange={(next) =>
                    setForm((p) => ({
                      ...p,
                      images: p.images.map((v, i) => (i === index ? next : v))
                    }))
                  }
                />
                <div className="rk-adm-row__tools">
                  <button
                    type="button"
                    className="rk-adm-iconbtn"
                    onClick={() => listMove('images', index, -1)}
                    disabled={index === 0}
                    aria-label={`Move image ${index + 1} earlier`}
                    title="Move up"
                  >
                    <MdArrowUpward aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="rk-adm-iconbtn"
                    onClick={() => listMove('images', index, 1)}
                    disabled={index === form.images.length - 1}
                    aria-label={`Move image ${index + 1} later`}
                    title="Move down"
                  >
                    <MdArrowDownward aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="rk-adm-iconbtn rk-adm-iconbtn--danger"
                    onClick={() => listRemove('images', index)}
                    aria-label={`Remove image ${index + 1}`}
                    title="Remove"
                  >
                    <MdDeleteOutline aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="rk-adm-addrow" onClick={() => listAdd('images', '')}>
            <MdAdd aria-hidden="true" />
            Add another image
          </button>

          <div className="rk-adm-grid rk-adm-grid--2" style={{ marginTop: 18 }}>
            <MediaInput
              label="Brochure (PDF)"
              value={form.brochureUrl}
              onChange={(url) => set('brochureUrl', url)}
              folder="brochures"
              accept="application/pdf"
              previewShape="none"
              hint="Upload the PDF, or paste a link to one you already host."
            />
            <Field
              label="Walkthrough video URL"
              name="videoUrl"
              type="url"
              value={form.videoUrl}
              onChange={onInput('videoUrl')}
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </div>
        </Section>

        {/* ---------------- Configurations ---------------- */}
        <Section
          icon={MdViewList}
          title="Configurations"
          hint="The size and price table on the property page"
        >
          <div className="rk-adm-rows">
            {form.configurations.length === 0 && (
              <p className="rk-adm-note">
                No configurations yet. Add one row per variant, e.g. “2 BHK + Study — 1,285 sq. ft. — ₹72 Lac”.
              </p>
            )}

            {form.configurations.map((row, index) => (
              <div className="rk-adm-row rk-adm-row--config" key={`cfg-${index}`}>
                <Field
                  label="Label"
                  name={`cfg-label-${index}`}
                  value={row.label}
                  placeholder="3 BHK + Servant"
                  onChange={(e) => listPatch('configurations', index, { label: e.target.value })}
                />
                <Field
                  label="Area"
                  name={`cfg-area-${index}`}
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={row.areaValue}
                  onChange={(e) => listPatch('configurations', index, { areaValue: e.target.value })}
                />
                <Field
                  as="select"
                  label="Unit"
                  name={`cfg-unit-${index}`}
                  options={AREA_UNITS}
                  value={row.areaUnit}
                  onChange={(e) => listPatch('configurations', index, { areaUnit: e.target.value })}
                />
                <Field
                  label="Price (₹)"
                  name={`cfg-price-${index}`}
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={row.price}
                  disabled={row.priceOnRequest}
                  onChange={(e) => listPatch('configurations', index, { price: e.target.value })}
                />
                <RowTools
                  label={`configuration ${index + 1}`}
                  onRemove={() => listRemove('configurations', index)}
                  onUp={() => listMove('configurations', index, -1)}
                  onDown={() => listMove('configurations', index, 1)}
                  canUp={index > 0}
                  canDown={index < form.configurations.length - 1}
                />
                <label className="rk-adm-check rk-adm-span-2" style={{ gridColumn: '1 / -1' }}>
                  <input
                    type="checkbox"
                    checked={row.priceOnRequest}
                    onChange={(e) =>
                      listPatch('configurations', index, { priceOnRequest: e.target.checked })
                    }
                  />
                  <span>
                    <strong>Price on request for this configuration</strong>
                    <small>Useful when only a few units are left and the rate changes weekly.</small>
                  </span>
                </label>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="rk-adm-addrow"
            style={{ marginTop: 14 }}
            onClick={() =>
              listAdd('configurations', {
                label: '',
                areaValue: '',
                areaUnit: form.areaUnit,
                price: '',
                priceOnRequest: false
              })
            }
          >
            <MdAdd aria-hidden="true" />
            Add configuration
          </button>
        </Section>

        {/* ---------------- Amenities ---------------- */}
        <Section icon={MdStarBorder} title="Amenities" hint={`${form.amenities.length} selected`}>
          <div className="rk-adm-grid">
            <TagInput
              label="Amenities"
              values={form.amenities}
              suggestions={AMENITY_SUGGESTIONS}
              placeholder="Start typing — e.g. Power Backup"
              hint="Names that match our icon list get a matching icon on the property page."
              onChange={(values) => set('amenities', values)}
            />
          </div>
        </Section>

        {/* ---------------- Highlights & nearby ---------------- */}
        <Section icon={MdSearch} title="Highlights &amp; nearby" hint="Selling points and travel times">
          <span className="rk-label">Highlights</span>
          <div className="rk-adm-rows" style={{ marginBottom: 14 }}>
            {form.highlights.length === 0 && (
              <p className="rk-adm-note">
                Add short selling points, e.g. “Corner unit with a park on two sides”.
              </p>
            )}
            {form.highlights.map((value, index) => (
              <div className="rk-adm-row rk-adm-row--single" key={`hl-${index}`}>
                <Field
                  label={`Highlight ${index + 1}`}
                  name={`highlight-${index}`}
                  value={value}
                  placeholder="Walking distance from the Sector 86 market"
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      highlights: p.highlights.map((v, i) => (i === index ? e.target.value : v))
                    }))
                  }
                />
                <RowTools
                  label={`highlight ${index + 1}`}
                  onRemove={() => listRemove('highlights', index)}
                  onUp={() => listMove('highlights', index, -1)}
                  onDown={() => listMove('highlights', index, 1)}
                  canUp={index > 0}
                  canDown={index < form.highlights.length - 1}
                />
              </div>
            ))}
          </div>
          <button type="button" className="rk-adm-addrow" onClick={() => listAdd('highlights', '')}>
            <MdAdd aria-hidden="true" />
            Add highlight
          </button>

          <span className="rk-label" style={{ marginTop: 22, display: 'block' }}>
            Nearby places
          </span>
          <div className="rk-adm-rows" style={{ marginBottom: 14 }}>
            {form.nearby.length === 0 && (
              <p className="rk-adm-note">
                Add landmarks with distances, e.g. “Amrita Hospital — 3.5 km”.
              </p>
            )}
            {form.nearby.map((row, index) => (
              <div className="rk-adm-row rk-adm-row--nearby" key={`nb-${index}`}>
                <Field
                  label="Place"
                  name={`nearby-label-${index}`}
                  value={row.label}
                  placeholder="Amrita Hospital, Sector 88"
                  onChange={(e) => listPatch('nearby', index, { label: e.target.value })}
                />
                <Field
                  label="Distance"
                  name={`nearby-distance-${index}`}
                  value={row.distance}
                  placeholder="3.5 km"
                  onChange={(e) => listPatch('nearby', index, { distance: e.target.value })}
                />
                <RowTools
                  label={`nearby place ${index + 1}`}
                  onRemove={() => listRemove('nearby', index)}
                  onUp={() => listMove('nearby', index, -1)}
                  onDown={() => listMove('nearby', index, 1)}
                  canUp={index > 0}
                  canDown={index < form.nearby.length - 1}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="rk-adm-addrow"
            onClick={() => listAdd('nearby', { label: '', distance: '' })}
          >
            <MdAdd aria-hidden="true" />
            Add nearby place
          </button>
        </Section>

        {/* ---------------- Flags ---------------- */}
        <Section icon={MdFlag} title="Visibility &amp; badges" hint="Where this listing appears">
          <div className="rk-adm-checks">
            <label className="rk-adm-check">
              <input type="checkbox" checked={form.isFeatured} onChange={onInput('isFeatured')} />
              <span>
                <strong>Featured</strong>
                <small>Appears in “Properties in Faridabad” on the home page.</small>
              </span>
            </label>
            <label className="rk-adm-check">
              <input type="checkbox" checked={form.isTrending} onChange={onInput('isTrending')} />
              <span>
                <strong>Trending</strong>
                <small>Shown in the trending strip on the home page.</small>
              </span>
            </label>
            <label className="rk-adm-check">
              <input type="checkbox" checked={form.isActive} onChange={onInput('isActive')} />
              <span>
                <strong>Visible on the website</strong>
                <small>Switch off to hide the listing without deleting it.</small>
              </span>
            </label>
          </div>

          <div className="rk-adm-grid rk-adm-grid--2" style={{ marginTop: 16 }}>
            <TagInput
              label="Badges"
              values={form.badges}
              suggestions={BADGE_SUGGESTIONS}
              placeholder="RERA Approved"
              hint="Small gold labels on the property card."
              onChange={(values) => set('badges', values)}
            />
            <Field
              label="Sort order"
              name="order"
              type="number"
              min="0"
              inputMode="numeric"
              value={form.order}
              onChange={onInput('order')}
              hint="Lower numbers appear first in the default listing order. Default is 100."
            />
          </div>
        </Section>

        {/* ---------------- SEO ---------------- */}
        <Section icon={MdSearch} title="Search engine listing" hint="How this page shows on Google">
          <div className="rk-adm-grid rk-adm-grid--2">
            <Field
              className="rk-adm-span-2"
              label="Meta title"
              name="seo.metaTitle"
              value={form.seo.metaTitle}
              onChange={onInput('seo.metaTitle')}
              maxLength={70}
              placeholder="3 BHK in Sector 86 Faridabad | Rama Kripa Estates"
              hint={`${form.seo.metaTitle.length}/70 characters. Leave blank to use the listing title.`}
            />
            <Field
              as="textarea"
              className="rk-adm-span-2"
              label="Meta description"
              name="seo.metaDescription"
              rows={3}
              value={form.seo.metaDescription}
              onChange={onInput('seo.metaDescription')}
              maxLength={170}
              placeholder="Park-facing 3 BHK builder floor in Sector 86, Greater Faridabad. Ready to move, covered parking, RERA registered."
              hint={`${form.seo.metaDescription.length}/170 characters.`}
            />
            <TagInput
              label="Keywords"
              values={form.seo.keywords}
              placeholder="3 bhk in faridabad"
              hint="A handful of phrases buyers actually search for."
              onChange={(values) => set('seo.keywords', values)}
            />
          </div>
        </Section>

        {/* ---------------- Sticky save bar ---------------- */}
        <div className="rk-adm-footbar">
          <p className="rk-adm-footbar__note">
            {isEdit
              ? 'Changes go live on the website as soon as you save.'
              : 'The listing is published as soon as you save. Uncheck “Visible on the website” first if you are not ready.'}
          </p>
          <div className="rk-adm-footbar__actions">
            <Link className="rk-btn rk-btn--ghost rk-btn--md" to="/admin/properties">
              Cancel
            </Link>
            <button type="submit" className="rk-btn rk-btn--gold rk-btn--md" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish property'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
