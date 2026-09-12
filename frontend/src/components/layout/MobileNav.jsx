import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  MdClose,
  MdKeyboardArrowDown,
  MdLocationOn,
  MdAccessTime,
  MdMailOutline,
  MdPhoneInTalk
} from 'react-icons/md'
import { FaWhatsapp } from 'react-icons/fa6'
import Logo from '../brand/Logo'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import { useSite } from '../../context/SiteContext'
import { NAV_LINKS } from '../../data/constants'
import { mailtoHref, phoneHref, whatsappHref } from '../../utils/format'
import './MobileNav.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Full-screen drawer for tablet/mobile. Slides in from the right over a
 * backdrop, locks page scroll, keeps focus inside itself, supports accordion
 * submenus and closes on Escape, backdrop click or a route change.
 *
 * @param {{ open: boolean, onClose: () => void, id?: string,
 *           links?: typeof NAV_LINKS }} props
 */
export default function MobileNav({ open, onClose, id = 'rk-mobile-nav', links = NAV_LINKS }) {
  const { settings } = useSite()
  const { pathname, hash } = useLocation()
  const [openGroup, setOpenGroup] = useState(null)

  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const closeFnRef = useRef(onClose)
  closeFnRef.current = onClose
  const openRef = useRef(open)
  openRef.current = open

  useLockBodyScroll(open)

  /* Close whenever the route (or in-page anchor) changes. */
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (openRef.current) closeFnRef.current()
  }, [pathname, hash])

  /* Focus the close button when the drawer opens, reset accordions when it shuts. */
  useEffect(() => {
    if (open) closeRef.current?.focus()
    else setOpenGroup(null)
  }, [open])

  const phone = settings.phones?.[0] || ''
  const secondaryPhone = settings.phones?.[1] || ''

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }

    if (event.key !== 'Tab' || !panelRef.current) return

    const items = Array.from(panelRef.current.querySelectorAll(FOCUSABLE)).filter(
      (el) => el.getClientRects().length > 0
    )
    if (!items.length) return

    const first = items[0]
    const last = items[items.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className={`rk-mobilenav${open ? ' is-open' : ''}`} onKeyDown={onKeyDown}>
      <button
        type="button"
        className="rk-mobilenav__backdrop"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        id={id}
        ref={panelRef}
        className="rk-mobilenav__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
      >
        <div className="rk-mobilenav__head">
          <Logo variant="dark" showTagline={false} size={40} />
          <button
            type="button"
            ref={closeRef}
            className="rk-mobilenav__close"
            aria-label="Close menu"
            onClick={onClose}
          >
            <MdClose aria-hidden="true" />
          </button>
        </div>

        <nav className="rk-mobilenav__nav" aria-label="Mobile">
          <ul className="rk-mobilenav__list">
            {links.map((item, index) => {
              const hasMenu = Array.isArray(item.children) && item.children.length > 0
              const isOpen = openGroup === index
              const panelId = `rk-mobilenav-group-${index}`

              return (
                <li className="rk-mobilenav__item" key={item.label}>
                  <div className="rk-mobilenav__row">
                    <NavLink
                      to={item.to}
                      className="rk-mobilenav__link"
                      end={item.to === '/'}
                      onClick={onClose}
                    >
                      {item.label}
                    </NavLink>

                    {hasMenu && (
                      <button
                        type="button"
                        className={`rk-mobilenav__toggle${isOpen ? ' is-open' : ''}`}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        aria-label={`${isOpen ? 'Hide' : 'Show'} ${item.label} submenu`}
                        onClick={() => setOpenGroup((current) => (current === index ? null : index))}
                      >
                        <MdKeyboardArrowDown aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {hasMenu && (
                    <ul className="rk-mobilenav__sublist" id={panelId} hidden={!isOpen}>
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <NavLink
                            to={child.to}
                            className="rk-mobilenav__sublink"
                            onClick={onClose}
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="rk-mobilenav__contact">
          <p className="rk-mobilenav__contact-title">Visit our office</p>

          <ul className="rk-mobilenav__contact-list">
            <li>
              <MdLocationOn aria-hidden="true" />
              <span>{settings.address}</span>
            </li>
            {phone && (
              <li>
                <MdPhoneInTalk aria-hidden="true" />
                <span>
                  <a href={phoneHref(phone)}>{phone}</a>
                  {secondaryPhone && (
                    <>
                      {' / '}
                      <a href={phoneHref(secondaryPhone)}>{secondaryPhone}</a>
                    </>
                  )}
                </span>
              </li>
            )}
            <li>
              <MdMailOutline aria-hidden="true" />
              <a href={mailtoHref(settings.email, 'Property enquiry — Rama Kripa Estates')}>
                {settings.email}
              </a>
            </li>
            <li>
              <MdAccessTime aria-hidden="true" />
              <span>{settings.hours}</span>
            </li>
          </ul>

          <div className="rk-mobilenav__cta">
            <Link className="rk-btn rk-btn--gold rk-btn--sm rk-btn--block" to="/enquiry" onClick={onClose}>
              Enquire Now
            </Link>

            <div className="rk-mobilenav__cta-row">
              {phone && (
                <a className="rk-btn rk-btn--outline rk-btn--sm" href={phoneHref(phone)}>
                  <MdPhoneInTalk className="rk-btn__icon" aria-hidden="true" />
                  Call
                </a>
              )}
              {settings.whatsapp && (
                <a
                  className="rk-btn rk-btn--green rk-btn--sm"
                  href={whatsappHref(
                    settings.whatsapp,
                    'Hello Rama Kripa Estates, I would like to know more about properties in Faridabad.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp className="rk-btn__icon" aria-hidden="true" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
