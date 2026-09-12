import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MdArrowForward } from 'react-icons/md'
import Section from '../ui/Section'
import SectionTitle from '../ui/SectionTitle'
import Tabs from '../ui/Tabs'
import PropertyGrid from '../property/PropertyGrid'
import { api } from '../../api/client'
import './FeaturedProperties.css'

const LIMIT = 6

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'plots', label: 'Plots' },
  { value: 'rent', label: 'Rent' }
]

/**
 * Home page portfolio block. Refetches on every tab change and quietly falls
 * back to the newest listings when a category has nothing flagged featured.
 */
export default function FeaturedProperties() {
  const [tab, setTab] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const options = { signal: controller.signal }
    const base = { limit: LIMIT }
    if (tab !== 'all') base.category = tab

    setLoading(true)
    setError('')

    const rows = (res) => (Array.isArray(res?.data) ? res.data : [])

    api
      .properties({ ...base, featured: true }, options)
      .then((res) => {
        const featured = rows(res)
        // Nothing flagged in this category — show the newest instead of nothing.
        return featured.length ? featured : api.properties(base, options).then(rows)
      })
      .then((list) => {
        if (controller.signal.aborted) return
        setItems(list)
        setLoading(false)
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return
        setItems([])
        setError(err.message || 'We could not load listings just now.')
        setLoading(false)
      })

    return () => controller.abort()
  }, [tab])

  const viewAll = tab === 'all' ? '/properties' : `/properties?category=${tab}`

  return (
    <Section tone="cream" className="rk-featured" ariaLabel="Featured properties in Faridabad">
      <SectionTitle
        eyebrow="Our Portfolio"
        title="Properties in Faridabad"
        subtitle="Faridabad gives you Delhi-NCR connectivity at a fraction of what the same carpet area costs in South Delhi or Gurugram, with the Metro, KMP Expressway and FMDA sector roads already in place. Every listing below is one we have visited, priced against recent registry rates and checked on the Haryana RERA portal."
      />

      <Tabs
        tabs={TABS}
        value={tab}
        onChange={setTab}
        ariaLabel="Filter properties by category"
        panelId="rk-featured-grid"
        className="rk-featured__tabs"
      />

      <div id="rk-featured-grid" className="rk-featured__panel">
        <PropertyGrid
          properties={items}
          loading={loading}
          count={LIMIT}
          emptyTitle={error ? 'Listings are taking a break' : 'Nothing listed here right now'}
          emptyMessage={
            error
              ? `${error} Call us on +91 98110 00000 and we will share the current Faridabad shortlist over WhatsApp.`
              : 'We are adding new Faridabad projects every week. Try another category, or tell us what you are looking for and we will source it.'
          }
          emptyAction={
            <Link to="/enquiry" className="rk-btn rk-btn--green rk-btn--md">
              Tell us what you need
            </Link>
          }
        />
      </div>

      <div className="rk-featured__more">
        <Link to={viewAll} className="rk-btn rk-btn--outline rk-btn--md">
          View All Properties
          <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
        </Link>
      </div>
    </Section>
  )
}
