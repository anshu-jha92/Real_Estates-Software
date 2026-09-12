import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdSearch, MdTune } from 'react-icons/md'
import Tabs from '../ui/Tabs'
import SearchSelect from '../ui/SearchSelect'
import SearchSuggest from '../ui/SearchSuggest'
import { useSite } from '../../context/SiteContext'
import {
  MAX_PRICE_STEPS,
  MIN_PRICE_STEPS,
  PROPERTY_TYPES,
  RENT_PRICE_STEPS
} from '../../data/constants'
import { buildQueryString } from '../../utils/format'
import './HeroSearch.css'

/** Each tab preloads the category / listingType half of the query. */
const TABS = [
  { value: 'buy', label: 'Buy', query: { listingType: 'sale' } },
  { value: 'rent', label: 'Rent', query: { listingType: 'rent' } },
  { value: 'plots', label: 'Plots', query: { category: 'plots' } },
  { value: 'commercial', label: 'Commercial', query: { category: 'commercial' } }
]

const EMPTY = { search: '', propertyType: '', locality: '', minPrice: '', maxPrice: '' }

/**
 * The frosted search card that sits inside the hero. Everything it collects is
 * pushed into the `/properties` query string, so results stay shareable.
 */
export default function HeroSearch() {
  const navigate = useNavigate()
  const { filters } = useSite()

  const [tab, setTab] = useState('buy')
  const [form, setForm] = useState(EMPTY)
  const [moreOpen, setMoreOpen] = useState(false)

  const propertyTypes = filters?.propertyTypes?.length ? filters.propertyTypes : PROPERTY_TYPES
  const localities = filters?.localities?.length ? filters.localities : []
  // Rent runs on its own monthly ladder; sale uses the Rs.5,000 -> Rs.1,00,00,000 ladders.
  const minSteps = tab === 'rent' ? RENT_PRICE_STEPS : MIN_PRICE_STEPS
  const maxSteps = tab === 'rent' ? RENT_PRICE_STEPS : MAX_PRICE_STEPS

  const min = Number(form.minPrice) || 0
  const maxOptions = useMemo(
    () => maxSteps.filter((step) => step.value > min),
    [maxSteps, min]
  )


  /** SearchSelect hands back a plain value rather than an event. */
  const pick = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))

  /** Raising the floor above the current ceiling drops the ceiling, so the
      Max Price select never shows an option it no longer offers. */
  const setMin = (value) => {
    setForm((prev) => ({
      ...prev,
      minPrice: value,
      maxPrice: Number(prev.maxPrice) > Number(value) ? prev.maxPrice : ''
    }))
  }

  const changeTab = (value) => {
    setTab(value)
    // Sale and rent run on different price ladders, so the budget has to reset.
    setForm((prev) => ({ ...prev, minPrice: '', maxPrice: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const lo = Number(form.minPrice) || undefined
    const hi = Number(form.maxPrice) || undefined
    const swap = lo && hi && hi < lo

    const query = {
      ...TABS.find((t) => t.value === tab).query,
      search: form.search.trim(),
      propertyType: form.propertyType,
      locality: form.locality,
      minPrice: swap ? hi : lo,
      maxPrice: swap ? lo : hi
    }

    navigate(`/properties${buildQueryString(query)}`)
  }

  /** A suggestion is a destination, not just text: projects open directly, the rest filter. */
  const pickSuggestion = (item) => {
    if (item.group === 'projects' && item.slug) {
      navigate(`/property/${item.slug}`)
      return
    }
    const base = TABS.find((t) => t.value === tab).query
    const query =
      item.group === 'localities'
        ? { ...base, locality: item.label }
        : item.group === 'propertyTypes'
          ? { ...base, propertyType: item.label }
          : { ...base, search: item.label }
    navigate(`/properties${buildQueryString(query)}`)
  }

  return (
    <div className="rk-hsearch">
      <Tabs
        tabs={TABS}
        value={tab}
        onChange={changeTab}
        variant="glass"
        ariaLabel="What are you looking for"
        panelId="rk-hsearch-form"
        className="rk-hsearch__tabs"
      />

      <form
        id="rk-hsearch-form"
        className="rk-hsearch__form rk-form--dark"
        onSubmit={handleSubmit}
        role="search"
      >
        <div className="rk-hsearch__fields">
          <div className="rk-hsearch__field rk-hsearch__field--search">
            <label className="sr-only" htmlFor="rk-hs-search">
              Search by project, locality or developer
            </label>
            <SearchSuggest
              id="rk-hs-search"
              value={form.search}
              onChange={(text) => setForm((prev) => ({ ...prev, search: text }))}
              onPick={pickSuggestion}
              placeholder="Search by project, locality or developer"
              ariaLabel="Search by project, locality or developer"
            />
          </div>

          <button
            type="button"
            className="rk-hsearch__more"
            aria-expanded={moreOpen}
            aria-controls="rk-hs-more"
            onClick={() => setMoreOpen((open) => !open)}
          >
            <MdTune aria-hidden="true" />
            {moreOpen ? 'Fewer filters' : 'More filters'}
          </button>

          <div
            id="rk-hs-more"
            className={`rk-hsearch__more-group ${moreOpen ? 'is-open' : ''}`.trim()}
          >
            <div className="rk-hsearch__field">
              <SearchSelect
                name="propertyType"
                ariaLabel="Property type"
                placeholder="Property Type"
                searchPlaceholder="Type a property type…"
                clearLabel="Any property type"
                value={form.propertyType}
                onChange={pick('propertyType')}
                options={propertyTypes.map((type) => ({ label: type, value: type }))}
              />
            </div>

            <div className="rk-hsearch__field">
              <SearchSelect
                name="locality"
                ariaLabel="Location or sector"
                placeholder="Location"
                searchPlaceholder="Type a sector or locality…"
                clearLabel="All of Faridabad"
                value={form.locality}
                onChange={pick('locality')}
                options={localities.map((place) => ({ label: place, value: place }))}
              />
            </div>

            <div className="rk-hsearch__field">
              <SearchSelect
                name="minPrice"
                ariaLabel="Minimum budget"
                placeholder="Min Price"
                searchPlaceholder="Type an amount…"
                value={form.minPrice}
                onChange={setMin}
                options={minSteps}
              />
            </div>

            <div className="rk-hsearch__field">
              <SearchSelect
                name="maxPrice"
                ariaLabel="Maximum budget"
                placeholder="Max Price"
                searchPlaceholder="Type an amount…"
                value={form.maxPrice}
                onChange={pick('maxPrice')}
                options={maxOptions}
              />
            </div>
          </div>

          <button type="submit" className="rk-btn rk-btn--gold rk-btn--md rk-hsearch__submit">
            <MdSearch className="rk-btn__icon" aria-hidden="true" />
            Search
          </button>
        </div>
      </form>
    </div>
  )
}
