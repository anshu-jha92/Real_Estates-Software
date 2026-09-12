import { useEffect, useId, useRef, useState } from 'react'
import { MdCloudUpload, MdLink, MdClose, MdCheckCircle } from 'react-icons/md'
import { api } from '../../api/client'
import { getToken } from '../../pages/admin/auth'
import { IMAGE_FALLBACK, onImageError } from '../../data/constants'
import './MediaInput.css'

/**
 * One image field, two ways to fill it.
 *
 * The client asked to keep pasting a URL as well as uploading a file, so this
 * shows both: a drop zone / file picker that sends the file through the backend
 * to Cloudinary, and a plain URL box underneath. Whichever is used, the value
 * handed back to the form is a single string, so callers do not care which route
 * produced it.
 *
 * Props:
 *   value        current URL string
 *   onChange     (url: string) => void
 *   label        field label
 *   folder       Cloudinary sub-folder, e.g. 'properties'
 *   accept       file input accept attribute
 *   hint         helper line under the field
 *   previewShape 'wide' | 'square' | 'none'
 *   compact      smaller drop zone, for repeated rows
 */
export default function MediaInput({
  value = '',
  onChange,
  label,
  folder = 'general',
  accept = 'image/*',
  hint,
  previewShape = 'wide',
  compact = false,
  required = false,
  id: idProp,
}) {
  const reactId = useId()
  const id = idProp || `rk-media-${reactId.replace(/:/g, '')}`

  const inputRef = useRef(null)
  const abortRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [justUploaded, setJustUploaded] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [available, setAvailable] = useState(null) // null = still checking

  // Hide the uploader (leaving the URL box) when Cloudinary keys are missing,
  // so the panel degrades instead of showing a button that always fails.
  useEffect(() => {
    let alive = true
    api.admin
      .mediaStatus(getToken())
      .then((res) => alive && setAvailable(Boolean(res?.data?.configured)))
      .catch(() => alive && setAvailable(false))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => () => abortRef.current?.abort(), [])

  async function send(files) {
    const list = Array.from(files || []).slice(0, 1)
    if (!list.length) return

    setError('')
    setUploading(true)
    setProgress(0)
    abortRef.current = new AbortController()

    try {
      const [uploaded] = await api.admin.uploadFiles(list, {
        token: getToken(),
        folder,
        onProgress: setProgress,
        signal: abortRef.current.signal,
      })
      onChange?.(uploaded.url)
      setJustUploaded(true)
      setTimeout(() => setJustUploaded(false), 2500)
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Upload failed.')
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function onDrop(event) {
    event.preventDefault()
    setDragging(false)
    if (!uploading) send(event.dataTransfer.files)
  }

  const showPreview = previewShape !== 'none' && Boolean(value.trim())

  return (
    <div className={`rk-media${compact ? ' rk-media--compact' : ''}`}>
      {label && (
        <span className="rk-label" id={`${id}-label`}>
          {label}
          {required && <em aria-hidden="true"> *</em>}
        </span>
      )}

      <div className="rk-media__row">
        {showPreview && (
          <img
            className={`rk-media__preview rk-media__preview--${previewShape}`}
            src={value.trim() || IMAGE_FALLBACK}
            onError={onImageError}
            alt=""
            loading="lazy"
            decoding="async"
          />
        )}

        <div className="rk-media__main">
          {available !== false && (
            <div
              className={`rk-media__drop${dragging ? ' is-dragging' : ''}${
                uploading ? ' is-busy' : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <input
                ref={inputRef}
                id={id}
                type="file"
                className="rk-media__file"
                accept={accept}
                disabled={uploading}
                onChange={(e) => send(e.target.files)}
              />

              <label htmlFor={id} className="rk-media__cta">
                <MdCloudUpload aria-hidden="true" />
                <span>
                  {uploading
                    ? `Uploading… ${progress}%`
                    : compact
                      ? 'Upload'
                      : 'Choose a file or drop it here'}
                </span>
              </label>

              {uploading && (
                <>
                  <span className="rk-media__bar" aria-hidden="true">
                    <span className="rk-media__bar-fill" style={{ width: `${progress}%` }} />
                  </span>
                  <button
                    type="button"
                    className="rk-media__cancel"
                    onClick={() => abortRef.current?.abort()}
                  >
                    <MdClose aria-hidden="true" /> Cancel
                  </button>
                </>
              )}
            </div>
          )}

          <div className="rk-media__url">
            <MdLink aria-hidden="true" />
            <input
              type="url"
              className="rk-input"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder="…or paste an image URL"
              aria-label={label ? `${label} — image URL` : 'Image URL'}
              autoComplete="off"
            />
            {value.trim() && (
              <button
                type="button"
                className="rk-media__clear"
                onClick={() => onChange?.('')}
                title="Clear"
                aria-label="Clear this image"
              >
                <MdClose aria-hidden="true" />
              </button>
            )}
          </div>

          {justUploaded && (
            <p className="rk-media__ok" role="status">
              <MdCheckCircle aria-hidden="true" /> Uploaded and optimised
            </p>
          )}
          {error && (
            <p className="rk-media__error" role="alert">
              {error}
            </p>
          )}
          {available === false && !error && (
            <p className="rk-media__note">
              File upload is off — add your Cloudinary keys to <code>backend/.env</code>. Pasting a
              URL still works.
            </p>
          )}
          {hint && !error && <p className="rk-media__hint">{hint}</p>}
        </div>
      </div>
    </div>
  )
}
