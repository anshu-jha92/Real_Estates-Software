import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { MdKeyboardArrowDown, MdMenu, MdPhoneInTalk } from 'react-icons/md'
import Logo from '../brand/Logo'
import MobileNav from './MobileNav'
import { useSite } from '../../context/SiteContext'
import { NAV_LINKS } from '../../data/constants'
import { phoneHref } from '../../utils/format'
import './Header.css'

const MOBILE_NAV_ID = 'rk-mobile-nav'

const linkClass = ({ isActive }) => `rk-header__link${isActive ? ' is-active' : ''}`

/**
 * Sticky primary header. Cream while the page is at the top, solid white with
 * a shadow and a shorter bar once the user scrolls past 40px. Desktop nav has
 * hover/keyboard dropdowns; below 1024px it collapses into MobileNav.
 */
export default function Header() {
  const { settings } = useSite()
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [navOpen, setNavOpen] = useState(false)

  const burgerRef = useRef(null)
  const caretRefs = useRef({})

  const phone = settings.phones?.[0] || ''

  /* Shadow / compact state — passive listener, one state write per frame. */
  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40)
        ticking = false
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeNav = useCallback(() => {
    setNavOpen(false)
    burgerRef.current?.focus()
  }, [])

  /* Escape anywhere in the nav closes the open dropdown and parks focus on
     its toggle so keyboard users are not stranded inside a hidden menu. */
  const onNavKeyDown = (event) => {
    if (event.key !== 'Escape' || openMenu === null) return
    event.stopPropagation()
    const caret = caretRefs.current[openMenu]
    setOpenMenu(null)
    caret?.focus()
  }

  return (
    <>
      <header className={`rk-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="rk-container rk-header__inner">
          <Logo variant="dark" showTagline={!scrolled} size={scrolled ? 40 : 46} />

          <nav className="rk-header__nav" aria-label="Primary" onKeyDown={onNavKeyDown}>
            <ul className="rk-header__list">
              {NAV_LINKS.map((item, index) => {
                const hasMenu = Array.isArray(item.children) && item.children.length > 0
                const isOpen = openMenu === index
                const menuId = `rk-menu-${index}`

                if (!hasMenu) {
                  return (
                    <li className="rk-header__item" key={item.label}>
                      <NavLink to={item.to} className={linkClass} end={item.to === '/'}>
                        {item.label}
                      </NavLink>
                    </li>
                  )
                }

                return (
                  <li
                    className={`rk-header__item rk-header__item--menu${isOpen ? ' is-open' : ''}`}
                    key={item.label}
                    onMouseEnter={() => setOpenMenu(index)}
                    onMouseLeave={() => setOpenMenu((current) => (current === index ? null : current))}
                    onFocus={(event) => {
                      if (event.target.dataset.caret !== 'true') setOpenMenu(index)
                    }}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) {
                        setOpenMenu((current) => (current === index ? null : current))
                      }
                    }}
                  >
                    <NavLink to={item.to} className={linkClass}>
                      {item.label}
                    </NavLink>

                    <button
                      type="button"
                      data-caret="true"
                      ref={(node) => {
                        caretRefs.current[index] = node
                      }}
                      className="rk-header__caret"
                      aria-expanded={isOpen}
                      aria-controls={menuId}
                      aria-label={`${item.label} submenu`}
                      onClick={() => setOpenMenu((current) => (current === index ? null : index))}
                    >
                      <MdKeyboardArrowDown aria-hidden="true" />
                    </button>

                    <ul className="rk-header__menu" id={menuId}>
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <NavLink
                            to={child.to}
                            className="rk-header__menu-link"
                            onClick={() => setOpenMenu(null)}
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="rk-header__actions">
            {phone && (
              <a className="rk-header__phone" href={phoneHref(phone)}>
                <span className="rk-header__phone-icon" aria-hidden="true">
                  <MdPhoneInTalk />
                </span>
                <span className="rk-header__phone-text">
                  <span className="rk-header__phone-label">Talk to us</span>
                  <span className="rk-header__phone-number">{phone}</span>
                </span>
              </a>
            )}

            <Link className="rk-btn rk-btn--gold rk-btn--sm rk-header__cta" to="/enquiry">
              Enquire Now
            </Link>

            <button
              type="button"
              ref={burgerRef}
              className="rk-header__burger"
              aria-expanded={navOpen}
              aria-controls={MOBILE_NAV_ID}
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setNavOpen((open) => !open)}
            >
              <MdMenu aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav id={MOBILE_NAV_ID} open={navOpen} onClose={closeNav} />
    </>
  )
}
