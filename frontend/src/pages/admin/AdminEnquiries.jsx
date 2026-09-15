import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  MdCall,
  MdDeleteOutline,
  MdDownload,
  MdErrorOutline,
  MdMarkEmailUnread,
  MdMailOutline,
  MdReply,
  MdSearch,
  MdWhatsapp
} from 'react-icons/md'
import Field from '../../components/forms/Field'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import useDebounce from '../../hooks/useDebounce'
import { api } from '../../api/client'
import { formatDate, formatNumber, phoneHref, whatsappHref } from '../../utils/format'
import { getToken, handleAuthError } from './auth'
import { EnvelopeIcon } from '../../components/icons/BrandIcons'
import './admin.css'

const PAGE_SIZE = 20

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' }
]

const STATUS_LABEL = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s.label]))

/** RFC 4180 quoting — a message with a comma, quote or newline must survive Excel. */
const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

function buildCsv(rows) {
  const header = [
    'Received',
    'Name',
    'Phone',
    'Email',
    'Interested in',
    'Property',
    'Subject',
    'Message',
    'Budget min',
    'Budget max',
    'Source',
    'Status',
    'Internal note'
  ]

  const lines = rows.map((r) =>
    [
      formatDate(r.createdAt),
      r.name,
      r.phone,
      r.email,
      r.interestedIn,
      r.propertyTitle,
      r.subject,
      r.message,
      r.budgetMin,
      r.budgetMax,
      r.source,
      STATUS_LABEL[r.status] || r.status,
      r.note
    ]
      .map(csvCell)
      .join(',')
  )

  // BOM so Excel on Windows opens the ₹ sign and Hindi names correctly.
  return '\uFEFF' + [header.map(csvCell).join(','), ...lines].join('\r\n')
}

