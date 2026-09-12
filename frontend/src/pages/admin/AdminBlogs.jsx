import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MdAdd,
  MdArticle,
  MdClose,
  MdDeleteOutline,
  MdEdit,
  MdErrorOutline,
  MdOpenInNew
} from 'react-icons/md'
import Field from '../../components/forms/Field'
import MediaInput from '../../components/forms/MediaInput'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../api/client'
import { IMAGE_FALLBACK, IMAGE_IDS, UNSPLASH, onImageError } from '../../data/constants'
import { formatDate, formatNumber, slugify } from '../../utils/format'
import { getToken, handleAuthError } from './auth'
import './admin.css'

const PAGE_SIZE = 20

const TAG_SUGGESTIONS = [
  'Faridabad',
  'Greater Faridabad',
  'Buying Guide',
  'Investment',
  'Home Loan',
  'RERA',
  'Plots',
  'Rent',
  'Commercial',
  'Sector 88',
  'Neharpar'
]

const EMPTY_BLOG = {
  title: '',
  slug: '',
  excerpt: '',
  coverImage: UNSPLASH(IMAGE_IDS.residential[0]),
  tags: [],
  content: '',
  author: 'Rama Kripa Estates',
  category: 'Faridabad Insights',
  isPublished: true
}

export default function AdminBlogs() {
  const toast = useToast()

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState(null) // null | { ...blog, _id? }
  const [slugTouched, setSlugTouched] = useState(false)
  const [tagDraft, setTagDraft] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [openingId, setOpeningId] = useState('')

  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.admin.blogs({ all: 'true', page, limit: PAGE_SIZE }, getToken())
      setRows(res.data || [])
      setTotal(res.total || 0)
      setPages(res.pages || 1)
    } catch (err) {
      if (handleAuthError(err)) return
      setRows([])
      setError(err.message || 'We could not load your articles.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    document.title = 'Blog — Rama Kripa Estates Admin'
    load()
  }, [load])

  const startCreate = () => {
    setEditing({ ...EMPTY_BLOG })
    setSlugTouched(false)
    setFormErrors({})
    setTagDraft('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startEdit = async (row) => {
    setOpeningId(row._id)
    try {
      // The list endpoint omits the body, so pull the full article before editing.
      const res = await api.blog(row._id)
      setEditing({ ...EMPTY_BLOG, ...res.data })
      setSlugTouched(true)
      setFormErrors({})
      setTagDraft('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      if (handleAuthError(err)) return
      toast.error('Could not open the article', err.message || 'Please try again.')
    } finally {
      setOpeningId('')
    }
  }

  const setField = (name, value) => setEditing((prev) => ({ ...prev, [name]: value }))

  const onTitleChange = (event) => {
    const title = event.target.value
    setEditing((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugify(title)
    }))
  }

  const addTag = () => {
    const value = tagDraft.trim()
    if (!value) return
    if (!editing.tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setField('tags', [...editing.tags, value])
    }
    setTagDraft('')
  }

  const saveBlog = async (event) => {
    event.preventDefault()

    const next = {}
    if (!editing.title.trim()) next.title = 'Give the article a title.'
    if (!editing.content.trim()) next.content = 'Write the article body before publishing.'
    else if (editing.content.trim().length < 120) next.content = 'Add a little more — at least a couple of paragraphs.'
    if (editing.excerpt.length > 400) next.excerpt = 'Keep the summary under 400 characters.'
    setFormErrors(next)

    if (Object.keys(next).length) {
      toast.error('Please check the form', 'Some required details are missing.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: editing.title.trim(),
        slug: slugify(editing.slug || editing.title),
        excerpt: editing.excerpt.trim(),
        content: editing.content.trim(),
        coverImage: editing.coverImage.trim(),
        tags: editing.tags,
        author: editing.author.trim() || 'Rama Kripa Estates',
        category: editing.category.trim() || 'Faridabad Insights',
        isPublished: Boolean(editing.isPublished)
      }

      const token = getToken()
      if (editing._id) await api.admin.updateBlog(editing._id, payload, token)
      else await api.admin.createBlog(payload, token)

      toast.success(
        editing._id ? 'Article updated' : 'Article published',
        `"${payload.title}" ${payload.isPublished ? 'is live on the blog.' : 'has been saved as a draft.'}`
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

  const togglePublished = async (row) => {
    const nextValue = !row.isPublished
    setRows((list) => list.map((r) => (r._id === row._id ? { ...r, isPublished: nextValue } : r)))
    try {
      await api.admin.updateBlog(row._id, { isPublished: nextValue }, getToken())
      toast.success(nextValue ? 'Article published' : 'Article unpublished', `"${row.title}"`)
    } catch (err) {
      setRows((list) => list.map((r) => (r._id === row._id ? { ...r, isPublished: !nextValue } : r)))
      if (handleAuthError(err)) return
      toast.error('Could not update', err.message || 'Please try again.')
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await api.admin.deleteBlog(pendingDelete._id, getToken())
      toast.success('Article deleted', `"${pendingDelete.title}" has been removed from the blog.`)
      setPendingDelete(null)
      if (rows.length === 1 && page > 1) setPage((p) => p - 1)
      else load()
    } catch (err) {
      if (handleAuthError(err)) return
      toast.error('Could not delete', err.message || 'Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="rk-adm">
      <header className="rk-adm-head">
        <div className="rk-adm-head__text">
          <h2 className="rk-adm-head__title">Blog</h2>
          <p className="rk-adm-head__sub">
            Guides and market notes for Faridabad buyers. Published articles appear under{' '}
            <strong>Insights &amp; Guides</strong> on the home page and at /blog.
          </p>
        </div>
        {!editing && (
          <div className="rk-adm-head__actions">
            <button type="button" className="rk-btn rk-btn--gold rk-btn--md" onClick={startCreate}>
              <MdAdd className="rk-btn__icon" aria-hidden="true" />
              Write an article
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
        <section className="rk-adm-card" aria-label={editing._id ? 'Edit article' : 'New article'}>
          <div className="rk-adm-card__head">
            <h3 className="rk-adm-card__title">
              {editing._id ? 'Edit article' : 'New article'}
              <small>{editing._id ? `/blog/${editing.slug}` : 'Saved straight to the website'}</small>
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

          <form className="rk-adm-card__body" onSubmit={saveBlog} noValidate>
            <div className="rk-adm-grid rk-adm-grid--2">
              <Field
                className="rk-adm-span-2"
                label="Title"
                name="blog-title"
                value={editing.title}
                onChange={onTitleChange}
                error={formErrors.title}
                placeholder="Is Greater Faridabad still the best value in the NCR?"
                required
              />
              <Field
                label="Web address (slug)"
                name="blog-slug"
                value={editing.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setField('slug', e.target.value)
                }}
                hint="Filled in from the title. Edit it only if you need a shorter link."
                placeholder="greater-faridabad-value-guide"
              />
              <Field
                label="Category"
                name="blog-category"
                value={editing.category}
                onChange={(e) => setField('category', e.target.value)}
                placeholder="Faridabad Insights"
              />
              <div className="rk-adm-span-2">
                <MediaInput
                  label="Cover image"
                  value={editing.coverImage}
                  onChange={(url) => setField('coverImage', url)}
                  folder="blog"
                  hint="Shown on the blog card and at the top of the article."
                  previewShape="wide"
                />
              </div>

              <Field
                as="textarea"
                className="rk-adm-span-2"
                label="Summary"
                name="blog-excerpt"
                rows={3}
                value={editing.excerpt}
                onChange={(e) => setField('excerpt', e.target.value)}
                error={formErrors.excerpt}
                hint={`Shown on the blog cards. ${editing.excerpt.length}/400 characters.`}
                placeholder="Prices in Neharpar have moved 18% in two years. Here is what that means if you are buying a 3 BHK in 2026."
              />

              <div className="rk-adm-span-2">
                <span className="rk-label">Tags</span>
                {editing.tags.length > 0 && (
                  <ul className="rk-adm-tags" style={{ marginBottom: 10, listStyle: 'none' }}>
                    {editing.tags.map((tag, index) => (
                      <li className="rk-adm-tag" key={`${tag}-${index}`}>
                        {tag}
                        <button
                          type="button"
                          onClick={() => setField('tags', editing.tags.filter((_, i) => i !== index))}
                          aria-label={`Remove tag ${tag}`}
                        >
                          <MdClose aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="rk-adm-tagadd">
                  <Field
                    label="Add a tag"
                    name="blog-tag"
                    value={tagDraft}
                    list="rk-blog-tags"
                    placeholder="Buying Guide"
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <button type="button" className="rk-btn rk-btn--outline rk-btn--sm" onClick={addTag}>
                    <MdAdd className="rk-btn__icon" aria-hidden="true" />
                    Add
                  </button>
                </div>
                <datalist id="rk-blog-tags">
                  {TAG_SUGGESTIONS.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <Field
                as="textarea"
                className="rk-adm-span-2"
                label="Article body"
                name="blog-content"
                rows={16}
                value={editing.content}
                onChange={(e) => setField('content', e.target.value)}
                error={formErrors.content}
                hint="Plain text. Leave a blank line between paragraphs — the blog page renders each one separately."
                placeholder={
                  'Greater Faridabad, or Neharpar as locals still call it, covers Sectors 75 to 89 east of the bypass.\n\nA 3 BHK builder floor here…'
                }
                required
              />

              <label className="rk-adm-check rk-adm-span-2">
                <input
                  type="checkbox"
                  checked={editing.isPublished}
                  onChange={(e) => setField('isPublished', e.target.checked)}
                />
                <span>
                  <strong>Published</strong>
                  <small>Uncheck to keep the article as a draft, hidden from the website.</small>
                </span>
              </label>
            </div>

            <div className="rk-adm-footbar">
              <p className="rk-adm-footbar__note">
                {editing._id ? 'Changes go live as soon as you save.' : 'New articles appear at the top of /blog.'}
              </p>
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
                  {saving ? 'Saving…' : editing._id ? 'Save changes' : 'Publish article'}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      <section className="rk-adm-card">
        <div className="rk-adm-card__head">
          <h3 className="rk-adm-card__title">
            All articles
            <small>
              {formatNumber(total)} {total === 1 ? 'article' : 'articles'}, drafts included
            </small>
          </h3>
        </div>

        {loading ? (
          <div className="rk-adm-skeleton-rows" role="status" aria-live="polite">
            <span className="sr-only">Loading articles…</span>
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} aria-hidden="true" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rk-adm-state">
            <EmptyState
              icon={MdArticle}
              title="No articles yet"
              message="A short guide about buying in Faridabad brings in search traffic and gives buyers a reason to trust you."
              action={
                <button type="button" className="rk-btn rk-btn--gold rk-btn--sm" onClick={startCreate}>
                  Write your first article
                </button>
              }
            />
          </div>
        ) : (
          <>
            <div className="rk-adm-tablewrap">
              <table className="rk-adm-table">
                <caption className="sr-only">All blog articles, newest first</caption>
                <thead>
                  <tr>
                    <th scope="col">Cover</th>
                    <th scope="col">Article</th>
                    <th scope="col">Tags</th>
                    <th scope="col">Published</th>
                    <th scope="col">Views</th>
                    <th scope="col">Live</th>
                    <th scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row._id}>
                      <td data-label="Cover">
                        <img
                          className="rk-adm-thumb"
                          src={row.coverImage || IMAGE_FALLBACK}
                          alt=""
                          width="66"
                          height="48"
                          loading="lazy"
                          decoding="async"
                          onError={onImageError}
                        />
                      </td>
                      <td data-label="Article">
                        <span className="rk-adm-table__title">{row.title}</span>
                        <span className="rk-adm-table__sub">
                          /blog/{row.slug} · {row.readTime || 5} min read
                        </span>
                      </td>
                      <td data-label="Tags">
                        {row.tags?.length ? row.tags.join(', ') : <span className="rk-adm-note">—</span>}
                      </td>
                      <td data-label="Published" className="rk-adm-table__num">
                        {formatDate(row.publishedAt || row.createdAt)}
                      </td>
                      <td data-label="Views" className="rk-adm-table__num">
                        {formatNumber(row.views || 0)}
                      </td>
                      <td data-label="Live">
                        <button
                          type="button"
                          className="rk-adm-switch"
                          aria-pressed={Boolean(row.isPublished)}
                          aria-label={`${row.isPublished ? 'Unpublish' : 'Publish'} "${row.title}"`}
                          onClick={() => togglePublished(row)}
                        />
                      </td>
                      <td data-label="">
                        <div className="rk-adm-rowactions">
                          {row.isPublished && (
                            <Link
                              className="rk-adm-iconbtn"
                              to={`/blog/${row.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View on the website"
                              aria-label={`View "${row.title}" on the website`}
                            >
                              <MdOpenInNew aria-hidden="true" />
                            </Link>
                          )}
                          <button
                            type="button"
                            className="rk-adm-iconbtn"
                            onClick={() => startEdit(row)}
                            disabled={openingId === row._id}
                            title="Edit"
                            aria-label={`Edit "${row.title}"`}
                          >
                            <MdEdit aria-hidden="true" />
                          </button>
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

            {pages > 1 && (
              <div className="rk-adm-pager">
                <p className="rk-adm-pager__info">
                  Page {page} of {pages}
                </p>
                <div className="rk-adm-pager__nav">
                  <button
                    type="button"
                    className="rk-btn rk-btn--outline rk-btn--sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="rk-btn rk-btn--outline rk-btn--sm"
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page >= pages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => (deleting ? null : setPendingDelete(null))}
        title="Delete this article?"
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
          <strong>{pendingDelete?.title}</strong> will be permanently removed, along with its link at{' '}
          /blog/{pendingDelete?.slug}. To hide it instead, switch <strong>Live</strong> off.
        </p>
      </Modal>
    </div>
  )
}
