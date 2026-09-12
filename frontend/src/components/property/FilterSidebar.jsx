import { useEffect, useId, useRef, useState } from 'react'
import { MdExpandMore, MdSearch, MdRestartAlt } from 'react-icons/md'
import useDebounce from '../../hooks/useDebounce'
import SearchSelect from '../ui/SearchSelect'
import {
  MIN_PRICE_STEPS,
  MAX_PRICE_STEPS,
  RENT_PRICE_STEPS,
  BEDROOM_OPTIONS,
  LISTING_TYPES,
  AREA_UNITS,
  CATEGORIES
} from '../../data/constants'
import { statusLabel, categoryLabel, formatPrice } from '../../utils/format'
import './FilterSidebar.css'

/** Normalise anything the API hands us into `{ value, label, count }`. */
export function toOptions(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((item) => {
      if (item === null || item === undefined) return null
      if (typeof item === 'string' || typeof item === 'number') {
        return { value: String(item), label: String(item) }
      }
      const value = item.value ?? item.key ?? item.name ?? item.slug ?? ''
      const label = item.label ?? item.name ?? item.value ?? item.key ?? ''
      return { value: String(value), label: String(label), count: item.count }
    })
    .filter((option) => option && option.value !== '')
}

/** "Sector 88" + count 6 -> { label: "Sector 88 (6)", value } for the type-ahead lists. */
const withCount = (list) =>
  list.map((o) => ({
    value: o.value,
    label: typeof o.count === 'number' ? `${o.label} (${o.count})` : o.label
  }))

/** Status can arrive as "resale" or ["resale","new-launch"]. */
const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])

/** One collapsible group inside the sidebar. */
function FilterGroup({ title, children, defaultOpen = true, hint }) {
  const [open, setOpen] = useState(defaultOpen)
  const uid = useId().replace(/:/g, '')
  const panelId = `rk-fsb-panel-${uid}`
  const buttonId = `rk-fsb-button-${uid}`

  return (
    <div className={`rk-fsb__group ${open ? 'is-open' : ''}`.trim()}>
      <h3 className="rk-fsb__grouphead">
        <button
          type="button"
          id={buttonId}
          className="rk-fsb__grouptoggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="rk-fsb__grouptitle">{title}</span>
          {hint && <span className="rk-fsb__grouphint">{hint}</span>}
          <MdExpandMore className="rk-fsb__groupicon" aria-hidden="true" />
        </button>
      </h3>

      <div id={panelId} role="group" aria-labelledby={buttonId} className="rk-fsb__panel" hidden={!open}>
        {children}
      </div>
    </div>
  )
}

/**
 * Desktop filter panel (also reused inside the mobile bottom sheet).
 * Every option list is API-driven through `meta`; only the ladders that the
 * build spec fixes (budget steps, bedroom pills, area units) come from constants.
 *
 * @param {{ values?: object, onChange: (patch: object) => void,
 *           onClear?: () => void, meta?: object, className?: string,
 *           sticky?: boolean, idPrefix?: string }} props
 */
