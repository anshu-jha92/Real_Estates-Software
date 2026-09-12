import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  MdSpaceDashboard,
  MdApartment,
  MdMarkEmailUnread,
  MdArticle,
  MdFormatQuote,
  MdGroups,
  MdPlace,
  MdManageAccounts,
  MdSettings,
  MdLogout,
  MdMenu,
  MdClose,
  MdOpenInNew
} from 'react-icons/md'
import LogoMark from '../components/brand/LogoMark'
import { ADMIN_USER_EVENT, clearToken, getStoredUser } from '../api/client'
import useLockBodyScroll from '../hooks/useLockBodyScroll'
import './AdminLayout.css'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: MdSpaceDashboard, end: true },
  { to: '/admin/properties', label: 'Properties', icon: MdApartment },
  { to: '/admin/enquiries', label: 'Enquiries', icon: MdMarkEmailUnread },
  { to: '/admin/blogs', label: 'Blogs', icon: MdArticle },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MdFormatQuote },
  { to: '/admin/team', label: 'Team', icon: MdGroups },
  { to: '/admin/localities', label: 'Localities', icon: MdPlace },
  { to: '/admin/settings', label: 'Settings', icon: MdSettings },
  { to: '/admin/account', label: 'My Account', icon: MdManageAccounts }
]

/** Admin shell: fixed sidebar on desktop, off-canvas drawer under 900px. */
export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(getStoredUser)

  useLockBodyScroll(drawerOpen)

  useEffect(() => {
    const sync = () => setUser(getStoredUser())
    window.addEventListener(ADMIN_USER_EVENT, sync)
    return () => window.removeEventListener(ADMIN_USER_EVENT, sync)
  }, [])

  // Close the drawer on navigation.
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  const currentLabel =
    [...NAV].reverse().find((item) => location.pathname.startsWith(item.to))?.label || 'Dashboard'

  const handleLogout = () => {
    clearToken()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className={`rk-admin ${drawerOpen ? 'is-drawer-open' : ''}`.trim()}>
      <aside className="rk-admin__sidebar" id="rk-admin-sidebar">
        <div className="rk-admin__brand">
          <LogoMark size={38} />
          <span className="rk-admin__brand-text">
            <strong>Rama Kripa</strong>
            <small>Control Panel</small>
          </span>
          <button
            type="button"
            className="rk-admin__drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <MdClose aria-hidden="true" />
          </button>
        </div>

        <nav className="rk-admin__nav" aria-label="Admin sections">
          <ul>
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `rk-admin__link ${isActive ? 'is-active' : ''}`.trim()
                  }
                >
                  <Icon className="rk-admin__link-icon" aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="rk-admin__sidebar-foot">
          <a className="rk-admin__view-site" href="/" target="_blank" rel="noopener noreferrer">
            <MdOpenInNew aria-hidden="true" />
            View live site
          </a>
        </div>
      </aside>

      <button
        type="button"
        className="rk-admin__scrim"
        onClick={() => setDrawerOpen(false)}
        tabIndex={drawerOpen ? 0 : -1}
        aria-hidden={!drawerOpen}
        aria-label="Close menu"
      />

      <div className="rk-admin__main">
        <header className="rk-admin__topbar">
          <button
            type="button"
            className="rk-admin__burger"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-expanded={drawerOpen}
            aria-controls="rk-admin-sidebar"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          >
            {drawerOpen ? <MdClose aria-hidden="true" /> : <MdMenu aria-hidden="true" />}
          </button>

          <h1 className="rk-admin__heading">{currentLabel}</h1>

          <div className="rk-admin__user">
            <span className="rk-admin__user-meta">
              <strong>{user?.name || 'Administrator'}</strong>
              <small>{user?.email || 'info@ramakripaestate.com'}</small>
            </span>
            <button type="button" className="rk-btn rk-btn--outline rk-btn--sm" onClick={handleLogout}>
              <MdLogout className="rk-btn__icon" aria-hidden="true" />
              Log out
            </button>
          </div>
        </header>

        <main className="rk-admin__content" id="admin-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
