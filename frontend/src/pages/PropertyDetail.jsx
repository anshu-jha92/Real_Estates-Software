import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  MdArrowBack,
  MdArrowOutward,
  MdDownload,
  MdEventAvailable,
  MdLocationOn,
  MdPhoneInTalk,
  MdSearchOff,
  MdWhatsapp
} from 'react-icons/md'
import Breadcrumb from '../components/layout/Breadcrumb'
import ImageGallery from '../components/property/ImageGallery'
import ConfigTable from '../components/property/ConfigTable'
import AmenityList from '../components/property/AmenityList'
import ShareRow from '../components/property/ShareRow'
import SimilarProperties from '../components/property/SimilarProperties'
import EnquiryForm from '../components/forms/EnquiryForm'
import Logo from '../components/brand/Logo'
import MapEmbed from '../components/ui/MapEmbed'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import useFetch from '../hooks/useFetch'
import useSeo from '../hooks/useSeo'
import { api } from '../api/client'
import { useSite } from '../context/SiteContext'
import {
  bhkLabel,
  categoryLabel,
  formatArea,
  formatNumber,
  formatPrice,
  furnishingLabel,
  listingLabel,
  locationLine,
  phoneHref,
  statusLabel,
  truncate,
  whatsappHref
} from '../utils/format'
import './PropertyDetail.css'

