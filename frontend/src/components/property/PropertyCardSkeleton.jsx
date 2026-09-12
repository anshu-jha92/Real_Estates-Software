import './PropertyCardSkeleton.css'

/**
 * Shimmering stand-in that matches PropertyCard's dimensions exactly, so the
 * grid never jumps when real data arrives.
 *
 * @param {{ variant?: 'grid'|'wide'|'compact', className?: string }} props
 */
export default function PropertyCardSkeleton({ variant = 'grid', className = '' }) {
  return (
    <div
      className={`rk-pskel rk-pskel--${variant} ${className}`.trim()}
      aria-hidden="true"
      data-loading="true"
    >
      <div className="rk-pskel__media rk-skeleton" />

      <div className="rk-pskel__body">
        <span className="rk-pskel__price rk-skeleton" />
        <span className="rk-pskel__title rk-skeleton" />
        <span className="rk-pskel__title rk-pskel__title--short rk-skeleton" />
        <span className="rk-pskel__place rk-skeleton" />

        <div className="rk-pskel__specs">
          <span className="rk-skeleton" />
          <span className="rk-skeleton" />
          <span className="rk-skeleton" />
        </div>
      </div>

      {variant !== 'compact' && (
        <div className="rk-pskel__foot">
          <span className="rk-pskel__dev rk-skeleton" />
          <span className="rk-pskel__more rk-skeleton" />
        </div>
      )}
    </div>
  )
}
