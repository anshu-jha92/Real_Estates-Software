import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { MdClose, MdErrorOutline, MdRestartAlt } from 'react-icons/md'
import PageHero from '../components/layout/PageHero'
import FilterSidebar from '../components/property/FilterSidebar'
import FilterBar, { activeChips } from '../components/property/FilterBar'
import SortSelect from '../components/property/SortSelect'
import PropertyGrid from '../components/property/PropertyGrid'
import Pagination from '../components/property/Pagination'
import EmptyState from '../components/ui/EmptyState'
import { api } from '../api/client'
import { useSite } from '../context/SiteContext'
import useSeo from '../hooks/useSeo'
import { FARIDABAD_LOCALITIES, IMAGE_IDS, UNSPLASH } from '../data/constants'
import { bhkLabel, buildQueryString, formatNumber, phoneHref, titleCase } from '../utils/format'
import './Properties.css'

/** Matches the backend default (BUILD_SPEC §3). */
const LIMIT = 12

/** Keys a route can pre-apply through the `preset` prop. */
const PRESET_KEYS = ['category', 'listingType', 'locality', 'propertyType', 'status']

const EMPTY_RESULT = { items: [], total: 0, pages: 1 }

/* ------------------------------------------------------------------ */
/* Page hero copy, per active category (BUILD_SPEC §7)                 */
/* ------------------------------------------------------------------ */

const HEROES = {
  residential: {
    title: 'Residential Properties in Faridabad',
    subtitle:
      'Ready-to-move and under-construction apartments, builder floors and independent houses across Greater Faridabad, the old sectors and Ballabgarh — every listing checked against the Haryana RERA register.',
    image: UNSPLASH(IMAGE_IDS.residential[1], 1600),
    alt: 'Residential apartment towers in Greater Faridabad'
  },
  plots: {
    title: 'Plots in Faridabad',
    subtitle:
      'HSVP and licensed-colony residential plots, SCO commercial plots and farm land in Neharpar, Tigaon Road, Sohna Road and the Bypass Road belt.',
    image: UNSPLASH(IMAGE_IDS.plots[0], 1600),
    alt: 'Open plotted land marked out for development'
  },
  rent: {
    title: 'Properties for Rent in Faridabad',
    subtitle:
      'Furnished and semi-furnished flats, builder floors, kothis and shops on rent — from NIT Faridabad and Sector 15 to the newer societies in Sector 86 and 88.',
    image: UNSPLASH(IMAGE_IDS.interior[0], 1600),
    alt: 'Furnished living room of a rental home'
  },
  'office-space': {
    title: 'Office Spaces in Faridabad',
    subtitle:
      'Bare-shell and fitted offices, IT suites and coworking desks along the Mathura Road corridor, Sector 88 SCO frontage and the Badarpur border stretch.',
    image: UNSPLASH(IMAGE_IDS.commercial[0], 1600),
    alt: 'Modern open-plan office interior'
  },
  commercial: {
    title: 'Commercial Properties in Faridabad',
    subtitle:
      'Retail shops, showrooms, SCO units and warehouses with proven footfall and rental demand across Sector 88, Sector 89 and the Mathura Road belt.',
    image: UNSPLASH(IMAGE_IDS.commercial[2], 1600),
    alt: 'Retail shopfronts in a commercial complex'
  },
  all: {
    title: 'Properties in Faridabad',
    subtitle:
      'Every flat, floor, plot, shop and office on our books — filter by locality, budget, configuration and construction status to shortlist in minutes.',
    image: UNSPLASH(IMAGE_IDS.hero[0], 1600),
    alt: 'Skyline of residential towers in Faridabad at dusk'
  }
}

/** Which hero a set of filter values earns. Rent wins over the category. */
function heroFor(values) {
  if (values.listingType === 'rent' || values.category === 'rent') return HEROES.rent
  if (HEROES[values.category]) return HEROES[values.category]
  if (values.locality) {
    return {
      ...HEROES.all,
      title: `Property in ${values.locality}, Faridabad`,
      subtitle: `Flats, floors, plots and commercial units currently available in ${values.locality}. Prices below reflect what we have actually transacted in this pocket, not asking rates.`
    }
  }
  return HEROES.all
}

