import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  MdAdd,
  MdDeleteOutline,
  MdEdit,
  MdErrorOutline,
  MdOpenInNew,
  MdSearch
} from 'react-icons/md'
import Field from '../../components/forms/Field'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import useDebounce from '../../hooks/useDebounce'
import { api } from '../../api/client'
import { CATEGORIES, IMAGE_FALLBACK, STATUS_OPTIONS, onImageError } from '../../data/constants'
import { categoryLabel, formatNumber, formatPrice, locationLine, statusLabel } from '../../utils/format'
import { getToken, handleAuthError } from './auth'
import './admin.css'

const PAGE_SIZE = 12

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.key, label: c.label }))

const FEATURED_OPTIONS = [
  { value: 'true', label: 'Featured only' },
  { value: 'false', label: 'Not featured' }
]

const VISIBILITY_OPTIONS = [
  { value: 'true', label: 'Live on site' },
  { value: 'false', label: 'Hidden' }
]

export default function AdminProperties() {
  const [params, setParams] = useSearchParams()
  const toast = useToast()

  const page = Math.max(1, Number(params.get('page')) || 1)
  const category = params.get('category') || ''
  const status = params.get('status') || ''
  const featured = params.get('featured') || ''
  const visibility = params.get('isActive') || ''

  const [searchInput, setSearchInput] = useState(params.get('search') || '')
  const search = useDebounce(searchInput, 400)

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  /** Write one filter into the URL and reset to page 1 (except when paging). */
  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value === '' || value === null || value === undefined) next.delete(key)
    else next.set(key, String(value))
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  // Keep the debounced search box in the URL so a reload keeps the results.
  useEffect(() => {
    const current = params.get('search') || ''
    if (search === current) return
    const next = new URLSearchParams(params)
    if (search) next.set('search', search)
    else next.delete('search')
    next.delete('page')
    setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.properties({
        search: params.get('search') || '',
        category,
        status,
        featured,
        isActive: visibility || 'all',
        page,
        limit: PAGE_SIZE,
        sort: 'newest'
      })
      setRows(res.data || [])
      setTotal(res.total || 0)
      setPages(res.pages || 1)
    } catch (err) {
      if (handleAuthError(err)) return
      setRows([])
      setError(err.message || 'We could not load your listings.')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()])

  useEffect(() => {
    document.title = 'Properties — Rama Kripa Estates Admin'
    load()
  }, [load])

  const toggleFeatured = async (property) => {
    const nextValue = !property.isFeatured
    setTogglingId(property._id)
    // Optimistic: the switch must feel instant on a slow Faridabad 4G connection.
    setRows((list) => list.map((r) => (r._id === property._id ? { ...r, isFeatured: nextValue } : r)))

    try {
      await api.admin.updateProperty(property._id, { isFeatured: nextValue }, getToken())
      toast.success(
        nextValue ? 'Added to Featured' : 'Removed from Featured',
        `"${property.title}" ${nextValue ? 'now appears' : 'no longer appears'} on the home page.`
      )
    } catch (err) {
      setRows((list) => list.map((r) => (r._id === property._id ? { ...r, isFeatured: !nextValue } : r)))
      if (handleAuthError(err)) return
      toast.error('Could not update', err.message || 'Please try again.')
    } finally {
      setTogglingId('')
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await api.admin.deleteProperty(pendingDelete._id, getToken())
      toast.success('Property deleted', `"${pendingDelete.title}" has been removed from the website.`)
      setPendingDelete(null)
      // Step back a page if we just emptied the last one.
      if (rows.length === 1 && page > 1) setParam('page', page - 1)
      else load()
    } catch (err) {
      if (handleAuthError(err)) return
      toast.error('Could not delete', err.message || 'Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    setParams(new URLSearchParams(), { replace: true })
  }

  const hasFilters = Boolean(searchInput || category || status || featured || visibility)
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(total, page * PAGE_SIZE)

  return (
    <div className="rk-adm">
      <header className="rk-adm-head">
        <div className="rk-adm-head__text">
          <h2 className="rk-adm-head__title">Properties</h2>
          <p className="rk-adm-head__sub">
            Every listing on the site — apartments, floors, plots, shops and office space across Faridabad.
            Toggle <strong>Featured</strong> to control what shows on the home page.
          </p>
        </div>
        <div className="rk-adm-head__actions">
          <Link className="rk-btn rk-btn--gold rk-btn--md" to="/admin/properties/new">
            <MdAdd className="rk-btn__icon" aria-hidden="true" />
            Add property
          </Link>
        </div>
      </header>

      {error && (
        <p className="rk-adm-alert" role="alert">
          <MdErrorOutline aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      <section className="rk-adm-card">
        <div className="rk-adm-toolbar">
          <div className="rk-adm-toolbar__row">
            <Field
              className="rk-field--search"
              label="Search listings"
              name="search"
              type="search"
              placeholder="Title, developer, sector or locality"
              icon={<MdSearch />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Field
              as="select"
              label="Category"
              name="category"
              placeholder="All categories"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(e) => setParam('category', e.target.value)}
            />
            <Field
              as="select"
              label="Status"
              name="status"
              placeholder="Any status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setParam('status', e.target.value)}
            />
            <Field
              as="select"
              label="Featured"
              name="featured"
              placeholder="All listings"
              options={FEATURED_OPTIONS}
              value={featured}
              onChange={(e) => setParam('featured', e.target.value)}
            />
            <Field
              as="select"
              label="Visibility"
              name="isActive"
              placeholder="Live and hidden"
              options={VISIBILITY_OPTIONS}
              value={visibility}
              onChange={(e) => setParam('isActive', e.target.value)}
            />
          </div>

          <div className="rk-adm-toolbar__row">
            <p className="rk-adm-count">
              <strong>{formatNumber(total)}</strong> {total === 1 ? 'listing' : 'listings'}
              {hasFilters ? ' matching your filters' : ' in total'}
            </p>
            {hasFilters && (
              <button type="button" className="rk-btn rk-btn--ghost rk-btn--sm" onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="rk-adm-skeleton-rows" role="status" aria-live="polite">
            <span className="sr-only">Loading properties…</span>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} aria-hidden="true" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rk-adm-state">
            <EmptyState
              title={hasFilters ? 'No listings match these filters' : 'No properties yet'}
              message={
                hasFilters
                  ? 'Try a different category or clear the filters to see everything you have published.'
                  : 'Add your first Faridabad listing and it will appear on the website straight away.'
              }
              action={
                hasFilters ? (
                  <button type="button" className="rk-btn rk-btn--outline rk-btn--sm" onClick={clearFilters}>
                    Clear all filters
                  </button>
                ) : (
                  <Link className="rk-btn rk-btn--gold rk-btn--sm" to="/admin/properties/new">
                    Add your first property
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <>
            <div className="rk-adm-tablewrap">
              <table className="rk-adm-table">
                <caption className="sr-only">All properties, newest first</caption>
                <thead>
                  <tr>
                    <th scope="col">Photo</th>
                    <th scope="col">Property</th>
                    <th scope="col">Category</th>
                    <th scope="col">Locality</th>
                    <th scope="col">Price</th>
                    <th scope="col">Status</th>
                    <th scope="col">Featured</th>
                    <th scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row._id}>
                      <td data-label="Photo">
                        <img
                          className="rk-adm-thumb"
                          src={row.thumbnail || row.images?.[0] || IMAGE_FALLBACK}
                          alt=""
                          width="66"
                          height="48"
                          loading="lazy"
                          decoding="async"
                          onError={onImageError}
                        />
                      </td>
                      <td data-label="Property">
                        <span className="rk-adm-table__title">{row.title}</span>
                        <span className="rk-adm-table__sub">
                          {[row.propertyType, row.developer].filter(Boolean).join(' · ') || 'Rama Kripa listing'}
                          {row.isActive === false ? ' · Hidden' : ''}
                        </span>
                      </td>
                      <td data-label="Category">
                        <span className="rk-adm-pill rk-adm-pill--muted">{categoryLabel(row.category)}</span>
                      </td>
                      <td data-label="Locality">{locationLine(row.location) || 'Faridabad'}</td>
                      <td data-label="Price" className="rk-adm-table__num">
                        {formatPrice(row.price, {
                          priceOnRequest: row.priceOnRequest,
                          priceUnit: row.priceUnit,
                          maxPrice: row.maxPrice
                        })}
                      </td>
                      <td data-label="Status">
                        <span className={`rk-adm-pill ${row.isActive === false ? 'rk-adm-pill--off' : 'rk-adm-pill--live'}`}>
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td data-label="Featured">
                        <button
                          type="button"
                          className="rk-adm-switch"
                          aria-pressed={Boolean(row.isFeatured)}
                          aria-label={`${row.isFeatured ? 'Remove' : 'Add'} "${row.title}" ${
                            row.isFeatured ? 'from' : 'to'
                          } the featured list`}
                          disabled={togglingId === row._id}
                          onClick={() => toggleFeatured(row)}
                        />
                      </td>
                      <td data-label="">
                        <div className="rk-adm-rowactions">
                          {row.slug && (
                            <a
                              className="rk-adm-iconbtn"
                              href={`/property/${row.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View on the website"
                              aria-label={`View "${row.title}" on the website`}
                            >
                              <MdOpenInNew aria-hidden="true" />
                            </a>
                          )}
                          <Link
                            className="rk-adm-iconbtn"
                            to={`/admin/properties/${row._id}/edit`}
                            title="Edit"
                            aria-label={`Edit "${row.title}"`}
                          >
                            <MdEdit aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            className="rk-adm-iconbtn rk-adm-iconbtn--danger"
                            onClick={() => setPendingDelete(row)}
                            title="Delete"
                            aria-label={`Delete "${row.title}"`}
                          >
                            <MdDeleteOutline aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rk-adm-pager">
              <p className="rk-adm-pager__info">
                Showing {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
              </p>
              <div className="rk-adm-pager__nav">
                <button
                  type="button"
                  className="rk-btn rk-btn--outline rk-btn--sm"
                  onClick={() => setParam('page', page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="rk-btn rk-btn--outline rk-btn--sm"
                  onClick={() => setParam('page', page + 1)}
                  disabled={page >= pages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => (deleting ? null : setPendingDelete(null))}
        title="Delete this property?"
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="rk-btn rk-btn--ghost rk-btn--sm"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rk-btn rk-btn--green rk-btn--sm"
              onClick={confirmDelete}
              disabled={deleting}
              data-autofocus
            >
              {deleting ? 'Deleting…' : 'Yes, delete it'}
            </button>
          </>
        }
      >
        <p className="rk-adm-note">
          <strong>{pendingDelete?.title}</strong> will be permanently removed from the website, including
          from search results and the home page. This cannot be undone.
        </p>
        <p className="rk-adm-note" style={{ marginTop: 10 }}>
          To take it off the site temporarily instead, edit the listing and switch{' '}
          <strong>Visible on the website</strong> off.
        </p>
      </Modal>
    </div>
  )
}