export default function AdminEnquiries() {
  const [params, setParams] = useSearchParams()
  const toast = useToast()

  const page = Math.max(1, Number(params.get('page')) || 1)
  const status = params.get('status') || ''

  const [searchInput, setSearchInput] = useState(params.get('search') || '')
  const search = useDebounce(searchInput, 400)

  const [rows, setRows] = useState([])
  const [counts, setCounts] = useState({ new: 0, contacted: 0, closed: 0 })
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [replyTo, setReplyTo] = useState(null) // enquiry being answered
  const [replyText, setReplyText] = useState('')
  const [replyError, setReplyError] = useState('')
  const [sending, setSending] = useState(false)
  const [exporting, setExporting] = useState(false)

  const noteDraft = useRef({})

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value === '' || value === null || value === undefined) next.delete(key)
    else next.set(key, String(value))
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

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
      const res = await api.admin.enquiries(
        { status, search: params.get('search') || '', page, limit: PAGE_SIZE },
        getToken()
      )
      setRows(res.data || [])
      setCounts(res.counts || { new: 0, contacted: 0, closed: 0 })
      setTotal(res.total || 0)
      setPages(res.pages || 1)
      noteDraft.current = {}
    } catch (err) {
      if (handleAuthError(err)) return
      setRows([])
      setError(err.message || 'We could not load your enquiries.')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()])

  useEffect(() => {
    document.title = 'Enquiries — Rama Kripa Estates Admin'
    load()
  }, [load])

  const patchEnquiry = async (row, updates, successMessage) => {
    setBusyId(row._id)
    const previous = rows
    setRows((list) => list.map((r) => (r._id === row._id ? { ...r, ...updates } : r)))

    try {
      await api.admin.updateEnquiry(row._id, updates, getToken())
      if (successMessage) toast.success('Saved', successMessage)
      if (updates.status) {
        setCounts((c) => ({
          ...c,
          [row.status]: Math.max(0, (c[row.status] || 0) - 1),
          [updates.status]: (c[updates.status] || 0) + 1
        }))
      }
    } catch (err) {
      setRows(previous)
      if (handleAuthError(err)) return
      toast.error('Could not save', err.message || 'Please try again.')
    } finally {
      setBusyId('')
    }
  }

  const openReply = (row) => {
    setReplyTo(row)
    setReplyText('')
    setReplyError('')
  }

  const sendReply = async (event) => {
    event.preventDefault()
    const text = replyText.trim()
    if (!text) {
      setReplyError('Write a reply first.')
      return
    }
    setSending(true)
    setReplyError('')
    try {
      const res = await api.admin.replyToEnquiry(replyTo._id, { message: text }, getToken())
      const updated = res.data
      // Reflect the server's copy: the new reply in the history, status moved to Contacted.
      setRows((list) => list.map((r) => (r._id === updated._id ? { ...r, ...updated } : r)))
      if (replyTo.status === 'new' && updated.status === 'contacted') {
        setCounts((c) => ({ ...c, new: Math.max(0, (c.new || 0) - 1), contacted: (c.contacted || 0) + 1 }))
      }
      toast.success('Reply sent', `Emailed to ${updated.email}. Their answer will land in your inbox.`)
      setReplyTo(null)
    } catch (err) {
      if (handleAuthError(err)) return
      setReplyError(err.message || 'The email could not be sent. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await api.admin.deleteEnquiry(pendingDelete._id, getToken())
      toast.success('Enquiry deleted', `${pendingDelete.name}'s enquiry has been removed.`)
      setPendingDelete(null)
      if (rows.length === 1 && page > 1) setParam('page', page - 1)
      else load()
    } catch (err) {
      if (handleAuthError(err)) return
      toast.error('Could not delete', err.message || 'Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  /** Export everything that matches the current filter, not just this page. */
  const exportCsv = async () => {
    setExporting(true)
    try {
      const res = await api.admin.enquiries(
        { status, search: params.get('search') || '', page: 1, limit: 60 },
        getToken()
      )
      const all = [...(res.data || [])]

      for (let p = 2; p <= (res.pages || 1); p += 1) {
        // eslint-disable-next-line no-await-in-loop
        const more = await api.admin.enquiries(
          { status, search: params.get('search') || '', page: p, limit: 60 },
          getToken()
        )
        all.push(...(more.data || []))
      }

      const blob = new Blob([buildCsv(all)], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rama-kripa-enquiries-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('CSV downloaded', `${all.length} ${all.length === 1 ? 'enquiry' : 'enquiries'} exported.`)
    } catch (err) {
      if (handleAuthError(err)) return
      toast.error('Export failed', err.message || 'Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(total, page * PAGE_SIZE)
  const hasFilters = Boolean(status || searchInput)

  return (
    <div className="rk-adm">
      <header className="rk-adm-head">
        <div className="rk-adm-head__text">
          <h2 className="rk-adm-head__title">Enquiries</h2>
          <p className="rk-adm-head__sub">
            Everyone who filled a form on the website. Call or WhatsApp straight from this table, then move
            the enquiry to <strong>Contacted</strong> so nothing is chased twice.
          </p>
        </div>
        <div className="rk-adm-head__actions">
          <button
            type="button"
            className="rk-btn rk-btn--outline rk-btn--sm"
            onClick={exportCsv}
            disabled={exporting || total === 0}
          >
            <MdDownload className="rk-btn__icon" aria-hidden="true" />
            {exporting ? 'Preparing…' : 'Export CSV'}
          </button>
        </div>
      </header>

      {error && (
        <p className="rk-adm-alert" role="alert">
          <MdErrorOutline aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      <section className="rk-adm-tiles" aria-label="Enquiry totals">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className="rk-adm-tile"
            aria-pressed={status === option.value}
            onClick={() => setParam('status', status === option.value ? '' : option.value)}
            style={{ textAlign: 'left', cursor: 'pointer', borderColor: status === option.value ? 'var(--rk-gold-500)' : undefined }}
          >
            <span className="rk-adm-tile__icon" aria-hidden="true">
              <EnvelopeIcon size={24} />
            </span>
            <span className="rk-adm-tile__meta">
              <span className="rk-adm-tile__value">{formatNumber(counts[option.value] || 0)}</span>
              <span className="rk-adm-tile__label">{option.label}</span>
            </span>
          </button>
        ))}
      </section>

      <section className="rk-adm-card">
        <div className="rk-adm-toolbar">
          <div className="rk-adm-toolbar__row">
            <Field
              className="rk-field--search"
              label="Search enquiries"
              name="search"
              type="search"
              placeholder="Name, phone, email or property"
              icon={<MdSearch />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Field
              as="select"
              label="Status"
              name="status"
              placeholder="All statuses"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setParam('status', e.target.value)}
            />
            <p className="rk-adm-count">
              <strong>{formatNumber(total)}</strong> {total === 1 ? 'enquiry' : 'enquiries'}
            </p>
            {hasFilters && (
              <button
                type="button"
                className="rk-btn rk-btn--ghost rk-btn--sm"
                onClick={() => {
                  setSearchInput('')
                  setParams(new URLSearchParams(), { replace: true })
                }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="rk-adm-skeleton-rows" role="status" aria-live="polite">
            <span className="sr-only">Loading enquiries…</span>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} aria-hidden="true" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rk-adm-state">
            <EmptyState
              icon={MdMarkEmailUnread}
              title={hasFilters ? 'No enquiries match this filter' : 'No enquiries yet'}
              message={
                hasFilters
                  ? 'Try another status, or clear the filters to see every enquiry received so far.'
                  : 'Every enquiry from the contact form, property pages and the floating WhatsApp button lands here.'
              }
            />
          </div>
        ) : (
          <>
            <div className="rk-adm-tablewrap">
              <table className="rk-adm-table">
                <caption className="sr-only">Website enquiries, newest first</caption>
                <thead>
                  <tr>
                    <th scope="col">Enquirer</th>
                    <th scope="col">Interested in</th>
                    <th scope="col">Received</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Status</th>
                    <th scope="col">Internal note</th>
                    <th scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const waText = `Namaste ${row.name}, this is Rama Kripa Estates, Faridabad. Thank you for your enquiry${
                      row.propertyTitle ? ` about ${row.propertyTitle}` : ''
                    }.`

                    return (
                      <tr key={row._id}>
                        <td data-label="Enquirer">
                          <span className="rk-adm-table__title">{row.name}</span>
                          <span className="rk-adm-table__sub">
                            {row.phone}
                            {row.email ? ` · ${row.email}` : ''}
                          </span>
                          {row.message && <span className="rk-adm-table__sub">{row.message}</span>}
                          {row.replies?.length > 0 && (
                            <span className="rk-adm-table__sub rk-adm-replied">
                              <MdReply aria-hidden="true" />
                              Replied {row.replies.length === 1 ? 'once' : `${row.replies.length} times`} · last{' '}
                              {formatDate(row.replies[row.replies.length - 1].sentAt)}
                            </span>
                          )}
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
                          <span className="rk-adm-table__sub">Source: {row.source || 'website'}</span>
                        </td>
                        <td data-label="Received" className="rk-adm-table__num">
                          {formatDate(row.createdAt)}
                        </td>
                        <td data-label="Contact">
                          <span className="rk-adm-contact">
                            <a href={phoneHref(row.phone)} title={`Call ${row.name}`} aria-label={`Call ${row.name}`}>
                              <MdCall aria-hidden="true" />
                            </a>
                            <a
                              href={whatsappHref(row.phone, waText)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`WhatsApp ${row.name}`}
                              aria-label={`WhatsApp ${row.name}`}
                            >
                              <MdWhatsapp aria-hidden="true" />
                            </a>
                            <button
                              type="button"
                              onClick={() => openReply(row)}
                              disabled={!row.email}
                              title={row.email ? `Reply to ${row.name} by email` : 'No email given — call or WhatsApp'}
                              aria-label={row.email ? `Reply to ${row.name} by email` : 'No email address on this enquiry'}
                            >
                              <MdMailOutline aria-hidden="true" />
                            </button>
                          </span>
                        </td>
                        <td data-label="Status">
                          <label className="sr-only" htmlFor={`status-${row._id}`}>
                            Status for {row.name}
                          </label>
                          <select
                            id={`status-${row._id}`}
                            className="rk-select rk-adm-inline-select"
                            value={row.status || 'new'}
                            disabled={busyId === row._id}
                            onChange={(e) =>
                              patchEnquiry(
                                row,
                                { status: e.target.value },
                                `${row.name} marked as ${STATUS_LABEL[e.target.value]}.`
                              )
                            }
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td data-label="Internal note">
                          <label className="sr-only" htmlFor={`note-${row._id}`}>
                            Internal note for {row.name}
                          </label>
                          <textarea
                            id={`note-${row._id}`}
                            className="rk-adm-notefield"
                            rows={2}
                            maxLength={1000}
                            defaultValue={row.note || ''}
                            placeholder="Site visit booked for Sunday 11 am"
                            disabled={busyId === row._id}
                            onChange={(e) => {
                              noteDraft.current[row._id] = e.target.value
                            }}
                            onBlur={() => {
                              const draft = noteDraft.current[row._id]
                              if (draft === undefined || draft === (row.note || '')) return
                              patchEnquiry(row, { note: draft }, 'Note saved.')
                            }}
                          />
                        </td>
                        <td data-label="">
                          <div className="rk-adm-rowactions">
                            <button
                              type="button"
                              className="rk-adm-iconbtn rk-adm-iconbtn--danger"
                              onClick={() => setPendingDelete(row)}
                              title="Delete"
                              aria-label={`Delete the enquiry from ${row.name}`}
                            >
                              <MdDeleteOutline aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
        title="Delete this enquiry?"
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
          The enquiry from <strong>{pendingDelete?.name}</strong> ({pendingDelete?.phone}) will be
          permanently removed. Export the CSV first if you need a record of it.
        </p>
      </Modal>

      <Modal
        open={Boolean(replyTo)}
        onClose={() => (sending ? null : setReplyTo(null))}
        title={replyTo ? `Reply to ${replyTo.name}` : 'Reply'}
        size="md"
        footer={
          <>
            <button
              type="button"
              className="rk-btn rk-btn--ghost rk-btn--sm"
              onClick={() => setReplyTo(null)}
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="rk-enquiry-reply"
              className="rk-btn rk-btn--gold rk-btn--sm"
              disabled={sending || !replyText.trim()}
            >
              {sending ? 'Sending…' : 'Send reply'}
            </button>
          </>
        }
      >
        {replyTo && (
          <form id="rk-enquiry-reply" onSubmit={sendReply} noValidate>
            <p className="rk-adm-note" style={{ marginTop: 0 }}>
              To <strong>{replyTo.email}</strong>. If they answer, it lands in your inbox.
            </p>

            <div className="rk-adm-quote">
              <span className="rk-adm-quote__head">
                {replyTo.name} wrote · {formatDate(replyTo.createdAt)}
                {replyTo.propertyTitle ? ` · ${replyTo.propertyTitle}` : ''}
              </span>
              {replyTo.message ? (
                <span className="rk-adm-quote__body">{replyTo.message}</span>
              ) : (
                <span className="rk-adm-quote__body rk-adm-note">(no message — just the form details)</span>
              )}
            </div>

            {replyTo.replies?.length > 0 && (
              <div className="rk-adm-thread">
                <span className="rk-label">Earlier replies</span>
                {replyTo.replies.map((r) => (
                  <div className="rk-adm-thread__item" key={r._id || r.sentAt}>
                    <span className="rk-adm-thread__meta">
                      {formatDate(r.sentAt)}
                      {r.sentBy ? ` · ${r.sentBy}` : ''}
                    </span>
                    <span className="rk-adm-thread__body">{r.message}</span>
                  </div>
                ))}
              </div>
            )}

            <Field
              as="textarea"
              label="Your reply"
              name="reply-message"
              rows={7}
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value)
                if (replyError) setReplyError('')
              }}
              error={replyError}
              hint={`${replyText.length}/4000 characters. The enquiry is quoted underneath automatically.`}
              placeholder={`Hi ${replyTo.name}, thanks for your interest in ${replyTo.propertyTitle || 'Faridabad property'}. `}
              autoFocus
              required
            />
          </form>
        )}
      </Modal>
    </div>
  )
}