/** `/locality/sector-88-89` -> the locality string the API indexes ("Sector 88"). */
function resolveLocality(raw) {
  const value = String(raw || '').trim()
  if (!value) return ''
  const match = FARIDABAD_LOCALITIES.find(
    (l) => l.slug === value || l.query.toLowerCase() === value.toLowerCase()
  )
  if (match) return match.query
  return /^[a-z0-9]+(-[a-z0-9]+)+$/.test(value) ? titleCase(value) : value
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Properties listing — BUILD_SPEC §7.
 *
 * The URL query string is the single source of truth: every filter, the sort
 * and the page number live there, so results are shareable and the back button
 * behaves. `preset` (from `/residential`, `/plots`, `/locality/:slug`, …) only
 * fills the gaps the URL leaves; the moment a visitor contradicts the preset we
 * move them to `/properties` with the full query spelled out.
 *
 * @param {{ preset?: { category?: string, listingType?: string, locality?: string,
 *           propertyType?: string, status?: string } }} props
 */
export default function Properties({ preset }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const routeParams = useParams()
  const { filters, settings } = useSite()
  const phone = settings?.phones?.[0] || '+91 98110 00000'

  const resultsRef = useRef(null)

  const [result, setResult] = useState(EMPTY_RESULT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  /** Bumped by "Try again" — the URL has not changed, so the query key would not. */
  const [retry, setRetry] = useState(0)

  /* ---------- The route's preset, normalised ---------- */
  const presetValues = useMemo(() => {
    const source = { ...(preset || {}) }
    // `/locality/:slug` — seed the locality from the route when App did not.
    if (!source.locality && routeParams.slug && pathname.startsWith('/locality/')) {
      source.locality = routeParams.slug
    }
    const out = {}
    PRESET_KEYS.forEach((key) => {
      const value = key === 'locality' ? resolveLocality(source[key]) : source[key]
      if (value) out[key] = String(value)
    })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset?.category, preset?.listingType, preset?.locality, preset?.propertyType, preset?.status, routeParams.slug, pathname])

  /* ---------- URL over preset ---------- */
  const values = useMemo(() => {
    const get = (key) => searchParams.get(key) || ''
    const statuses = searchParams.getAll('status').filter(Boolean)

    return {
      search: get('search'),
      category: get('category') || presetValues.category || '',
      listingType: get('listingType') || presetValues.listingType || '',
      propertyType: get('propertyType') || presetValues.propertyType || '',
      locality: get('locality') || presetValues.locality || '',
      status: statuses.length ? statuses : presetValues.status ? [presetValues.status] : [],
      minPrice: get('minPrice'),
      maxPrice: get('maxPrice'),
      bedrooms: get('bedrooms'),
      minArea: get('minArea'),
      maxArea: get('maxArea'),
      areaUnit: get('areaUnit') || 'sqft',
      sort: get('sort') || 'newest',
      page: Math.max(1, Number(get('page')) || 1)
    }
  }, [searchParams, presetValues])

  /* ---------- Write a change back into the URL ---------- */
  const applyPatch = useCallback(
    (patch) => {
      if (!patch) return
      const next = { ...values, ...patch }
      // Any filter change resets to page 1; only an explicit page move keeps it.
      if (!('page' in patch)) next.page = 1
      if (next.status && !Array.isArray(next.status)) {
        next.status = next.status ? [next.status] : []
      }

      // Does the route's preset still describe what the visitor is asking for?
      const presetHolds = Object.entries(presetValues).every(([key, value]) => {
        const candidate = next[key]
        return Array.isArray(candidate)
          ? candidate.length === 1 && candidate[0] === value
          : String(candidate || '') === value
      })

      const query = {
        search: next.search,
        category: next.category,
        listingType: next.listingType,
        propertyType: next.propertyType,
        locality: next.locality,
        status: next.status,
        minPrice: next.minPrice,
        maxPrice: next.maxPrice,
        bedrooms: next.bedrooms,
        minArea: next.minArea,
        maxArea: next.maxArea,
        areaUnit: next.minArea || next.maxArea ? next.areaUnit : '',
        sort: next.sort === 'newest' ? '' : next.sort,
        page: next.page > 1 ? next.page : ''
      }

      // Whatever the route already says does not need repeating in the query.
      if (presetHolds) Object.keys(presetValues).forEach((key) => delete query[key])

      navigate(`${presetHolds ? pathname : '/properties'}${buildQueryString(query)}`)
    },
    [values, presetValues, pathname, navigate]
  )

  /** Reset to the bare route: `/residential` keeps its category, `/properties` clears everything. */
  const clearAll = useCallback(() => navigate(pathname), [navigate, pathname])

  /* ---------- Fetch ---------- */
  const query = useMemo(
    () => ({
      search: values.search,
      category: values.category,
      listingType: values.listingType,
      propertyType: values.propertyType,
      locality: values.locality,
      status: values.status,
      minPrice: values.minPrice,
      maxPrice: values.maxPrice,
      bedrooms: values.bedrooms,
      minArea: values.minArea,
      maxArea: values.maxArea,
      sort: values.sort,
      page: values.page,
      limit: LIMIT
    }),
    [values]
  )

  const queryKey = JSON.stringify(query)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError('')

    api
      .properties(query, { signal: controller.signal })
      .then((res) => {
        if (controller.signal.aborted) return
        setResult({
          items: Array.isArray(res?.data) ? res.data : [],
          total: Number(res?.total) || 0,
          pages: Math.max(1, Number(res?.pages) || 1)
        })
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === 'AbortError') return
        setResult(EMPTY_RESULT)
        setError(err?.message || 'We could not load properties just now. Please try again.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    // Every param change aborts the in-flight request, so a slow older
    // response can never overwrite a newer one.
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, retry])

  /* ---------- Derived view state ---------- */
  const hero = heroFor(values)
  const chips = activeChips(values)
  const { items, total, pages } = result
  const from = total ? (values.page - 1) * LIMIT + 1 : 0
  const to = Math.min(values.page * LIMIT, total)

  const resultText = loading
    ? 'Finding properties in Faridabad…'
    : total === 0
      ? 'No properties in Faridabad match these filters'
      : `Showing ${formatNumber(from)}-${formatNumber(to)} of ${formatNumber(total)} ${
          total === 1 ? 'property' : 'properties'
        } in Faridabad`

  const seoTitle = useMemo(() => {
    const bits = []
    if (values.bedrooms) bits.push(bhkLabel(values.bedrooms))
    if (values.propertyType) bits.push(values.propertyType)

    let lead = hero.title
    if (bits.length) {
      const where = values.locality ? `${values.locality}, Faridabad` : 'Faridabad'
      lead = `${bits.join(' ')} in ${where}`
    } else if (values.locality && values.category) {
      lead = `${hero.title.replace(' in Faridabad', '')} in ${values.locality}, Faridabad`
    }

    if (values.search) lead = `${lead} — “${values.search}”`
    return values.page > 1 ? `${lead} — Page ${values.page}` : lead
  }, [values, hero.title])

  useSeo({
    title: seoTitle,
    description: hero.subtitle,
    image: hero.image
  })

  /* ---------- Pagination scrolls the results column, not the page top ---------- */
  const goToPage = useCallback(
    (page) => {
      applyPatch({ page })
      const el = resultsRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      })
    },
    [applyPatch]
  )

  const clearAction = (
    <button type="button" className="rk-btn rk-btn--gold" onClick={clearAll}>
      <MdRestartAlt className="rk-btn__icon" aria-hidden="true" />
      Clear all filters
    </button>
  )

  return (
    <div className="rk-props">
      <PageHero
        eyebrow="Faridabad Portfolio"
        title={hero.title}
        subtitle={hero.subtitle}
        image={hero.image}
        alt={hero.alt}
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Properties', to: '/properties' },
          { label: hero.title }
        ]}
      />

      <section className="rk-section rk-props__section" aria-label="Property search results">
        <div className="rk-container rk-props__body">
          {/* Desktop: sticky sidebar. Under 1024px it is hidden and the
              FilterBar bottom-sheet takes over (same component inside). */}
          <div className="rk-props__side">
            <FilterSidebar
              values={values}
              onChange={applyPatch}
              onClear={clearAll}
              meta={filters}
              idPrefix="rk-props"
            />
          </div>

          <div className="rk-props__results" ref={resultsRef} id="results">
            {/* Mobile / tablet: Filters button, live count, sort and chips. */}
            <FilterBar
              className="rk-props__mobilebar"
              values={values}
              onChange={applyPatch}
              onClear={clearAll}
              meta={filters}
              total={total}
              loading={loading}
            />

            <div className="rk-props__head">
              <p className="rk-props__count" aria-live="polite">
                {resultText}
              </p>

              <SortSelect
                className="rk-props__sort"
                value={values.sort}
                onChange={(sort) => applyPatch({ sort })}
              />
            </div>

            {chips.length > 0 && (
              <div className="rk-props__chips">
                <span className="rk-props__chipslabel">Applied filters</span>

                <ul className="rk-props__chiplist">
                  {chips.map((chip) => (
                    <li key={chip.id}>
                      <button
                        type="button"
                        className="rk-chip rk-chip--removable"
                        onClick={() => applyPatch(chip.patch)}
                      >
                        <span>{chip.label}</span>
                        <span className="rk-chip__x" aria-hidden="true">
                          <MdClose />
                        </span>
                        <span className="sr-only">Remove this filter</span>
                      </button>
                    </li>
                  ))}
                </ul>

                <button type="button" className="rk-props__clear" onClick={clearAll}>
                  Clear all
                </button>
              </div>
            )}

            {error ? (
              <EmptyState
                icon={MdErrorOutline}
                tone="error"
                title="We could not load the listings"
                message={`${error} You can also call us on ${phone} and we will send matching Faridabad options on WhatsApp.`}
                action={
                  <button
                    type="button"
                    className="rk-btn rk-btn--green"
                    onClick={() => setRetry((n) => n + 1)}
                  >
                    Try again
                  </button>
                }
              />
            ) : (
              <PropertyGrid
                properties={items}
                loading={loading}
                count={LIMIT}
                emptyTitle="No properties match these filters"
                emptyMessage="Nothing on our books fits this exact combination right now. Widen the budget, drop a filter, or tell us the requirement and we will source it from our Faridabad developer network."
                emptyAction={clearAction}
              />
            )}

            {!loading && !error && pages > 1 && (
              <Pagination
                className="rk-props__pagination"
                page={values.page}
                pages={pages}
                onPageChange={goToPage}
              />
            )}

            {!loading && !error && total > 0 && (
              <p className="rk-props__foot">
                Cannot find the right fit?{' '}
                <a className="rk-link-gold" href={phoneHref(phone)}>
                  Call {phone}
                </a>{' '}
                or{' '}
                <Link className="rk-link-gold" to="/enquiry">
                  post your requirement
                </Link>{' '}
                — we add new Faridabad inventory every week.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
