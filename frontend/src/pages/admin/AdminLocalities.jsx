import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MdAdd,
  MdClose,
  MdDeleteOutline,
  MdEdit,
  MdErrorOutline,
  MdOpenInNew,
  MdPlace
} from 'react-icons/md'
import Field from '../../components/forms/Field'
import MediaInput from '../../components/forms/MediaInput'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../api/client'
import { IMAGE_FALLBACK, onImageError } from '../../data/constants'
import { formatNumber, formatPrice, slugify } from '../../utils/format'
import { getToken, handleAuthError } from './auth'
import './admin.css'

const EMPTY_LOCALITY = {
  name: '',
  slug: '',
  city: 'Faridabad',
  state: 'Haryana',
  image: '',
  description: '',
  aliases: [],
  priceFrom: '',
  priceNote: '',
  isFeatured: false,
  isActive: true,
  order: 100
}

export default function AdminLocalities() {
  const toast = useToast()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [aliasDraft, setAliasDraft] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.admin.localities({ all: 'true' }, getToken())
      setRows(res.data || [])
    } catch (err) {
      if (handleAuthError(err)) return
      setRows([])
      setError(err.message || 'We could not load your localities.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Localities — Rama Kripa Estates Admin'
    load()
  }, [load])

  const startCreate = () => {
    setEditing({ ...EMPTY_LOCALITY })
    setSlugTouched(false)
    setAliasDraft('')
    setFormErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startEdit = (row) => {
    setEditing({ ...EMPTY_LOCALITY, ...row, priceFrom: row.priceFrom ?? '' })
    setSlugTouched(true)
    setAliasDraft('')
    setFormErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const setField = (name, value) => setEditing((prev) => ({ ...prev, [name]: value }))

  const onNameChange = (event) => {
    const name = event.target.value
    setEditing((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }))
  }

  const addAlias = () => {
    const value = aliasDraft.trim()
    if (!value) return
    if (!editing.aliases.some((a) => a.toLowerCase() === value.toLowerCase())) {
      setField('aliases', [...editing.aliases, value])
    }
    setAliasDraft('')
  }

  const saveLocality = async (event) => {
    event.preventDefault()

    const next = {}
    if (!editing.name.trim()) next.name = 'Give the locality a name.'
    if (editing.priceFrom !== '' && Number(editing.priceFrom) < 0) {
      next.priceFrom = 'Enter a positive amount.'
    }
    setFormErrors(next)

    if (Object.keys(next).length) {
      toast.error('Please check the form', 'Some required details are missing.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: editing.name.trim(),
        slug: slugify(editing.slug || editing.name),
        city: editing.city.trim() || 'Faridabad',
        state: editing.state.trim() || 'Haryana',
        image: editing.image.trim(),
        description: editing.description.trim(),
        aliases: editing.aliases,
        priceFrom: editing.priceFrom === '' ? null : Number(editing.priceFrom),
        priceNote: editing.priceNote.trim(),
        isFeatured: Boolean(editing.isFeatured),
        isActive: Boolean(editing.isActive),
        order: Number(editing.order) || 100
      }

      const token = getToken()
      if (editing._id) await api.admin.updateLocality(editing._id, payload, token)
      else await api.admin.createLocality(payload, token)

      toast.success(
        editing._id ? 'Locality updated' : 'Locality added',
        payload.isActive
          ? `${payload.name} is live at /locality/${payload.slug}.`
          : `${payload.name} has been saved but stays hidden.`
      )
      setEditing(null)
      load()
    } catch (err) {
      if (handleAuthError(err)) return
      if (err.errors) setFormErrors(err.errors)
      toast.error('Could not save', err.message || 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const patchRow = async (row, updates, message) => {
    const previous = rows
    setRows((list) => list.map((r) => (r._id === row._id ? { ...r, ...updates } : r)))
    try {
      await api.admin.updateLocality(row._id, updates, getToken())
      if (message) toast.success(message, row.name)
    } catch (err) {
      setRows(previous)
      if (handleAuthError(err)) return
      toast.error('Could not update', err.message || 'Please try again.')
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await api.admin.deleteLocality(pendingDelete._id, getToken())
      toast.success('Locality deleted', `${pendingDelete.name} has been removed.`)
      setPendingDelete(null)
      load()
    } catch (err) {
      if (handleAuthError(err)) return
      toast.error('Could not delete', err.message || 'Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const liveCount = rows.filter((r) => r.isActive).length
  const featuredCount = rows.filter((r) => r.isFeatured && r.isActive).length

  return (
    <div className="rk-adm">
      <header className="rk-adm-head">
        <div className="rk-adm-head__text">
          <h2 className="rk-adm-head__title">Localities</h2>
          <p className="rk-adm-head__sub">
            The Faridabad sectors and belts you work in. Featured localities appear on the home page;
            all visible ones are listed at /localities. Listing counts are calculated automatically.
          </p>
        </div>
        {!editing && (
          <div className="rk-adm-head__actions">
            <button type="button" className="rk-btn rk-btn--gold rk-btn--md" onClick={startCreate}>
              <MdAdd className="rk-btn__icon" aria-hidden="true" />
              Add a locality
            </button>
          </div>
        )}
      </header>

      {error && (
        <p className="rk-adm-alert" role="alert">
          <MdErrorOutline aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      {editing && (
        <section className="rk-adm-card" aria-label={editing._id ? 'Edit locality' : 'New locality'}>
          <div className="rk-adm-card__head">
            <h3 className="rk-adm-card__title">
              {editing._id ? 'Edit locality' : 'New locality'}
              <small>
                {editing._id ? `/locality/${editing.slug}` : 'Saved straight to the website'}
              </small>
            </h3>
            <button
              type="button"
              className="rk-adm-iconbtn rk-adm-card__spacer"
              onClick={() => setEditing(null)}
              aria-label="Close the editor"
              title="Close"
            >
              <MdClose aria-hidden="true" />
            </button>
          </div>

          <form className="rk-adm-card__body" onSubmit={saveLocality} noValidate>
            <div className="rk-adm-grid rk-adm-grid--2">
              <Field
                label="Locality name"
                name="l-name"
                value={editing.name}
                onChange={onNameChange}
                error={formErrors.name}
                placeholder="Sector 88"
                required
              />
              <Field
                label="Web address (slug)"
                name="l-slug"
                value={editing.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setField('slug', e.target.value)
                }}
                hint="Filled in from the name. Changing it changes the public link."
                placeholder="sector-88"
              />
              <Field
                label="City"
                name="l-city"
                value={editing.city}
                onChange={(e) => setField('city', e.target.value)}
                placeholder="Faridabad"
              />
              <Field
                label="State"
                name="l-state"
                value={editing.state}
                onChange={(e) => setField('state', e.target.value)}
                placeholder="Haryana"
              />

              <div className="rk-adm-span-2">
                <MediaInput
                  label="Locality photo"
                  value={editing.image}
                  onChange={(url) => setField('image', url)}
                  folder="localities"
                  hint="Shown on the locality card on the home page and at /localities."
                  previewShape="wide"
                />
              </div>

              <Field
                as="textarea"
                className="rk-adm-span-2"
                label="Short description"
                name="l-description"
                rows={3}
                value={editing.description}
                onChange={(e) => setField('description', e.target.value)}
                hint="One or two lines about who this sector suits."
                placeholder="Wide sector roads, close to the bypass and the Escorts Mujesar metro. Popular with families buying their first 3 BHK."
              />

              <Field
                label="Starting price"
                name="l-pricefrom"
                type="number"
                value={editing.priceFrom}
                onChange={(e) => setField('priceFrom', e.target.value)}
                error={formErrors.priceFrom}
                hint="In rupees. Leave empty to show nothing."
                placeholder="6500000"
              />
              <Field
                label="Price note"
                name="l-pricenote"
                value={editing.priceNote}
                onChange={(e) => setField('priceNote', e.target.value)}
                hint="Shown next to the price."
                placeholder="for a 3 BHK builder floor"
              />

              <div className="rk-adm-span-2">
                <span className="rk-label">Also known as</span>
                <p className="rk-adm-note" style={{ marginTop: 0 }}>
                  Sector numbers and road names that belong to this locality. Listings matching any of
                  these are counted here, so add every name buyers actually use.
                </p>
                {editing.aliases.length > 0 && (
                  <ul className="rk-adm-tags" style={{ marginBottom: 10, listStyle: 'none' }}>
                    {editing.aliases.map((alias, index) => (
                      <li className="rk-adm-tag" key={`${alias}-${index}`}>
                        {alias}
                        <button
                          type="button"
                          onClick={() =>
                            setField(
                              'aliases',
                              editing.aliases.filter((_, i) => i !== index)
                            )
                          }
                          aria-label={`Remove ${alias}`}
                        >
                          <MdClose aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="rk-adm-tagadd">
                  <Field
                    label="Add another name"
                    name="l-alias"
                    value={aliasDraft}
                    placeholder="Neharpar"
                    onChange={(e) => setAliasDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addAlias()
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="rk-btn rk-btn--outline rk-btn--sm"
                    onClick={addAlias}
                  >
                    <MdAdd className="rk-btn__icon" aria-hidden="true" />
                    Add
                  </button>
                </div>
              </div>

              <Field
                label="Display order"
                name="l-order"
                type="number"
                value={editing.order}
                onChange={(e) => setField('order', e.target.value)}
                hint="Lower numbers show first. Leave at 100 if unsure."
              />

              <label className="rk-adm-check rk-adm-span-2">
                <input
                  type="checkbox"
                  checked={editing.isFeatured}
                  onChange={(e) => setField('isFeatured', e.target.checked)}
                />
                <span>
                  <strong>Feature on the home page</strong>
                  <small>Featured localities get a card in the home page showcase.</small>
                </span>
              </label>

              <label className="rk-adm-check rk-adm-span-2">
                <input
                  type="checkbox"
                  checked={editing.isActive}
                  onChange={(e) => setField('isActive', e.target.checked)}
                />
                <span>
                  <strong>Visible on the website</strong>
                  <small>Uncheck to keep the locality saved but hidden from visitors.</small>
                </span>
              </label>
            </div>

            <div className="rk-adm-footbar">
              <p className="rk-adm-footbar__note">Changes go live as soon as you save.</p>
              <div className="rk-adm-footbar__actions">
                <button
                  type="button"
                  className="rk-btn rk-btn--ghost rk-btn--md"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="rk-btn rk-btn--gold rk-btn--md" disabled={saving}>
                  {saving ? 'Saving…' : editing._id ? 'Save changes' : 'Add locality'}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      <section className="rk-adm-card">
        <div className="rk-adm-card__head">
          <h3 className="rk-adm-card__title">
            All localities
            <small>
              {formatNumber(rows.length)} saved · {formatNumber(liveCount)} visible ·{' '}
              {formatNumber(featuredCount)} featured on home
            </small>
          </h3>
        </div>

        {loading ? (
          <div className="rk-adm-skeleton-rows" role="status" aria-live="polite">
            <span className="sr-only">Loading localities…</span>
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} aria-hidden="true" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rk-adm-state">
            <EmptyState
              icon={MdPlace}
              title="No localities yet"
              message="Add the sectors you work in so buyers can browse Faridabad by area."
              action={
                <button type="button" className="rk-btn rk-btn--gold rk-btn--sm" onClick={startCreate}>
                  Add your first locality
                </button>
              }
            />
          </div>
        ) : (
          <div className="rk-adm-tablewrap">
            <table className="rk-adm-table">
              <caption className="sr-only">All localities in display order</caption>
              <thead>
                <tr>
                  <th scope="col">Photo</th>
                  <th scope="col">Locality</th>
                  <th scope="col">Starting price</th>
                  <th scope="col">Listings</th>
                  <th scope="col">Order</th>
                  <th scope="col">On home</th>
                  <th scope="col">Visible</th>
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
                        src={row.image || IMAGE_FALLBACK}
                        alt=""
                        width="66"
                        height="48"
                        loading="lazy"
                        decoding="async"
                        onError={onImageError}
                      />
                    </td>
                    <td data-label="Locality">
                      <span className="rk-adm-table__title">{row.name}</span>
                      <span className="rk-adm-table__sub">
                        /locality/{row.slug}
                        {row.aliases?.length ? ` · also ${row.aliases.join(', ')}` : ''}
                      </span>
                    </td>
                    <td data-label="Starting price">
                      {row.priceFrom ? (
                        <>
                          <span className="rk-adm-table__title">{formatPrice(row.priceFrom)}</span>
                          {row.priceNote && (
                            <span className="rk-adm-table__sub">{row.priceNote}</span>
                          )}
                        </>
                      ) : (
                        <span className="rk-adm-note">—</span>
                      )}
                    </td>
                    <td data-label="Listings" className="rk-adm-table__num">
                      {formatNumber(row.count || 0)}
                    </td>
                    <td data-label="Order" className="rk-adm-table__num">
                      {row.order ?? 100}
                    </td>
                    <td data-label="On home">
                      <button
                        type="button"
                        className="rk-adm-switch"
                        aria-pressed={Boolean(row.isFeatured)}
                        aria-label={`${row.isFeatured ? 'Remove' : 'Feature'} ${row.name} on the home page`}
                        onClick={() =>
                          patchRow(
                            row,
                            { isFeatured: !row.isFeatured },
                            row.isFeatured ? 'Removed from the home page' : 'Featured on the home page'
                          )
                        }
                      />
                    </td>
                    <td data-label="Visible">
                      <button
                        type="button"
                        className="rk-adm-switch"
                        aria-pressed={Boolean(row.isActive)}
                        aria-label={`${row.isActive ? 'Hide' : 'Show'} ${row.name}`}
                        onClick={() =>
                          patchRow(
                            row,
                            { isActive: !row.isActive },
                            row.isActive ? 'Locality hidden' : 'Locality shown'
                          )
                        }
                      />
                    </td>
                    <td data-label="">
                      <div className="rk-adm-rowactions">
                        {row.isActive && (
                          <Link
                            className="rk-adm-iconbtn"
                            to={`/locality/${row.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on the website"
                            aria-label={`View ${row.name} on the website`}
                          >
                            <MdOpenInNew aria-hidden="true" />
                          </Link>
                        )}
                        <button
                          type="button"
                          className="rk-adm-iconbtn"
                          onClick={() => startEdit(row)}
                          title="Edit"
                          aria-label={`Edit ${row.name}`}
                        >
                          <MdEdit aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="rk-adm-iconbtn rk-adm-iconbtn--danger"
                          onClick={() => setPendingDelete(row)}
                          title="Delete"
                          aria-label={`Delete ${row.name}`}
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
        )}
      </section>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => (deleting ? null : setPendingDelete(null))}
        title="Delete this locality?"
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
          <strong>{pendingDelete?.name}</strong> will be permanently removed, along with its page at
          /locality/{pendingDelete?.slug}. Your property listings are not affected. To hide it
          instead, switch <strong>Visible</strong> off.
        </p>
      </Modal>
    </div>
  )
}
