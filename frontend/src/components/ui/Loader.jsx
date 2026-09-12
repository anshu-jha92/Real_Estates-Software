import './Loader.css'

/**
 * Route-level and inline loading indicator. Announces itself politely so a
 * screen reader user knows the page is still working.
 *
 * @param {{ label?: string, full?: boolean, size?: 'sm'|'md'|'lg', className?: string }} props
 */
export default function Loader({
  label = 'Loading Faridabad properties…',
  full = false,
  size = 'md',
  className = ''
}) {
  return (
    <div
      className={`rk-loader ${full ? 'rk-loader--full' : ''} rk-loader--${size} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <span className="rk-loader__ring" aria-hidden="true">
        <span className="rk-loader__dot" />
      </span>
      <span className="rk-loader__label">{label}</span>
    </div>
  )
}
