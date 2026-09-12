import { MdSearchOff } from 'react-icons/md'
import EmptyState from '../ui/EmptyState'
import Reveal from '../ui/Reveal'
import PropertyCard from './PropertyCard'
import PropertyCardSkeleton from './PropertyCardSkeleton'
import './PropertyGrid.css'

/**
 * Property list surface used by Home, Properties, Localities and SimilarProperties.
 * Handles all three states: loading (skeletons), empty (EmptyState) and loaded
 * (staggered reveal).
 *
 * @param {{ properties?: object[], loading?: boolean, count?: number,
 *           variant?: 'grid'|'wide'|'compact', emptyTitle?: string,
 *           emptyMessage?: React.ReactNode, emptyAction?: React.ReactNode,
 *           className?: string }} props
 */
export default function PropertyGrid({
  properties,
  loading = false,
  count = 6,
  variant = 'grid',
  emptyTitle = 'No properties matched your search',
  emptyMessage = 'Try widening the budget or clearing a filter. You can also call us on +91 98110 00000 and we will shortlist Faridabad options for you.',
  emptyAction,
  className = ''
}) {
  const list = Array.isArray(properties) ? properties : []
  const wrapper = `rk-pgrid rk-pgrid--${variant} ${className}`.trim()

  if (loading) {
    return (
      <div className={wrapper} role="status" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading properties…</span>
        {Array.from({ length: Math.max(1, count) }, (_, i) => (
          <PropertyCardSkeleton key={`skeleton-${i}`} variant={variant} />
        ))}
      </div>
    )
  }

  if (!list.length) {
    return (
      <EmptyState
        icon={MdSearchOff}
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
        className="rk-pgrid__empty"
      />
    )
  }

  return (
    <div className={wrapper}>
      {list.map((property, index) => (
        <Reveal
          key={property?._id || property?.id || property?.slug || `property-${index}`}
          delay={Math.min(index, 5) * 80}
          className="rk-pgrid__item"
        >
          <PropertyCard property={property} variant={variant} />
        </Reveal>
      ))}
    </div>
  )
}
