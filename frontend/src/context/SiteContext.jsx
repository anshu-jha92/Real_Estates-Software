import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { FARIDABAD_LOCALITIES, HERO_SLIDES, PROPERTY_TYPES } from '../data/constants'

/* -------------------------------------------------------------------------
 * Defaults. The site must render completely with the API switched off, so
 * these are real content, not empty shells.
 * ---------------------------------------------------------------------- */

export const MAP_EMBED_URL =
  'https://www.google.com/maps?q=Sector+88,+Greater+Faridabad,+Haryana+121002&output=embed'

export const MAP_DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Sector+88,+Greater+Faridabad,+Haryana+121002'

export const DEFAULT_SETTINGS = {
  brandName: 'Rama Kripa Estates',
  tagline: 'Blessings in Every Address',
  phones: ['+91 98110 00000', '+91 92120 00000'],
  email: 'info@ramakripaestate.com',
  whatsapp: '919811000000',
  address: 'SCO 12, Sector 88, Greater Faridabad, Haryana 121002',
  addressLines: ['SCO 12, Sector 88', 'Greater Faridabad', 'Haryana 121002'],
  hours: '10:00 - 19:00, Mon-Sun',
  socials: {
    facebook: 'https://www.facebook.com/ramakripaestate',
    instagram: 'https://www.instagram.com/ramakripaestate',
    linkedin: 'https://www.linkedin.com/company/ramakripaestate',
    youtube: 'https://www.youtube.com/@ramakripaestate',
    twitter: 'https://x.com/ramakripaestate'
  },
  mapEmbedUrl: MAP_EMBED_URL,
  directionsUrl: MAP_DIRECTIONS_URL,
  heroSlides: HERO_SLIDES,
  about:
    'Rama Kripa Estates has been matching families and businesses with the right address in Faridabad since 2007. We work one city only — from the plotted colonies of Neharpar and the SCO frontage of Sector 88 to the kothis of Old Faridabad — so the advice you get is grounded in registry rates we have actually seen, not a national average.',
  stats: [
    { label: 'Years in Faridabad', value: 18, suffix: '+' },
    { label: 'Happy Families', value: 1200, suffix: '+' },
    { label: 'Projects Handled', value: 250, suffix: '+' },
    { label: 'Developer Tie-ups', value: 40, suffix: '+' }
  ]
}

export const DEFAULT_FILTERS = {
  cities: ['Faridabad'],
  localities: FARIDABAD_LOCALITIES.map((l) => l.query),
  propertyTypes: PROPERTY_TYPES,
  categories: [
    { key: 'residential', label: 'Residential', count: 0 },
    { key: 'commercial', label: 'Commercial', count: 0 },
    { key: 'plots', label: 'Plots', count: 0 },
    { key: 'rent', label: 'Rent', count: 0 },
    { key: 'office-space', label: 'Office Space', count: 0 }
  ],
  statuses: ['new-launch', 'under-construction', 'ready-to-move', 'resale', 'sold-out'],
  priceRange: { min: 1000000, max: 250000000 },
  bedrooms: [1, 2, 3, 4, 5]
}

export const DEFAULT_STATS = {
  total: 0,
  residential: 0,
  commercial: 0,
  plots: 0,
  rent: 0,
  officeSpace: 0,
  localities: FARIDABAD_LOCALITIES.length
}

const SiteContext = createContext({
  settings: DEFAULT_SETTINGS,
  filters: DEFAULT_FILTERS,
  stats: DEFAULT_STATS,
  loading: false,
  offline: false
})

/** Merge an API payload over the defaults without letting nulls wipe content. */
function mergeSettings(incoming) {
  if (!incoming || typeof incoming !== 'object') return DEFAULT_SETTINGS
  const merged = { ...DEFAULT_SETTINGS }
  Object.entries(incoming).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    if (Array.isArray(value) && value.length === 0) return
    merged[key] = value
  })
  merged.socials = { ...DEFAULT_SETTINGS.socials, ...(incoming.socials || {}) }
  merged.addressLines =
    incoming.addressLines && incoming.addressLines.length
      ? incoming.addressLines
      : incoming.address
        ? String(incoming.address)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : DEFAULT_SETTINGS.addressLines
  if (!merged.directionsUrl) merged.directionsUrl = MAP_DIRECTIONS_URL
  return merged
}

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    let alive = true

    const pick = (res) => (res && res.data !== undefined ? res.data : res)

    Promise.allSettled([
      api.settings({ signal }),
      api.filters({ signal }),
      api.stats({ signal })
    ]).then((results) => {
      if (!alive || signal.aborted) return

      const [settingsRes, filtersRes, statsRes] = results

      if (settingsRes.status === 'fulfilled') {
        setSettings(mergeSettings(pick(settingsRes.value)))
      }
      if (filtersRes.status === 'fulfilled') {
        const data = pick(filtersRes.value)
        if (data) setFilters({ ...DEFAULT_FILTERS, ...data })
      }
      if (statsRes.status === 'fulfilled') {
        const data = pick(statsRes.value)
        if (data) setStats({ ...DEFAULT_STATS, ...data })
      }

      setOffline(results.every((r) => r.status === 'rejected'))
      setLoading(false)
    })

    return () => {
      alive = false
      controller.abort()
    }
  }, [])

  const value = useMemo(
    () => ({ settings, filters, stats, loading, offline }),
    [settings, filters, stats, loading, offline]
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  return useContext(SiteContext)
}

export default SiteContext