/** Which listing route a category belongs to, for the breadcrumb. */
const CATEGORY_ROUTE = {
  residential: '/residential',
  commercial: '/commercial',
  plots: '/plots',
  rent: '/rent',
  'office-space': '/office-spaces'
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Description text -> paragraphs, so line breaks in the CMS survive. */
function toParagraphs(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Full-page shimmer that matches the real layout, so nothing jumps. */
function DetailSkeleton() {
  return (
    <div className="rk-pd__skeleton" role="status" aria-live="polite">
      <span className="sr-only">Loading property details…</span>

      <div className="rk-container">
        <span className="rk-skeleton rk-pd__sk-crumbs" />
        <span className="rk-skeleton rk-pd__sk-title" />
        <span className="rk-skeleton rk-pd__sk-sub" />
        <span className="rk-skeleton rk-pd__sk-gallery" />

        <div className="rk-pd__sk-body">
          <div className="rk-pd__sk-main">
            <span className="rk-skeleton rk-pd__sk-block" />
            <span className="rk-skeleton rk-pd__sk-line" />
            <span className="rk-skeleton rk-pd__sk-line" />
            <span className="rk-skeleton rk-pd__sk-line rk-pd__sk-line--short" />
            <span className="rk-skeleton rk-pd__sk-block" />
          </div>
          <span className="rk-skeleton rk-pd__sk-aside" />
        </div>
      </div>
    </div>
  )
}

/**
 * Property detail — BUILD_SPEC §8.
 *
 * `GET /api/properties/:slug` returns `{ data, similar }`. Everything below is
 * rendered defensively: a seeded property may be missing RERA, possession,
 * configurations or coordinates, and each block simply disappears when it has
 * nothing real to show.
 */
export default function PropertyDetail() {
  const { slug } = useParams()
  const { settings } = useSite()

  const { data: payload, loading, error } = useFetch(
    (signal) => api.property(slug, { signal }),
    [slug]
  )

  const property = payload?.data || null
  const similar = Array.isArray(payload?.similar) ? payload.similar : []

  /* The configuration a visitor clicked "Enquire" on, if any. Handing the form
     a property whose title carries the configuration is all it takes to
     prefill the message with it. */
  const [config, setConfig] = useState(null)
  const [visitOpen, setVisitOpen] = useState(false)

  const enquiryRef = useRef(null)

  const scrollToEnquiry = useCallback(() => {
    const el = enquiryRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    })
    const field = el.querySelector('input:not([type="hidden"]), textarea')
    if (field) field.focus({ preventScroll: true })
  }, [])

  const handleConfigEnquire = useCallback(
    (row) => {
      setConfig(row || null)
      scrollToEnquiry()
    },
    [scrollToEnquiry]
  )

  /* ---------- Derived content ---------- */
  const loc = property?.location || {}

  const priceText = formatPrice(property?.price, {
    priceOnRequest: property?.priceOnRequest,
    priceUnit: property?.priceUnit || 'total',
    maxPrice: property?.maxPrice
  })

  const enquiryProperty = useMemo(() => {
    if (!property) return null
    if (!config) return property
    const label = config.label || 'selected configuration'
    const area = config.areaValue
      ? ` (${formatArea(config.areaValue, null, config.areaUnit || property.areaUnit || 'sqft')})`
      : ''
    return { ...property, title: `${property.title} — ${label}${area}` }
  }, [property, config])

  const overview = useMemo(() => {
    if (!property) return []
    const configuration = [
      bhkLabel(property.bedrooms),
      property.bathrooms ? `${property.bathrooms} Bath` : '',
      property.balconies ? `${property.balconies} Balcony` : ''
    ]
      .filter(Boolean)
      .join(' · ')

    return [
      property.propertyType && { label: 'Property Type', value: property.propertyType },
      configuration && { label: 'Configuration', value: configuration },
      (property.areaMin || property.areaMax) && {
        label: 'Area',
        value: formatArea(property.areaMin, property.areaMax, property.areaUnit || 'sqft')
      },
      property.status && { label: 'Status', value: statusLabel(property.status) },
      property.possession && { label: 'Possession', value: property.possession },
      property.floorsTotal && {
        label: 'Total Floors',
        value: formatNumber(property.floorsTotal)
      },
      property.parking && {
        label: 'Parking',
        value: `${formatNumber(property.parking)} ${Number(property.parking) === 1 ? 'space' : 'spaces'}`
      },
      property.furnishing && { label: 'Furnishing', value: furnishingLabel(property.furnishing) },
      property.reraNumber && { label: 'RERA No.', value: property.reraNumber }
    ].filter(Boolean)
  }, [property])

  const paragraphs = useMemo(
    () => toParagraphs(property?.description || property?.shortDescription),
    [property]
  )

  const fullAddress = useMemo(() => {
    const parts = [
      loc.address,
      loc.landmark ? `Near ${loc.landmark}` : '',
      loc.sector,
      loc.locality,
      loc.city,
      loc.state,
      loc.pincode
    ].filter(Boolean)
    return parts.filter((part, i) => parts.indexOf(part) === i).join(', ')
  }, [loc.address, loc.landmark, loc.sector, loc.locality, loc.city, loc.state, loc.pincode])

  const nearby = Array.isArray(property?.nearby)
    ? property.nearby.filter((item) => item && item.label)
    : []

  const badges = useMemo(() => {
    const list = []
    if (property?.status) list.push({ text: statusLabel(property.status), tone: 'gold' })
    if (property?.listingType) list.push({ text: listingLabel(property.listingType), tone: 'green' })
    if (property?.category) list.push({ text: categoryLabel(property.category), tone: 'dark' })
    ;(Array.isArray(property?.badges) ? property.badges : []).forEach((text) => {
      if (text) list.push({ text, tone: 'gold' })
    })
    return list
  }, [property])

  const phone = settings?.phones?.[0] || '+91 98110 00000'
  const whatsappNumber = settings?.whatsapp || phone

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  // The link goes in the message on purpose: WhatsApp turns it into a preview
  // card with this listing's photo and price, so the office sees at a glance
  // which property is being asked about.
  const whatsappMessage = property
    ? `Hello Rama Kripa Estates, I saw ${property.title} in ${locationLine(loc) || 'Faridabad'} on your website. Please share the price list and site visit slots.

${shareUrl}`
    : 'Hello Rama Kripa Estates, I would like to know more about property in Faridabad.'

  /* ---------- SEO ---------- */
  useSeo({
    title: property
      ? property.seo?.metaTitle ||
        `${property.title}, ${locationLine(loc) || 'Faridabad'} — ${priceText}`
      : loading
        ? 'Loading property'
        : 'Property not found',
    description: property
      ? property.seo?.metaDescription ||
        truncate(
          property.shortDescription || paragraphs[0] || `${property.title} in Faridabad.`,
          158
        )
      : 'This Faridabad listing is no longer available. Browse our current flats, plots, shops and office spaces.',
    keywords: Array.isArray(property?.seo?.keywords) ? property.seo.keywords.join(', ') : undefined,
    image: property?.thumbnail || property?.images?.[0]
  })

  /* ---------- Loading ---------- */
  if (loading) return <DetailSkeleton />

  /* ---------- Not found / failed ---------- */
  if (!property) {
    const notFound = error?.status === 404 || !error
    return (
      <div className="rk-pd rk-pd--missing">
        <div className="rk-container">
          <EmptyState
            icon={MdSearchOff}
            tone={notFound ? 'default' : 'error'}
            title={notFound ? 'This property is no longer listed' : 'We could not load this property'}
            message={
              notFound
                ? 'It may have been sold, rented out or taken off the market. We almost always have something comparable in the same Faridabad sector — tell us what you were looking at and we will send options the same day.'
                : `${error?.message || 'Something went wrong.'} Please try again, or call us on ${phone}.`
            }
            action={
              <div className="rk-pd__missingactions">
                <Link className="rk-btn rk-btn--gold" to="/properties">
                  <MdArrowBack className="rk-btn__icon" aria-hidden="true" />
                  Browse all properties
                </Link>
                <a className="rk-btn rk-btn--outline" href={phoneHref(phone)}>
                  <MdPhoneInTalk className="rk-btn__icon" aria-hidden="true" />
                  Call {phone}
                </a>
              </div>
            }
          />
        </div>
      </div>
    )
  }

  /* ---------- Loaded ---------- */
  const categoryRoute = CATEGORY_ROUTE[property.category] || '/properties'

  return (
    <div className="rk-pd">
      <div className="rk-container">
        <Breadcrumb
          className="rk-pd__crumbs"
          items={[
            { label: 'Home', to: '/' },
            { label: categoryLabel(property.category), to: categoryRoute },
            { label: property.title }
          ]}
        />

        {/* ---------- Title block ---------- */}
        <header className="rk-pd__head">
          <div className="rk-pd__headmain">
            {badges.length > 0 && (
              <ul className="rk-pd__badges">
                {badges.map((badge, index) => (
                  <li key={`${badge.text}-${index}`}>
                    <span className={`rk-badge rk-badge--${badge.tone}`}>{badge.text}</span>
                  </li>
                ))}
              </ul>
            )}

            <h1 className="rk-h2 rk-pd__title">{property.title}</h1>

            <p className="rk-pd__place">
              <MdLocationOn aria-hidden="true" />
              <span>{locationLine(loc) || 'Faridabad, Haryana'}</span>
            </p>
          </div>

          <div className="rk-pd__headside">
            <p className="rk-pd__pricelabel">
              {property.listingType === 'rent' ? 'Monthly rent' : 'Price'}
            </p>
            <p className="rk-pd__price">{priceText}</p>
            <button type="button" className="rk-btn rk-btn--gold" onClick={scrollToEnquiry}>
              Enquire Now
              <MdArrowOutward className="rk-btn__icon" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* ---------- Gallery ---------- */}
        <ImageGallery
          className="rk-pd__gallery"
          images={property.images}
          title={property.title}
        />

        {/* ---------- Two-column body ---------- */}
        <div className="rk-pd__body">
          {/* Column 1, part 1 — overview + description */}
          <div className="rk-pd__maintop">
            {overview.length > 0 && (
              <section className="rk-pd__block" aria-labelledby="rk-pd-overview">
                <h2 className="rk-pd__blocktitle" id="rk-pd-overview">
                  Overview
                </h2>

                <dl className="rk-pd__stats">
                  {overview.map((item) => (
                    <div className="rk-pd__stat" key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {paragraphs.length > 0 && (
              <section className="rk-pd__block" aria-labelledby="rk-pd-about">
                <h2 className="rk-pd__blocktitle" id="rk-pd-about">
                  About {property.title}
                </h2>

                <div className="rk-pd__prose">
                  {paragraphs.map((text, index) => (
                    <p key={`para-${index}`}>{text}</p>
                  ))}
                </div>

                {Array.isArray(property.highlights) && property.highlights.length > 0 && (
                  <ul className="rk-pd__highlights">
                    {property.highlights.filter(Boolean).map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>

          {/* Column 2 — sticky enquiry card (moves under the description on mobile) */}
          <aside className="rk-pd__aside" aria-label="Contact Rama Kripa Estates">
            <div className="rk-pd__card" ref={enquiryRef}>
              <div className="rk-pd__cardhead">
                <Logo showTagline={false} size={42} />
                <p className="rk-pd__cardbrand">Rama Kripa Estates</p>
                <p className="rk-pd__cardnote">
                  Faridabad property advisors since 2007. Talk to the person who has actually
                  walked this project.
                </p>
              </div>

              <div className="rk-pd__cardactions">
                <a className="rk-btn rk-btn--green rk-btn--block" href={phoneHref(phone)}>
                  <MdPhoneInTalk className="rk-btn__icon" aria-hidden="true" />
                  {phone}
                </a>

                <a
                  className="rk-btn rk-btn--outline rk-btn--block rk-pd__whatsapp"
                  href={whatsappHref(whatsappNumber, whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MdWhatsapp className="rk-btn__icon" aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              </div>

              <EnquiryForm
                property={enquiryProperty}
                source="property-detail"
                compact
                title="Send an enquiry"
                subtitle="We reply within one working day, usually the same afternoon."
                className="rk-pd__form"
              />

              <div className="rk-pd__cardfoot">
                {property.brochureUrl && (
                  <a
                    className="rk-btn rk-btn--ghost rk-btn--block"
                    href={property.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <MdDownload className="rk-btn__icon" aria-hidden="true" />
                    Download Brochure
                  </a>
                )}

                <button
                  type="button"
                  className="rk-btn rk-btn--outline rk-btn--block"
                  onClick={() => setVisitOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={visitOpen}
                >
                  <MdEventAvailable className="rk-btn__icon" aria-hidden="true" />
                  Schedule a Site Visit
                </button>

                <p className="rk-pd__cardhours">
                  Office hours {settings?.hours || '10:00 - 19:00, Mon-Sun'}
                </p>
              </div>
            </div>
          </aside>

          {/* Column 1, part 2 — everything below the description */}
          <div className="rk-pd__mainrest">
            <section className="rk-pd__block" aria-labelledby="rk-pd-configs">
              <h2 className="rk-pd__blocktitle" id="rk-pd-configs">
                Configurations &amp; Pricing
              </h2>

              <ConfigTable
                configurations={property.configurations}
                areaUnit={property.areaUnit || 'sqft'}
                priceUnit={property.priceUnit || 'total'}
                onEnquire={handleConfigEnquire}
              />

              <p className="rk-pd__blocknote">
                Prices are basic sale price and exclude stamp duty, registry charges, GST where
                applicable and any developer-levied EDC or IDC. We will hand you a written cost
                sheet before you pay a token amount.
              </p>
            </section>

            {Array.isArray(property.amenities) && property.amenities.length > 0 && (
              <section className="rk-pd__block" aria-labelledby="rk-pd-amenities">
                <h2 className="rk-pd__blocktitle" id="rk-pd-amenities">
                  Amenities
                </h2>
                <AmenityList amenities={property.amenities} />
              </section>
            )}

            <section className="rk-pd__block" aria-labelledby="rk-pd-location">
              <h2 className="rk-pd__blocktitle" id="rk-pd-location">
                Location
              </h2>

              {fullAddress && (
                <address className="rk-pd__address">
                  <MdLocationOn aria-hidden="true" />
                  <span>{fullAddress}</span>
                </address>
              )}

              {nearby.length > 0 && (
                <>
                  <h3 className="rk-pd__subtitle">What is nearby</h3>
                  <ul className="rk-pd__nearby">
                    {nearby.map((item, index) => (
                      <li key={`${item.label}-${index}`}>
                        <span className="rk-pd__nearbylabel">{item.label}</span>
                        <span className="rk-pd__nearbydot" aria-hidden="true" />
                        <span className="rk-pd__nearbydist">{item.distance || '—'}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <MapEmbed
                className="rk-pd__map"
                lat={loc.lat}
                lng={loc.lng}
                query={fullAddress || 'Faridabad, Haryana'}
                title={`Map showing ${property.title}, ${locationLine(loc) || 'Faridabad'}`}
                height={360}
              />
            </section>

            {property.developer && (
              <section className="rk-pd__block rk-pd__dev" aria-labelledby="rk-pd-developer">
                <h2 className="rk-pd__blocktitle" id="rk-pd-developer">
                  About the developer
                </h2>
                <p className="rk-pd__devname">{property.developer}</p>
                <p className="rk-pd__devtext">
                  {property.developer} is one of the builders we transact with regularly in
                  Faridabad. Before we list any of their inventory we check the Haryana RERA
                  registration, the licence for the colony and the construction stage on site.
                  {property.reraNumber
                    ? ` This project is registered under RERA number ${property.reraNumber}.`
                    : ' Ask us for the RERA registration certificate for this project and we will email it to you.'}
                </p>
                <Link
                  className="rk-link-gold"
                  to={`/properties?search=${encodeURIComponent(property.developer)}`}
                >
                  See other {property.developer} projects in Faridabad
                </Link>
              </section>
            )}

            <ShareRow
              className="rk-pd__share"
              url={shareUrl}
              title={`${property.title} — ${priceText} | Rama Kripa Estates`}
            />
          </div>
        </div>
      </div>

      <SimilarProperties similar={similar} count={3} />

      {/* ---------- Mobile action bar ---------- */}
      <div className="rk-pd__bottombar">
        <div className="rk-pd__bottomprice">
          <span className="rk-pd__bottomlabel">
            {property.listingType === 'rent' ? 'Rent' : 'Price'}
          </span>
          <strong>{priceText}</strong>
        </div>

        <div className="rk-pd__bottomactions">
          <a className="rk-btn rk-btn--outline rk-btn--sm" href={phoneHref(phone)}>
            <MdPhoneInTalk className="rk-btn__icon" aria-hidden="true" />
            Call
          </a>
          <button type="button" className="rk-btn rk-btn--gold rk-btn--sm" onClick={scrollToEnquiry}>
            Enquire
          </button>
        </div>
      </div>

      {/* ---------- Site visit modal ---------- */}
      <Modal
        open={visitOpen}
        onClose={() => setVisitOpen(false)}
        title="Schedule a site visit"
        size="md"
      >
        <p className="rk-pd__modalnote">
          Tell us a day that suits you. We pick you up from anywhere in Faridabad, walk you
          through {property.title} and answer everything on site — no charge, no obligation.
        </p>

        <EnquiryForm
          property={property}
          source="site-visit"
          compact
          title=""
          subtitle=""
          onSuccess={() => window.setTimeout(() => setVisitOpen(false), 2500)}
        />
      </Modal>
    </div>
  )
}
