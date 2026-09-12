import { useState } from 'react'
import { MdTune, MdClose } from 'react-icons/md'
import Modal from '../ui/Modal'
import FilterSidebar from './FilterSidebar'
import SortSelect from './SortSelect'
import {
  categoryLabel,
  statusLabel,
  listingLabel,
  formatPrice,
  formatArea,
  bhkLabel,
  formatNumber
} from '../../utils/format'
import './FilterBar.css'

const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])

/**
 * Build the removable chip list from the current query values.
 * Each chip carries the patch that removes it.
 */
export function activeChips(values = {}) {
  const chips = []

  if (values.search) {
    chips.push({ id: 'search', label: `“${values.search}”`, patch: { search: '' } })
  }
  if (values.category) {
    chips.push({ id: 'category', label: categoryLabel(values.category), patch: { category: '' } })
  }
  if (values.listingType) {
    chips.push({
      id: 'listingType',
      label: listingLabel(values.listingType),
      patch: { listingType: '' }
    })
  }
  if (values.propertyType) {
    chips.push({ id: 'propertyType', label: values.propertyType, patch: { propertyType: '' } })
  }
  if (values.locality) {
    chips.push({ id: 'locality', label: values.locality, patch: { locality: '' } })
  }

  const statuses = toArray(values.status)
  statuses.forEach((status) => {
    chips.push({
      id: `status-${status}`,
      label: statusLabel(status),
      patch: { status: statuses.filter((s) => s !== status) }
    })
  })

  if (values.minPrice || values.maxPrice) {
    const lo = values.minPrice ? formatPrice(Number(values.minPrice)) : 'Any'
    const hi = values.maxPrice ? formatPrice(Number(values.maxPrice)) : 'Any'
    chips.push({
      id: 'budget',
      label: `${lo} to ${hi}`,
      patch: { minPrice: '', maxPrice: '' }
    })
  }

  if (values.bedrooms) {
    chips.push({
      id: 'bedrooms',
      label: bhkLabel(values.bedrooms) || `${values.bedrooms} BHK`,
      patch: { bedrooms: '' }
    })
  }

  if (values.minArea || values.maxArea) {
    chips.push({
      id: 'area',
      label: formatArea(values.minArea, values.maxArea, values.areaUnit || 'sqft'),
      patch: { minArea: '', maxArea: '' }
    })
  }

  return chips
}

/**
 * Mobile/tablet filter bar + the active-filter chip row (which desktop uses too).
 *
 * @param {{ values?: object, onChange: (patch: object) => void, onClear?: () => void,
 *           meta?: object, total?: number, loading?: boolean, className?: string }} props
 */
export default function FilterBar({
  values = {},
  onChange,
  onClear,
  meta = {},
  total = 0,
  loading = false,
  className = ''
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const chips = activeChips(values)
  const count = chips.length

  const resultText = loading
    ? 'Loading properties…'
    : `${formatNumber(total)} ${Number(total) === 1 ? 'property' : 'properties'}`

  return (
    <div className={`rk-filterbar ${className}`.trim()}>
      <div className="rk-filterbar__bar">
        <button
          type="button"
          className="rk-filterbar__open"
          onClick={() => setSheetOpen(true)}
          aria-expanded={sheetOpen}
          aria-haspopup="dialog"
        >
          <MdTune aria-hidden="true" />
          Filters
          {count > 0 && (
            <span className="rk-filterbar__count" aria-label={`${count} filters applied`}>
              {count}
            </span>
          )}
        </button>

        <p className="rk-filterbar__result" aria-live="polite">
          {resultText}
        </p>

        <SortSelect
          className="rk-filterbar__sort"
          value={values.sort || 'newest'}
          onChange={(sort) => onChange?.({ sort })}
        />
      </div>

      {count > 0 && (
        <div className="rk-filterbar__chips">
          <span className="rk-filterbar__chipslabel">Applied:</span>

          <ul className="rk-filterbar__chiplist">
            {chips.map((chip) => (
              <li key={chip.id}>
                <button
                  type="button"
                  className="rk-chip rk-chip--removable rk-filterbar__chip"
                  onClick={() => onChange?.(chip.patch)}
                >
                  <span>{chip.label}</span>
                  <span className="rk-chip__x" aria-hidden="true">
                    <MdClose />
                  </span>
                  <span className="sr-only">Remove filter</span>
                </button>
              </li>
            ))}
          </ul>

          <button type="button" className="rk-filterbar__clear" onClick={() => onClear?.()}>
            Clear all
          </button>
        </div>
      )}

      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filter properties"
        size="md"
        className="rk-filterbar__sheet"
        footer={
          <button
            type="button"
            className="rk-btn rk-btn--gold rk-btn--block"
            onClick={() => setSheetOpen(false)}
          >
            Show {formatNumber(total)} {Number(total) === 1 ? 'property' : 'properties'}
          </button>
        }
      >
        <FilterSidebar
          values={values}
          onChange={onChange}
          onClear={onClear}
          meta={meta}
          sticky={false}
          idPrefix="rk-sheet"
          className="rk-filterbar__panel"
        />
      </Modal>
    </div>
  )
}
