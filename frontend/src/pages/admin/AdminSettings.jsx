import { useEffect, useState } from 'react'
import {
  MdAdd,
  MdArrowDownward,
  MdArrowUpward,
  MdCall,
  MdDeleteOutline,
  MdErrorOutline,
  MdExpandMore,
  MdInfoOutline,
  MdMap,
  MdRefresh,
  MdStar,
  MdWhatsapp
} from 'react-icons/md'
import Field from '../../components/forms/Field'
import MediaInput from '../../components/forms/MediaInput'
import Loader from '../../components/ui/Loader'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../api/client'
import { getToken, handleAuthError } from './auth'
import './admin.css'

const SOCIALS = [
  { key: 'facebook', label: 'Facebook page', placeholder: 'https://www.facebook.com/ramakripaestate' },
  { key: 'instagram', label: 'Instagram profile', placeholder: 'https://www.instagram.com/ramakripaestate' },
  { key: 'youtube', label: 'YouTube channel', placeholder: 'https://www.youtube.com/@ramakripaestate' },
  { key: 'linkedin', label: 'LinkedIn page', placeholder: 'https://www.linkedin.com/company/ramakripaestate' },
  { key: 'twitter', label: 'X (Twitter) profile', placeholder: 'https://x.com/ramakripaestate' }
]

const BLANK_SLIDE = { image: '', alt: '', eyebrow: '', title: '', subtitle: '' }
const BLANK_STAT = { label: '', value: '', suffix: '+' }

const EMPTY = {
  brandName: 'Rama Kripa Estates',
  tagline: 'Blessings in Every Address',
  phones: [''],
  email: '',
  whatsapp: '',
  address: '',
  hours: '',
  socials: { facebook: '', instagram: '', youtube: '', linkedin: '', twitter: '' },
  mapEmbedUrl: '',
  directionsUrl: '',
  about: '',
  heroSlides: [],
  stats: [],
  reraNumber: '',
  footerNote: ''
}

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

