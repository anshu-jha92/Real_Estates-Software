import { useId, useState } from 'react'
import { MdExpandMore } from 'react-icons/md'
import { getAmenityIcon } from '../../data/constants'
import './AmenityList.css'

/**
 * Icon grid of project amenities. Anything not in AMENITY_ICONS still gets a
 * sensible tick icon, so unseeded values never render blank.
 *
 * @param {{ amenities?: string[], initial?: number, className?: string }} props
 */
export default function AmenityList({ amenities, initial = 12, className = '' }) {
  const [expanded, setExpanded] = useState(false)
  const gridId = `rk-amenity-grid-${useId().replace(/:/g, '')}`

  const list = (Array.isArray(amenities) ? amenities : [])
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)

  if (!list.length) {
    return (
      <p className={`rk-amen__none ${className}`.trim()}>
        Amenity details for this property are being confirmed with the developer. Call us on
        +91 98110 00000 and we will share the latest project brochure.
      </p>
    )
  }

  const collapsible = list.length > initial
  const visible = collapsible && !expanded ? list.slice(0, initial) : list

  return (
    <div className={`rk-amen ${className}`.trim()}>
      <ul className="rk-amen__grid" id={gridId}>
        {visible.map((name) => {
          const Icon = getAmenityIcon(name)
          return (
            <li className="rk-amen__item" key={name}>
              <span className="rk-amen__icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="rk-amen__label">{name}</span>
            </li>
          )
        })}
      </ul>

      {collapsible && (
        <button
          type="button"
          className="rk-amen__toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={gridId}
        >
          {expanded ? 'Show fewer amenities' : `Show all ${list.length} amenities`}
          <MdExpandMore aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
