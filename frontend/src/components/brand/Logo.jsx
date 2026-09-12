import { Link } from 'react-router-dom'
import LogoMark from './LogoMark'
import './Logo.css'

/**
 * Full lockup: mark + "RAMA KRIPA" wordmark, letter-spaced "ESTATES" rule and
 * the tagline (BUILD_SPEC §12). Always links home.
 *
 * @param {{ variant?: 'dark'|'light', showTagline?: boolean, size?: number,
 *           to?: string, className?: string }} props
 */
export default function Logo({
  variant = 'dark',
  showTagline = true,
  size = 46,
  to = '/',
  className = ''
}) {
  const isLight = variant === 'light'

  return (
    <Link
      to={to}
      className={`rk-logo ${isLight ? 'rk-logo--light' : 'rk-logo--dark'} ${className}`.trim()}
      aria-label="Rama Kripa Estates — home"
    >
      <LogoMark size={size} />

      <span className="rk-logo__text">
        <span className="rk-logo__name">Rama Kripa</span>
        <span className="rk-logo__sub">
          <span className="rk-logo__rule" aria-hidden="true" />
          <span className="rk-logo__estate">Estates</span>
          <span className="rk-logo__rule" aria-hidden="true" />
        </span>
        {showTagline && <span className="rk-logo__tagline">Blessings in Every Address</span>}
      </span>
    </Link>
  )
}
