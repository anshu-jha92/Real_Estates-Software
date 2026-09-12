import { Link } from 'react-router-dom'
import { MdChevronRight, MdHome } from 'react-icons/md'
import './Breadcrumb.css'

/**
 * Breadcrumb trail with schema.org BreadcrumbList microdata. "Home" is added
 * automatically unless the caller already starts the trail there. The last
 * item always renders as plain text and carries `aria-current="page"`.
 *
 * @param {{ items?: Array<{ label: string, to?: string }>,
 *           variant?: 'dark'|'light', className?: string }} props
 */
export default function Breadcrumb({ items = [], variant = 'dark', className = '' }) {
  const trail = items[0]?.to === '/' ? items : [{ label: 'Home', to: '/' }, ...items]

  if (!trail.length) return null

  return (
    <nav
      className={`rk-crumbs rk-crumbs--${variant} ${className}`.trim()}
      aria-label="Breadcrumb"
    >
      <ol className="rk-crumbs__list" itemScope itemType="https://schema.org/BreadcrumbList">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1
          const isHome = index === 0 && item.to === '/'

          return (
            <li
              className="rk-crumbs__item"
              key={`${item.label}-${index}`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {isLast || !item.to ? (
                <span className="rk-crumbs__current" aria-current={isLast ? 'page' : undefined} itemProp="name">
                  {item.label}
                </span>
              ) : (
                <Link className="rk-crumbs__link" to={item.to} itemProp="item">
                  {isHome && <MdHome className="rk-crumbs__home" aria-hidden="true" />}
                  <span itemProp="name">{item.label}</span>
                </Link>
              )}

              <meta itemProp="position" content={String(index + 1)} />

              {!isLast && <MdChevronRight className="rk-crumbs__sep" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
