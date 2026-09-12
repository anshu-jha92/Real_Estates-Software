import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MdAdd,
  MdErrorOutline,
  MdMarkEmailUnread,
  MdRefresh,
  MdSettings,
  MdOpenInNew
} from 'react-icons/md'
import EmptyState from '../../components/ui/EmptyState'
import { api } from '../../api/client'
import { formatDate, formatNumber, phoneHref } from '../../utils/format'
import { getToken, handleAuthError } from './auth'
import { BuildingIcon, StarIcon, EnvelopeIcon, BookIcon } from '../../components/icons/BrandIcons'
import './admin.css'

const STATUS_LABEL = { new: 'New', contacted: 'Contacted', closed: 'Closed' }

function Tile({ icon: Icon, value, label, to, tone = '' }) {
  const body = (
    <>
      <span className="rk-adm-tile__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="rk-adm-tile__meta">
        <span className="rk-adm-tile__value">{value}</span>
        <span className="rk-adm-tile__label">{label}</span>
      </span>
    </>
  )

  const className = `rk-adm-tile ${tone}`.trim()
  return to ? (
    <Link className={className} to={to}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [featured, setFeatured] = useState(0)
  const [blogCount, setBlogCount] = useState(0)
  const [enquiries, setEnquiries] = useState([])
  const [newCount, setNewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const token = getToken()
    setLoading(true)
    setError('')

    try {
      const [statsRes, featuredRes, enquiryRes, blogRes] = await Promise.all([
        api.stats(),
        api.properties({ featured: true, isActive: 'all', limit: 1 }),
        api.admin.enquiries({ limit: 8 }, token),
        api.admin.blogs({ all: 'true', limit: 1 }, token)
      ])

      setStats(statsRes.data || null)
      setFeatured(featuredRes.total || 0)
      setEnquiries(enquiryRes.data || [])
      setNewCount(enquiryRes.counts?.new || 0)
      setBlogCount(blogRes.total || 0)
    } catch (err) {
      if (handleAuthError(err)) return
      setError(err.message || 'We could not load the dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Dashboard — Rama Kripa Estates Admin'
    load()
  }, [load])

  return (
    <div className="rk-adm">
      <header className="rk-adm-head">
        <div className="rk-adm-head__text">
          <h2 className="rk-adm-head__title">Welcome back</h2>
          <p className="rk-adm-head__sub">
            Everything on ramakripaestate.com is managed from here — listings across Greater Faridabad,
            buyer enquiries, articles and the contact details shown on every page.
          </p>
        </div>
        <div className="rk-adm-head__actions">
          <button type="button" className="rk-btn rk-btn--outline rk-btn--sm" onClick={load} disabled={loading}>
            <MdRefresh className="rk-btn__icon" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <p className="rk-adm-alert" role="alert">
          <MdErrorOutline aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      <section className="rk-adm-tiles" aria-label="Site totals">
        <Tile
          icon={BuildingIcon}
          value={loading ? '—' : formatNumber(stats?.total || 0)}
          label="Total properties"
          to="/admin/properties"
        />
        <Tile
          icon={StarIcon}
          value={loading ? '—' : formatNumber(featured)}
          label="Featured on home"
          to="/admin/properties?featured=true"
          tone="rk-adm-tile--gold"
        />
        <Tile
          icon={EnvelopeIcon}
          value={loading ? '—' : formatNumber(newCount)}
          label="New enquiries"
          to="/admin/enquiries?status=new"
          tone={newCount > 0 ? 'rk-adm-tile--danger' : 'rk-adm-tile--info'}
        />
        <Tile
          icon={BookIcon}
          value={loading ? '—' : formatNumber(blogCount)}
          label="Blog posts"
          to="/admin/blogs"
          tone="rk-adm-tile--info"
        />
      </section>

      <section className="rk-adm-quick" aria-label="Quick actions">
        <Link className="rk-btn rk-btn--gold rk-btn--md" to="/admin/properties/new">
          <MdAdd className="rk-btn__icon" aria-hidden="true" />
          Add property
        </Link>
        <Link className="rk-btn rk-btn--green rk-btn--md" to="/admin/enquiries">
          <MdMarkEmailUnread className="rk-btn__icon" aria-hidden="true" />
          View enquiries
        </Link>
        <Link className="rk-btn rk-btn--outline rk-btn--md" to="/admin/settings">
          <MdSettings className="rk-btn__icon" aria-hidden="true" />
          Site settings
        </Link>
        <a className="rk-btn rk-btn--ghost rk-btn--md" href="/" target="_blank" rel="noopener noreferrer">
          <MdOpenInNew className="rk-btn__icon" aria-hidden="true" />
          Open live site
        </a>
      </section>

      <section className="rk-adm-card" aria-label="Recent enquiries">
        <div className="rk-adm-card__head">
          <h3 className="rk-adm-card__title">
            Recent enquiries
            <small>The last eight people who contacted Rama Kripa Estates</small>
          </h3>
          <Link className="rk-btn rk-btn--outline rk-btn--sm rk-adm-card__spacer" to="/admin/enquiries">
            See all
          </Link>
        </div>

        {loading ? (
          <div className="rk-adm-skeleton-rows" role="status" aria-live="polite">
            <span className="sr-only">Loading recent enquiries…</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} aria-hidden="true" />
            ))}
          </div>
        ) : enquiries.length === 0 ? (
          <div className="rk-adm-state">
            <EmptyState
              icon={MdMarkEmailUnread}
              title="No enquiries yet"
              message="As soon as a buyer submits the enquiry form on the website, their details will appear here."
              action={
                <Link className="rk-btn rk-btn--outline rk-btn--sm" to="/admin/properties">
                  Review your listings
                </Link>
              }
            />
          </div>
        ) : (
          <div className="rk-adm-tablewrap">
            <table className="rk-adm-table">
              <caption className="sr-only">The eight most recent website enquiries</caption>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Interested in</th>
                  <th scope="col">Received</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((row) => (
                  <tr key={row._id}>
                    <td data-label="Name">
                      <span className="rk-adm-table__title">{row.name}</span>
                      {row.email && <span className="rk-adm-table__sub">{row.email}</span>}
                    </td>
                    <td data-label="Phone">
                      <a className="rk-adm-link" href={phoneHref(row.phone)}>
                        {row.phone}
                      </a>
                    </td>
                    <td data-label="Interested in">
                      {row.propertyTitle ? (
                        row.propertySlug ? (
                          <Link className="rk-adm-link" to={`/property/${row.propertySlug}`}>
                            {row.propertyTitle}
                          </Link>
                        ) : (
                          row.propertyTitle
                        )
                      ) : (
                        row.interestedIn || row.subject || 'General enquiry'
                      )}
                    </td>
                    <td data-label="Received" className="rk-adm-table__num">
                      {formatDate(row.createdAt)}
                    </td>
                    <td data-label="Status">
                      <span className={`rk-adm-pill rk-adm-pill--${row.status || 'new'}`}>
                        {STATUS_LABEL[row.status] || 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