export default function FilterSidebar({
  values = {},
  onChange,
  onClear,
  meta = {},
  className = '',
  sticky = true,
  idPrefix
}) {
  const uid = useId().replace(/:/g, '')
  const prefix = idPrefix || `rk-f-${uid}`
  const patch = (next) => onChange?.(next)

  /* ---------- Search (debounced) ---------- */
  const [term, setTerm] = useState(values.search || '')
  const debouncedTerm = useDebounce(term, 450)
  /** Last value handed to the parent — stops the effect echoing itself. */
  const pushedRef = useRef(values.search || '')

  useEffect(() => {
    setTerm(values.search || '')
    pushedRef.current = values.search || ''
  }, [values.search])

  // onChange lives in a ref on purpose. It is a new function every time the
  // parent's URL state changes, and having it as a dependency re-ran this effect
  // right after "Clear all" — while debouncedTerm still held the old text for
  // 450ms — so the cleared search was pushed straight back into the URL.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (debouncedTerm === pushedRef.current) return
    pushedRef.current = debouncedTerm
    onChangeRef.current?.({ search: debouncedTerm })
  }, [debouncedTerm])

  /* ---------- Option sets ---------- */
  const categories = toOptions(meta.categories).length
    ? toOptions(meta.categories)
    : CATEGORIES.map((c) => ({ value: c.key, label: c.label }))
  const propertyTypes = toOptions(meta.propertyTypes)
  const localities = toOptions(meta.localities)
  const statuses = toOptions(meta.statuses)

  const isRent = values.listingType === 'rent' || values.category === 'rent'
  const minSteps = isRent ? RENT_PRICE_STEPS : MIN_PRICE_STEPS
  const maxSteps = isRent ? RENT_PRICE_STEPS : MAX_PRICE_STEPS
  const minPrice = values.minPrice ? String(values.minPrice) : ''
  const maxPrice = values.maxPrice ? String(values.maxPrice) : ''
  const selectedStatuses = toArray(values.status)
  const bedrooms = values.bedrooms ? String(values.bedrooms) : ''
  const areaUnit = values.areaUnit || 'sqft'

  const budgetText = (() => {
    if (!minPrice && !maxPrice) return isRent ? 'Any monthly rent' : 'Any budget'
    const lo = minPrice ? formatPrice(Number(minPrice)) : 'Any'
    const hi = maxPrice ? formatPrice(Number(maxPrice)) : 'Any'
    return `${lo} to ${hi}`
  })()

  const toggleStatus = (value) => {
    const next = selectedStatuses.includes(value)
      ? selectedStatuses.filter((s) => s !== value)
      : [...selectedStatuses, value]
    patch({ status: next.length ? next : '' })
  }

  return (
    <aside
      className={`rk-fsb ${sticky ? 'rk-fsb--sticky' : ''} ${className}`.replace(/\s+/g, ' ').trim()}
      aria-label="Filter Faridabad properties"
    >
      <div className="rk-fsb__head">
        <h2 className="rk-fsb__heading">Refine your search</h2>
        <button type="button" className="rk-fsb__reset" onClick={() => onClear?.()}>
          <MdRestartAlt aria-hidden="true" />
          Reset
        </button>
      </div>

      {/* Search */}
      <FilterGroup title="Search">
        <label className="sr-only" htmlFor={`${prefix}-search`}>
          Search by project, locality or developer
        </label>
        <div className="rk-fsb__search">
          <MdSearch className="rk-fsb__searchicon" aria-hidden="true" />
          <input
            id={`${prefix}-search`}
            type="search"
            className="rk-input rk-fsb__searchinput"
            placeholder="Project, sector or developer"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            autoComplete="off"
          />
        </div>
        <p className="rk-fsb__note">Try “Sector 88”, “BPTP” or “3 BHK Neharpar”.</p>
      </FilterGroup>

      {/* Category */}
      <FilterGroup title="Category">
        <div className="rk-fsb__pills" role="radiogroup" aria-label="Property category">
          {[{ value: '', label: 'All' }, ...categories].map((option) => {
            const id = `${prefix}-cat-${option.value || 'all'}`
            const checked = (values.category || '') === option.value
            return (
              <label key={id} className={`rk-fsb__pill ${checked ? 'is-active' : ''}`.trim()} htmlFor={id}>
                <input
                  id={id}
                  type="radio"
                  className="sr-only"
                  name={`${prefix}-category`}
                  value={option.value}
                  checked={checked}
                  onChange={() => patch({ category: option.value })}
                />
                <span>{option.label || categoryLabel(option.value)}</span>
                {typeof option.count === 'number' && <em>{option.count}</em>}
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* Listing type */}
      <FilterGroup title="Listing Type">
        <div className="rk-fsb__seg" role="radiogroup" aria-label="Listing type">
          {[{ value: '', label: 'Any' }, ...LISTING_TYPES].map((option) => {
            const id = `${prefix}-lt-${option.value || 'any'}`
            const checked = (values.listingType || '') === option.value
            return (
              <label key={id} className={`rk-fsb__segitem ${checked ? 'is-active' : ''}`.trim()} htmlFor={id}>
                <input
                  id={id}
                  type="radio"
                  className="sr-only"
                  name={`${prefix}-listingType`}
                  value={option.value}
                  checked={checked}
                  onChange={() => patch({ listingType: option.value })}
                />
                <span>{option.label}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* Property type */}
      {propertyTypes.length > 0 && (
        <FilterGroup title="Property Type">
          <label className="sr-only" htmlFor={`${prefix}-ptype`}>
            Property type
          </label>
          <SearchSelect
            id={`${prefix}-ptype`}
            variant="light"
            value={values.propertyType || ''}
            onChange={(next) => patch({ propertyType: next })}
            options={withCount(propertyTypes)}
            clearLabel="All property types"
            placeholder="All property types"
            ariaLabel="Property type"
          />
        </FilterGroup>
      )}

      {/* Locality */}
      {localities.length > 0 && (
        <FilterGroup title="Locality">
          <label className="sr-only" htmlFor={`${prefix}-locality`}>
            Locality or sector in Faridabad
          </label>
          <SearchSelect
            id={`${prefix}-locality`}
            variant="light"
            value={values.locality || ''}
            onChange={(next) => patch({ locality: next })}
            options={withCount(localities)}
            clearLabel="All Faridabad localities"
            placeholder="All Faridabad localities"
            searchPlaceholder="Type a sector or locality…"
            ariaLabel="Locality or sector in Faridabad"
          />
        </FilterGroup>
      )}

      {/* Status */}
      {statuses.length > 0 && (
        <FilterGroup title="Construction Status">
          <ul className="rk-fsb__checks">
            {statuses.map((option) => {
              const id = `${prefix}-status-${option.value}`
              return (
                <li key={option.value}>
                  <label className="rk-fsb__check" htmlFor={id}>
                    <input
                      id={id}
                      type="checkbox"
                      checked={selectedStatuses.includes(option.value)}
                      onChange={() => toggleStatus(option.value)}
                    />
                    <span>{statusLabel(option.value)}</span>
                    {typeof option.count === 'number' && <em>{option.count}</em>}
                  </label>
                </li>
              )
            })}
          </ul>
        </FilterGroup>
      )}

      {/* Budget */}
      <FilterGroup title={isRent ? 'Monthly Rent' : 'Budget'} hint={budgetText}>
        <div className="rk-fsb__two">
          <div className="rk-field">
            <label className="rk-label" htmlFor={`${prefix}-minprice`}>
              Min
            </label>
            <SearchSelect
              id={`${prefix}-minprice`}
              variant="light"
              value={minPrice}
              onChange={(next) => patch({ minPrice: next })}
              options={minSteps.filter((step) => !maxPrice || step.value < Number(maxPrice))}
              clearLabel="No minimum"
              placeholder="No minimum"
              searchPlaceholder="Type an amount…"
              ariaLabel="Minimum budget"
            />
          </div>

          <div className="rk-field">
            <label className="rk-label" htmlFor={`${prefix}-maxprice`}>
              Max
            </label>
            <SearchSelect
              id={`${prefix}-maxprice`}
              variant="light"
              value={maxPrice}
              onChange={(next) => patch({ maxPrice: next })}
              options={maxSteps.filter((step) => !minPrice || step.value > Number(minPrice))}
              clearLabel="No maximum"
              placeholder="No maximum"
              searchPlaceholder="Type an amount…"
              ariaLabel="Maximum budget"
            />
          </div>
        </div>

        <p className="rk-fsb__range" aria-live="polite">
          Showing: <strong>{budgetText}</strong>
        </p>
      </FilterGroup>

      {/* Bedrooms */}
      <FilterGroup title="Bedrooms">
        <div className="rk-fsb__pills rk-fsb__pills--tight" role="group" aria-label="Bedrooms">
          {BEDROOM_OPTIONS.map((option) => {
            const value = String(option.value)
            const active = bedrooms === value
            return (
              <button
                key={value}
                type="button"
                className={`rk-fsb__pill rk-fsb__pill--btn ${active ? 'is-active' : ''}`.trim()}
                aria-pressed={active}
                onClick={() => patch({ bedrooms: active ? '' : value })}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </FilterGroup>

      {/* Area */}
      <FilterGroup title="Area" defaultOpen={false}>
        <div className="rk-fsb__two">
          <div className="rk-field">
            <label className="rk-label" htmlFor={`${prefix}-minarea`}>
              Min area
            </label>
            <input
              id={`${prefix}-minarea`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              className="rk-input"
              placeholder="e.g. 900"
              value={values.minArea || ''}
              onChange={(event) => patch({ minArea: event.target.value })}
            />
          </div>

          <div className="rk-field">
            <label className="rk-label" htmlFor={`${prefix}-maxarea`}>
              Max area
            </label>
            <input
              id={`${prefix}-maxarea`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              className="rk-input"
              placeholder="e.g. 2400"
              value={values.maxArea || ''}
              onChange={(event) => patch({ maxArea: event.target.value })}
            />
          </div>
        </div>

        <div className="rk-field rk-fsb__unit">
          <label className="rk-label" htmlFor={`${prefix}-areaunit`}>
            Unit
          </label>
          <select
            id={`${prefix}-areaunit`}
            className="rk-select"
            value={areaUnit}
            onChange={(event) => patch({ areaUnit: event.target.value })}
          >
            {AREA_UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
      </FilterGroup>

      <button type="button" className="rk-btn rk-btn--outline rk-btn--block rk-fsb__clear" onClick={() => onClear?.()}>
        <MdRestartAlt className="rk-btn__icon" aria-hidden="true" />
        Clear all filters
      </button>
    </aside>
  )
}
