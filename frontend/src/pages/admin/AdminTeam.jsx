import { useCallback, useEffect, useState } from 'react'
import {
  MdAdd,
  MdClose,
  MdDeleteOutline,
  MdEdit,
  MdErrorOutline,
  MdGroups,
  MdOpenInNew
} from 'react-icons/md'
import Field from '../../components/forms/Field'
import MediaInput from '../../components/forms/MediaInput'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../api/client'
import { IMAGE_FALLBACK, onImageError } from '../../data/constants'
import { formatNumber } from '../../utils/format'
import { getToken, handleAuthError } from './auth'
import './admin.css'

const EMPTY_MEMBER = {
  name: '',
  role: '',
  image: '',
  note: '',
  isActive: true,
  order: 100
}

export default function AdminTeam() {
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
      const res = await api.admin.team({ all: 'true' }, getToken())
      setRows(res.data || [])
    } catch (err) {
      if (handleAuthError(err)) return
      setRows([])
      setError(err.message || 'We could not load your team.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Team — Rama Kripa Estates Admin'
    load()
  }, [load])

  const startCreate = () => {
    // Put a new person after everyone already on the page.
    const nextOrder = rows.length ? Math.max(...rows.map((r) => r.order ?? 100)) + 1 : 1
    setEditing({ ...EMPTY_MEMBER, order: nextOrder })
    setFormErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startEdit = (row) => {
    setEditing({ ...EMPTY_MEMBER, ...row })
    setFormErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const setField = (name, value) => setEditing((prev) => ({ ...prev, [name]: value }))

  const saveMember = async (event) => {
    event.preventDefault()

    const next = {}
    if (!editing.name.trim()) next.name = 'Add the person’s name.'
    if (!editing.role.trim()) next.role = 'What do they do? For example, Head — Residential Sales.'
    if (editing.note.length > 400) next.note = 'Keep the line under 400 characters.'
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
        image: editing.image.trim(),
        note: editing.note.trim(),
        isActive: Boolean(editing.isActive),
        order: Number(editing.order) || 100
      }

      const token = getToken()
      if (editing._id) await api.admin.updateTeamMember(editing._id, payload, token)
      else await api.admin.createTeamMember(payload, token)

      toast.success(
        editing._id ? 'Team member updated' : 'Team member added',
        payload.isActive
          ? `${payload.name} is now on the Who We Are page.`
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
      await api.admin.updateTeamMember(row._id, { isActive: nextValue }, getToken())
      toast.success(nextValue ? 'Now on the website' : 'Hidden from the website', row.name)
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
      await api.admin.deleteTeamMember(pendingDelete._id, getToken())
      toast.success('Team member removed', `${pendingDelete.name} has been removed.`)
      setPendingDelete(null)
      load()
    } catch (err) {
      if (handleAuthError(err)) return
      toast.error('Could not remove', err.message || 'Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const liveCount = rows.filter((r) => r.isActive).length

  return (
    <div className="rk-adm">
      <header className="rk-adm-head">
        <div className="rk-adm-head__text">
          <h2 className="rk-adm-head__title">Team</h2>
          <p className="rk-adm-head__sub">
            The people shown under <strong>Our team</strong> on the Who We Are page. When someone
            joins or leaves, change it here — buyers ask for your staff by name.
          </p>
        </div>
        {!editing && (
          <div className="rk-adm-head__actions">
            <a
              className="rk-btn rk-btn--outline rk-btn--md"
              href="/about#team"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MdOpenInNew className="rk-btn__icon" aria-hidden="true" />
              View on site
            </a>
            <button type="button" className="rk-btn rk-btn--gold rk-btn--md" onClick={startCreate}>
              <MdAdd className="rk-btn__icon" aria-hidden="true" />
              Add a person
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
        <section className="rk-adm-card" aria-label={editing._id ? 'Edit team member' : 'New team member'}>
          <div className="rk-adm-card__head">
            <h3 className="rk-adm-card__title">
              {editing._id ? 'Edit team member' : 'New team member'}
              <small>Shown on the Who We Are page as soon as you save</small>
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

          <form className="rk-adm-card__body" onSubmit={saveMember} noValidate>
            <div className="rk-adm-grid rk-adm-grid--2">
              <Field
                label="Full name"
                name="tm-name"
                value={editing.name}
                onChange={(e) => setField('name', e.target.value)}
                error={formErrors.name}
                placeholder="Ritu Bhardwaj"
                required
              />
              <Field
                label="Role"
                name="tm-role"
                value={editing.role}
                onChange={(e) => setField('role', e.target.value)}
                error={formErrors.role}
                placeholder="Head — Residential Sales"
                required
              />

              <div className="rk-adm-span-2">
                <MediaInput
                  label="Photo"
                  value={editing.image}
                  onChange={(url) => setField('image', url)}
                  folder="team"
                  hint="A square headshot works best — the card crops to a square."
                  previewShape="circle"
                />
              </div>

              <Field
                as="textarea"
                className="rk-adm-span-2"
                label="One line about them"
                name="tm-note"
                rows={3}
                value={editing.note}
                onChange={(e) => setField('note', e.target.value)}
                error={formErrors.note}
                hint={`${editing.note.length}/400 characters. Say what they actually handle.`}
                placeholder="Runs the Neharpar residential desk and the Sunday site-visit rounds across Sectors 75 to 89."
              />

              <Field
                label="Display order"
                name="tm-order"
                type="number"
                value={editing.order}
                onChange={(e) => setField('order', e.target.value)}
                hint="Lower numbers show first. Put the founder at 1."
              />

              <label className="rk-adm-check rk-adm-span-2">
                <input
                  type="checkbox"
                  checked={editing.isActive}
                  onChange={(e) => setField('isActive', e.target.checked)}
                />
                <span>
                  <strong>Show on the website</strong>
                  <small>
                    Uncheck when someone leaves — that removes them from the page but keeps the
                    record here.
                  </small>
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
                  {saving ? 'Saving…' : editing._id ? 'Save changes' : 'Add to the team'}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      <section className="rk-adm-card">
        <div className="rk-adm-card__head">
          <h3 className="rk-adm-card__title">
            Your team
            <small>
              {formatNumber(rows.length)} saved · {formatNumber(liveCount)} shown on the website
            </small>
          </h3>
        </div>

        {loading ? (
          <div className="rk-adm-skeleton-rows" role="status" aria-live="polite">
            <span className="sr-only">Loading your team…</span>
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} aria-hidden="true" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rk-adm-state">
            <EmptyState
              icon={MdGroups}
              title="No one added yet"
              message="Buyers trust a name and a face more than a company blurb. Add the people who answer the phone."
              action={
                <button type="button" className="rk-btn rk-btn--gold rk-btn--sm" onClick={startCreate}>
                  Add your first person
                </button>
              }
            />
          </div>
        ) : (
          <div className="rk-adm-tablewrap">
            <table className="rk-adm-table">
              <caption className="sr-only">Your team in display order</caption>
              <thead>
                <tr>
                  <th scope="col">Photo</th>
                  <th scope="col">Name</th>
                  <th scope="col">What they handle</th>
                  <th scope="col">Order</th>
                  <th scope="col">On site</th>
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
                        src={row.image || IMAGE_FALLBACK}
                        alt=""
                        width="48"
                        height="48"
                        loading="lazy"
                        decoding="async"
                        onError={onImageError}
                      />
                    </td>
                    <td data-label="Name">
                      <span className="rk-adm-table__title">{row.name}</span>
                      <span className="rk-adm-table__sub">{row.role}</span>
                    </td>
                    <td data-label="What they handle">
                      <span className="rk-adm-table__clamp">
                        {row.note || <span className="rk-adm-note">—</span>}
                      </span>
                    </td>
                    <td data-label="Order" className="rk-adm-table__num">
                      {row.order ?? 100}
                    </td>
                    <td data-label="On site">
                      <button
                        type="button"
                        className="rk-adm-switch"
                        aria-pressed={Boolean(row.isActive)}
                        aria-label={`${row.isActive ? 'Hide' : 'Show'} ${row.name} on the website`}
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
                          aria-label={`Edit ${row.name}`}
                        >
                          <MdEdit aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="rk-adm-iconbtn rk-adm-iconbtn--danger"
                          onClick={() => setPendingDelete(row)}
                          title="Remove"
                          aria-label={`Remove ${row.name}`}
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
        title="Remove this person?"
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
              {deleting ? 'Removing…' : 'Yes, remove'}
            </button>
          </>
        }
      >
        <p className="rk-adm-note">
          <strong>{pendingDelete?.name}</strong> will be permanently deleted. If they have simply
          left the company, switch <strong>On site</strong> off instead — that hides them from the
          website but keeps the record.
        </p>
      </Modal>
    </div>
  )
}
