import { useCallback, useEffect, useState } from 'react'
import {
  MdAdd,
  MdClose,
  MdDeleteOutline,
  MdEdit,
  MdErrorOutline,
  MdFormatQuote,
  MdStar
} from 'react-icons/md'
import Field from '../../components/forms/Field'
import MediaInput from '../../components/forms/MediaInput'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../api/client'
import { IMAGE_FALLBACK, onImageError } from '../../data/constants'
import { formatDate, formatNumber } from '../../utils/format'
import { getToken, handleAuthError } from './auth'
import './admin.css'

const RATING_OPTIONS = [
  { value: 5, label: '5 — Excellent' },
  { value: 4, label: '4 — Very good' },
  { value: 3, label: '3 — Good' },
  { value: 2, label: '2 — Fair' },
  { value: 1, label: '1 — Poor' }
]

const EMPTY_TESTIMONIAL = {
  name: '',
  role: '',
  locality: '',
  message: '',
  rating: 5,
  avatar: '',
  propertyTitle: '',
  isActive: true,
  order: 100
}

function Stars({ value = 5 }) {
  return (
    <span className="rk-adm-stars" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <MdStar key={i} aria-hidden="true" className={i < value ? 'is-on' : ''} />
      ))}
    </span>
  )
}

export default function AdminTestimonials() {
  const toast = useToast()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.admin.testimonials({ all: 'true' }, getToken())
      setRows(res.data || [])
    } catch (err) {
      if (handleAuthError(err)) return
      setRows([])
      setError(err.message || 'We could not load your testimonials.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Testimonials — Rama Kripa Estates Admin'
    load()
  }, [load])

  const startCreate = () => {
    setEditing({ ...EMPTY_TESTIMONIAL })
    setFormErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startEdit = (row) => {
    setEditing({ ...EMPTY_TESTIMONIAL, ...row })
    setFormErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const setField = (name, value) => setEditing((prev) => ({ ...prev, [name]: value }))

  const saveTestimonial = async (event) => {
    event.preventDefault()

    const next = {}
    if (!editing.name.trim()) next.name = 'Whose review is this?'
    if (!editing.message.trim()) next.message = 'Paste what the client said.'
    else if (editing.message.trim().length > 900) next.message = 'Keep the review under 900 characters.'
    setFormErrors(next)

    if (Object.keys(next).length) {
      toast.error('Please check the form', 'Some required details are missing.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: editing.name.trim(),
        role: editing.role.trim(),
        locality: editing.locality.trim(),
        message: editing.message.trim(),
        rating: Number(editing.rating) || 5,
        avatar: editing.avatar.trim(),
        propertyTitle: editing.propertyTitle.trim(),
        isActive: Boolean(editing.isActive),
        order: Number(editing.order) || 100
      }

      const token = getToken()
      if (editing._id) await api.admin.updateTestimonial(editing._id, payload, token)
      else await api.admin.createTestimonial(payload, token)

      toast.success(
        editing._id ? 'Testimonial updated' : 'Testimonial added',
        payload.isActive
          ? `${payload.name} is now live on the home page.`
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

  const toggleActive = async (row) => {
    const nextValue = !row.isActive
    setRows((list) => list.map((r) => (r._id === row._id ? { ...r, isActive: nextValue } : r)))
    try {
      await api.admin.updateTestimonial(row._id, { isActive: nextValue }, getToken())
      toast.success(nextValue ? 'Testimonial shown' : 'Testimonial hidden', row.name)
    } catch (err) {
      setRows((list) => list.map((r) => (r._id === row._id ? { ...r, isActive: !nextValue } : r)))
      if (handleAuthError(err)) return
      toast.error('Could not update', err.message || 'Please try again.')
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await api.admin.deleteTestimonial(pendingDelete._id, getToken())
      toast.success('Testimonial deleted', `${pendingDelete.name} has been removed.`)
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

  return (
    <div className="rk-adm">
      <header className="rk-adm-head">
        <div className="rk-adm-head__text">
          <h2 className="rk-adm-head__title">Testimonials</h2>
          <p className="rk-adm-head__sub">
            What your buyers say about you. Visible reviews rotate in the{' '}
            <strong>client stories</strong> band on the home page.
          </p>
        </div>
        {!editing && (
          <div className="rk-adm-head__actions">
            <button type="button" className="rk-btn rk-btn--gold rk-btn--md" onClick={startCreate}>
              <MdAdd className="rk-btn__icon" aria-hidden="true" />
              Add a review
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
        <section
          className="rk-adm-card"
          aria-label={editing._id ? 'Edit testimonial' : 'New testimonial'}
        >
          <div className="rk-adm-card__head">
            <h3 className="rk-adm-card__title">
              {editing._id ? 'Edit testimonial' : 'New testimonial'}
              <small>Shown on the home page as soon as you save</small>
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

          <form className="rk-adm-card__body" onSubmit={saveTestimonial} noValidate>
            <div className="rk-adm-grid rk-adm-grid--2">
              <Field
                label="Client name"
                name="t-name"
                value={editing.name}
                onChange={(e) => setField('name', e.target.value)}
                error={formErrors.name}
                placeholder="Ritu Sharma"
                required
              />
              <Field
                label="Role or description"
                name="t-role"
                value={editing.role}
                onChange={(e) => setField('role', e.target.value)}
                hint="Shown under the name."
                placeholder="Bought a 3 BHK in 2025"
              />
              <Field
                label="Locality"
                name="t-locality"
                value={editing.locality}
                onChange={(e) => setField('locality', e.target.value)}
                placeholder="Sector 88, Greater Faridabad"
              />
              <Field
                label="Property they bought or rented"
                name="t-property"
                value={editing.propertyTitle}
                onChange={(e) => setField('propertyTitle', e.target.value)}
                hint="Optional. Helps the review feel specific."
                placeholder="BPTP Park Elite Premium"
              />

              <Field
                as="select"
                label="Rating"
                name="t-rating"
                options={RATING_OPTIONS}
                value={editing.rating}
                onChange={(e) => setField('rating', e.target.value)}
              />
              <Field
                label="Display order"
                name="t-order"
                type="number"
                value={editing.order}
                onChange={(e) => setField('order', e.target.value)}
                hint="Lower numbers show first. Leave at 100 if unsure."
              />

              <div className="rk-adm-span-2">
                <MediaInput
                  label="Client photo"
                  value={editing.avatar}
                  onChange={(url) => setField('avatar', url)}
                  folder="testimonials"
                  hint="Optional. A square headshot works best."
                  previewShape="circle"
                />
              </div>

              <Field
                as="textarea"
                className="rk-adm-span-2"
                label="What they said"
                name="t-message"
                rows={5}
                value={editing.message}
                onChange={(e) => setField('message', e.target.value)}
                error={formErrors.message}
                hint={`${editing.message.length}/900 characters.`}
                placeholder="They showed us six floors in Sector 88 over one weekend and were honest about which ones had title issues."
                required
              />

              <label className="rk-adm-check rk-adm-span-2">
                <input
                  type="checkbox"
                  checked={editing.isActive}
                  onChange={(e) => setField('isActive', e.target.checked)}
                />
                <span>
                  <strong>Visible on the website</strong>
                  <small>Uncheck to keep the review saved but hidden from visitors.</small>
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
                  {saving ? 'Saving…' : editing._id ? 'Save changes' : 'Add testimonial'}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      <section className="rk-adm-card">
        <div className="rk-adm-card__head">
          <h3 className="rk-adm-card__title">
            All testimonials
            <small>
              {formatNumber(rows.length)} saved · {formatNumber(liveCount)} visible on the website
            </small>
          </h3>
        </div>

        {loading ? (
          <div className="rk-adm-skeleton-rows" role="status" aria-live="polite">
            <span className="sr-only">Loading testimonials…</span>
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} aria-hidden="true" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rk-adm-state">
            <EmptyState
              icon={MdFormatQuote}
              title="No testimonials yet"
              message="A few honest reviews from Faridabad buyers do more for trust than any amount of copy."
              action={
                <button type="button" className="rk-btn rk-btn--gold rk-btn--sm" onClick={startCreate}>
                  Add your first review
                </button>
              }
            />
          </div>
        ) : (
          <div className="rk-adm-tablewrap">
            <table className="rk-adm-table">
              <caption className="sr-only">All client testimonials in display order</caption>
              <thead>
                <tr>
                  <th scope="col">Photo</th>
                  <th scope="col">Client</th>
                  <th scope="col">Review</th>
                  <th scope="col">Rating</th>
                  <th scope="col">Order</th>
                  <th scope="col">Added</th>
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
                        className="rk-adm-thumb rk-adm-thumb--circle"
                        src={row.avatar || IMAGE_FALLBACK}
                        alt=""
                        width="48"
                        height="48"
                        loading="lazy"
                        decoding="async"
                        onError={onImageError}
                      />
                    </td>
                    <td data-label="Client">
                      <span className="rk-adm-table__title">{row.name}</span>
                      <span className="rk-adm-table__sub">
                        {[row.role, row.locality].filter(Boolean).join(' · ') || '—'}
                      </span>
                    </td>
                    <td data-label="Review">
                      <span className="rk-adm-table__clamp">{row.message}</span>
                    </td>
                    <td data-label="Rating">
                      <Stars value={row.rating} />
                    </td>
                    <td data-label="Order" className="rk-adm-table__num">
                      {row.order ?? 100}
                    </td>
                    <td data-label="Added" className="rk-adm-table__num">
                      {formatDate(row.createdAt)}
                    </td>
                    <td data-label="Visible">
                      <button
                        type="button"
                        className="rk-adm-switch"
                        aria-pressed={Boolean(row.isActive)}
                        aria-label={`${row.isActive ? 'Hide' : 'Show'} the review by ${row.name}`}
                        onClick={() => toggleActive(row)}
                      />
                    </td>
                    <td data-label="">
                      <div className="rk-adm-rowactions">
                        <button
                          type="button"
                          className="rk-adm-iconbtn"
                          onClick={() => startEdit(row)}
                          title="Edit"
                          aria-label={`Edit the review by ${row.name}`}
                        >
                          <MdEdit aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="rk-adm-iconbtn rk-adm-iconbtn--danger"
                          onClick={() => setPendingDelete(row)}
                          title="Delete"
                          aria-label={`Delete the review by ${row.name}`}
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
        title="Delete this testimonial?"
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
          The review by <strong>{pendingDelete?.name}</strong> will be permanently removed. To hide it
          from the website instead, switch <strong>Visible</strong> off.
        </p>
      </Modal>
    </div>
  )
}