export default function AdminSettings() {
  const toast = useToast()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.settings()
      const doc = res.data || {}
      setForm({
        ...EMPTY,
        ...doc,
        phones: doc.phones?.length ? doc.phones : [''],
        socials: { ...EMPTY.socials, ...(doc.socials || {}) },
        heroSlides: (doc.heroSlides || []).map((s) => ({ ...BLANK_SLIDE, ...s })),
        stats: (doc.stats || []).map((s) => ({ ...BLANK_STAT, ...s, value: String(s.value ?? '') }))
      })
    } catch (err) {
      if (handleAuthError(err)) return
      setError(err.message || 'We could not load your site settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Site settings — Rama Kripa Estates Admin'
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (name, value) =>
    setForm((prev) => {
      if (!name.includes('.')) return { ...prev, [name]: value }
      const [group, key] = name.split('.')
      return { ...prev, [group]: { ...prev[group], [key]: value } }
    })

  const onInput = (name) => (e) => set(name, e.target.value)

  const listAdd = (key, blank) => setForm((p) => ({ ...p, [key]: [...p[key], blank] }))
  const listRemove = (key, index) => setForm((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== index) }))
  const listPatch = (key, index, patch) =>
    setForm((p) => ({ ...p, [key]: p[key].map((row, i) => (i === index ? { ...row, ...patch } : row)) }))
  const listMove = (key, index, delta) =>
    setForm((p) => {
      const next = [...p[key]]
      const target = index + delta
      if (target < 0 || target >= next.length) return p
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...p, [key]: next }
    })

  const handleSubmit = async (event) => {
    event.preventDefault()

    const next = {}
    const phones = form.phones.map((p) => p.trim()).filter(Boolean)
    if (!phones.length) next.phones = 'Add at least one phone number — it appears in the header and footer.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address, e.g. info@ramakripaestate.com.'
    }
    if (form.mapEmbedUrl && !form.mapEmbedUrl.includes('output=embed')) {
      next.mapEmbedUrl = 'A Google Maps embed URL must end with "&output=embed".'
    }
    setErrors(next)

    if (Object.keys(next).length) {
      toast.error('Please check the form', 'Some contact details are missing or invalid.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        brandName: form.brandName.trim() || 'Rama Kripa Estates',
        tagline: form.tagline.trim(),
        phones,
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        address: form.address.trim(),
        hours: form.hours.trim(),
        socials: Object.fromEntries(SOCIALS.map((s) => [s.key, (form.socials[s.key] || '').trim()])),
        mapEmbedUrl: form.mapEmbedUrl.trim(),
        directionsUrl: form.directionsUrl.trim(),
        about: form.about.trim(),
        heroSlides: form.heroSlides
          .filter((s) => s.image.trim())
          .map((s) => ({
            image: s.image.trim(),
            alt: s.alt.trim(),
            eyebrow: s.eyebrow.trim(),
            title: s.title.trim(),
            subtitle: s.subtitle.trim()
          })),
        stats: form.stats
          .filter((s) => s.label.trim() && String(s.value).trim() !== '')
          .map((s) => ({
            label: s.label.trim(),
            value: Number(s.value) || 0,
            suffix: s.suffix.trim()
          })),
        reraNumber: form.reraNumber.trim(),
        footerNote: form.footerNote.trim()
      }

      await api.admin.updateSettings(payload, getToken())
      toast.success('Settings saved', 'The new details are live across every page of the website.')
    } catch (err) {
      if (handleAuthError(err)) return
      if (err.errors) setErrors(err.errors)
      toast.error('Could not save', err.message || 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader full label="Loading your site settings…" />

  return (
    <div className="rk-adm">
      <header className="rk-adm-head">
        <div className="rk-adm-head__text">
          <h2 className="rk-adm-head__title">Site settings</h2>
          <p className="rk-adm-head__sub">
            The phone numbers, address, social links, map and hero slides used on every page of
            ramakripaestate.com. Change them here and the whole website updates.
          </p>
        </div>
        <div className="rk-adm-head__actions">
          <button type="button" className="rk-btn rk-btn--outline rk-btn--sm" onClick={load} disabled={saving}>
            <MdRefresh className="rk-btn__icon" aria-hidden="true" />
            Reload
          </button>
        </div>
      </header>

      {error && (
        <p className="rk-adm-alert" role="alert">
          <MdErrorOutline aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      <form className="rk-adm-form" onSubmit={handleSubmit} noValidate>
        {/* ---------------- Contact ---------------- */}
        <Section icon={MdCall} title="Contact details" hint="Header, footer and contact page" defaultOpen>
          <span className="rk-label">Phone numbers</span>
          {errors.phones && (
            <p className="rk-error" role="alert" style={{ marginBottom: 8 }}>
              <MdErrorOutline aria-hidden="true" />
              <span>{errors.phones}</span>
            </p>
          )}

          <div className="rk-adm-rows" style={{ marginBottom: 14 }}>
            {form.phones.map((phone, index) => (
              <div className="rk-adm-row rk-adm-row--single" key={`phone-${index}`}>
                <Field
                  label={index === 0 ? 'Primary number' : `Number ${index + 1}`}
                  name={`phone-${index}`}
                  type="tel"
                  value={phone}
                  placeholder="+91 98110 00000"
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      phones: p.phones.map((v, i) => (i === index ? e.target.value : v))
                    }))
                  }
                />
                <div className="rk-adm-row__tools">
                  <button
                    type="button"
                    className="rk-adm-iconbtn"
                    onClick={() => listMove('phones', index, -1)}
                    disabled={index === 0}
                    aria-label={`Move phone number ${index + 1} up`}
                    title="Move up"
                  >
                    <MdArrowUpward aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="rk-adm-iconbtn"
                    onClick={() => listMove('phones', index, 1)}
                    disabled={index === form.phones.length - 1}
                    aria-label={`Move phone number ${index + 1} down`}
                    title="Move down"
                  >
                    <MdArrowDownward aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="rk-adm-iconbtn rk-adm-iconbtn--danger"
                    onClick={() => listRemove('phones', index)}
                    disabled={form.phones.length === 1}
                    aria-label={`Remove phone number ${index + 1}`}
                    title="Remove"
                  >
                    <MdDeleteOutline aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="rk-adm-addrow" onClick={() => listAdd('phones', '')}>
            <MdAdd aria-hidden="true" />
            Add another number
          </button>

          <div className="rk-adm-grid rk-adm-grid--2" style={{ marginTop: 18 }}>
            <Field
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={onInput('email')}
              error={errors.email}
              placeholder="info@ramakripaestate.com"
            />
            <Field
              label="WhatsApp number"
              name="whatsapp"
              type="tel"
              icon={<MdWhatsapp />}
              value={form.whatsapp}
              onChange={onInput('whatsapp')}
              placeholder="+919811000000"
              hint="Used by the floating WhatsApp button. Include the 91 country code."
            />
            <Field
              className="rk-adm-span-2"
              label="Office address"
              name="address"
              value={form.address}
              onChange={onInput('address')}
              placeholder="SCO 12, Sector 88, Greater Faridabad, Haryana 121002"
            />
            <Field
              label="Opening hours"
              name="hours"
              value={form.hours}
              onChange={onInput('hours')}
              placeholder="10:00 - 19:00, Mon-Sun"
            />
            <Field
              label="HRERA agent number"
              name="reraNumber"
              value={form.reraNumber}
              onChange={onInput('reraNumber')}
              placeholder="HRERA/FBD/AGENT/2019/0142"
            />
          </div>
        </Section>

        {/* ---------------- Social ---------------- */}
        <Section icon={MdStar} title="Social profiles" hint="Icons in the top bar and footer">
          <div className="rk-adm-grid rk-adm-grid--2">
            {SOCIALS.map((social) => (
              <Field
                key={social.key}
                label={social.label}
                name={`socials.${social.key}`}
                type="url"
                value={form.socials[social.key] || ''}
                onChange={onInput(`socials.${social.key}`)}
                placeholder={social.placeholder}
              />
            ))}
          </div>
          <p className="rk-adm-note" style={{ marginTop: 12 }}>
            Leave a field blank to hide that icon everywhere on the site.
          </p>
        </Section>

        {/* ---------------- Map ---------------- */}
        <Section icon={MdMap} title="Map &amp; directions" hint="Contact page and home page map band">
          <div className="rk-adm-grid">
            <Field
              label="Google Maps embed URL"
              name="mapEmbedUrl"
              type="url"
              value={form.mapEmbedUrl}
              onChange={onInput('mapEmbedUrl')}
              error={errors.mapEmbedUrl}
              placeholder="https://www.google.com/maps?q=Sector+88,+Greater+Faridabad,+Haryana+121002&output=embed"
              hint='On Google Maps, search the office address, then use the link with "&output=embed" at the end. No API key needed.'
            />
            <Field
              label="Get directions link"
              name="directionsUrl"
              type="url"
              value={form.directionsUrl}
              onChange={onInput('directionsUrl')}
              placeholder="https://www.google.com/maps/dir/?api=1&destination=Sector+88,+Greater+Faridabad,+Haryana+121002"
            />
          </div>

          {form.mapEmbedUrl.trim() && (
            <div style={{ marginTop: 16 }}>
              <span className="rk-label">Preview</span>
              <iframe
                title="Office location preview"
                src={form.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                style={{
                  width: '100%',
                  height: 260,
                  border: '1px solid var(--rk-line)',
                  borderRadius: 'var(--rk-r-md)'
                }}
              />
            </div>
          )}
        </Section>

        {/* ---------------- Hero slides ---------------- */}
        <Section
          icon={MdStar}
          title="Home page hero slides"
          hint={`${form.heroSlides.length} ${form.heroSlides.length === 1 ? 'slide' : 'slides'} in the slideshow`}
        >
          <div className="rk-adm-rows">
            {form.heroSlides.length === 0 && (
              <p className="rk-adm-note">
                No slides yet. Add two or three wide photographs of Faridabad with a headline for each.
              </p>
            )}

            {form.heroSlides.map((slide, index) => (
              <div className="rk-adm-row" key={`slide-${index}`}>
                <div
                  className="rk-adm-imgrow"
                  style={{ background: 'var(--rk-white)', gridTemplateColumns: '1fr auto' }}
                >
                  <MediaInput
                    label={`Slide ${index + 1} image`}
                    id={`slide-image-${index}`}
                    value={slide.image}
                    onChange={(url) => listPatch('heroSlides', index, { image: url })}
                    folder="hero"
                    previewShape="square"
                    compact
                  />
                  <div className="rk-adm-imgrow__tools">
                    <button
                      type="button"
                      className="rk-adm-iconbtn"
                      onClick={() => listMove('heroSlides', index, -1)}
                      disabled={index === 0}
                      aria-label={`Move slide ${index + 1} earlier`}
                      title="Move up"
                    >
                      <MdArrowUpward aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="rk-adm-iconbtn"
                      onClick={() => listMove('heroSlides', index, 1)}
                      disabled={index === form.heroSlides.length - 1}
                      aria-label={`Move slide ${index + 1} later`}
                      title="Move down"
                    >
                      <MdArrowDownward aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="rk-adm-iconbtn rk-adm-iconbtn--danger"
                      onClick={() => listRemove('heroSlides', index)}
                      aria-label={`Remove slide ${index + 1}`}
                      title="Remove"
                    >
                      <MdDeleteOutline aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="rk-adm-grid rk-adm-grid--2" style={{ gridColumn: '1 / -1' }}>
                  <Field
                    label="Eyebrow"
                    name={`slide-eyebrow-${index}`}
                    value={slide.eyebrow}
                    placeholder="Faridabad Real Estate Consultants"
                    onChange={(e) => listPatch('heroSlides', index, { eyebrow: e.target.value })}
                  />
                  <Field
                    label="Headline"
                    name={`slide-title-${index}`}
                    value={slide.title}
                    placeholder="Looking For Luxury Homes in Faridabad?"
                    onChange={(e) => listPatch('heroSlides', index, { title: e.target.value })}
                  />
                  <Field
                    className="rk-adm-span-2"
                    label="Caption"
                    name={`slide-subtitle-${index}`}
                    value={slide.subtitle}
                    placeholder="Handpicked apartments, floors and plots across Neharpar, Sector 88 and Old Faridabad."
                    onChange={(e) => listPatch('heroSlides', index, { subtitle: e.target.value })}
                  />
                  <Field
                    className="rk-adm-span-2"
                    label="Image description (alt text)"
                    name={`slide-alt-${index}`}
                    value={slide.alt}
                    placeholder="High rise apartment towers in Greater Faridabad at dusk"
                    hint="Read aloud by screen readers and shown if the photo fails to load."
                    onChange={(e) => listPatch('heroSlides', index, { alt: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="rk-adm-addrow"
            style={{ marginTop: 14 }}
            onClick={() => listAdd('heroSlides', { ...BLANK_SLIDE })}
          >
            <MdAdd aria-hidden="true" />
            Add a slide
          </button>
        </Section>

        {/* ---------------- About & stats ---------------- */}
        <Section icon={MdInfoOutline} title="About &amp; counters" hint="Footer blurb and the stats band">
          <div className="rk-adm-grid">
            <Field
              label="Brand name"
              name="brandName"
              value={form.brandName}
              onChange={onInput('brandName')}
              placeholder="Rama Kripa Estates"
            />
            <Field
              label="Tagline"
              name="tagline"
              value={form.tagline}
              onChange={onInput('tagline')}
              placeholder="Blessings in Every Address"
            />
            <Field
              as="textarea"
              label="About the company"
              name="about"
              rows={6}
              value={form.about}
              onChange={onInput('about')}
              hint="Used on the About page and in the footer. Two or three sentences about your Faridabad practice."
              placeholder="Rama Kripa Estates is a Faridabad-born property consultancy working only in this city and its immediate belt…"
            />
            <Field
              as="textarea"
              label="Footer disclaimer"
              name="footerNote"
              rows={3}
              value={form.footerNote}
              onChange={onInput('footerNote')}
              placeholder="Rama Kripa Estates is a registered property consultant. All prices are indicative and subject to change."
            />
          </div>

          <span className="rk-label" style={{ marginTop: 18, display: 'block' }}>
            Counters on the stats band
          </span>
          <div className="rk-adm-rows" style={{ marginBottom: 14 }}>
            {form.stats.length === 0 && (
              <p className="rk-adm-note">
                No counters yet. Add four, e.g. “Years in Faridabad — 18 +”.
              </p>
            )}
            {form.stats.map((stat, index) => (
              <div className="rk-adm-row rk-adm-row--nearby" key={`stat-${index}`}>
                <Field
                  label="Label"
                  name={`stat-label-${index}`}
                  value={stat.label}
                  placeholder="Happy Families"
                  onChange={(e) => listPatch('stats', index, { label: e.target.value })}
                />
                <Field
                  label="Number"
                  name={`stat-value-${index}`}
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={stat.value}
                  placeholder="1200"
                  onChange={(e) => listPatch('stats', index, { value: e.target.value })}
                />
                <div className="rk-adm-row__tools">
                  <button
                    type="button"
                    className="rk-adm-iconbtn"
                    onClick={() => listMove('stats', index, -1)}
                    disabled={index === 0}
                    aria-label={`Move counter ${index + 1} up`}
                    title="Move up"
                  >
                    <MdArrowUpward aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="rk-adm-iconbtn"
                    onClick={() => listMove('stats', index, 1)}
                    disabled={index === form.stats.length - 1}
                    aria-label={`Move counter ${index + 1} down`}
                    title="Move down"
                  >
                    <MdArrowDownward aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="rk-adm-iconbtn rk-adm-iconbtn--danger"
                    onClick={() => listRemove('stats', index)}
                    aria-label={`Remove counter ${index + 1}`}
                    title="Remove"
                  >
                    <MdDeleteOutline aria-hidden="true" />
                  </button>
                </div>
                <Field
                  className="rk-adm-span-2"
                  label="Suffix"
                  name={`stat-suffix-${index}`}
                  value={stat.suffix}
                  placeholder="+"
                  hint="Shown after the number, e.g. “+” or “ Cr”."
                  onChange={(e) => listPatch('stats', index, { suffix: e.target.value })}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="rk-adm-addrow"
            onClick={() => listAdd('stats', { ...BLANK_STAT })}
          >
            <MdAdd aria-hidden="true" />
            Add a counter
          </button>
        </Section>

        <div className="rk-adm-footbar">
          <p className="rk-adm-footbar__note">
            These details appear on every page — check the phone number and address before saving.
          </p>
          <div className="rk-adm-footbar__actions">
            <button
              type="button"
              className="rk-btn rk-btn--ghost rk-btn--md"
              onClick={load}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="rk-btn rk-btn--gold rk-btn--md" disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
