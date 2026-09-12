/**
 * Rama Kripa Estates — API client (BUILD_SPEC §4).
 * Native fetch only. Every call has a 15s abort timeout and extracts the
 * server's JSON `message` so the UI can show something human.
 */

// Same-origin `/api` is the production default (the Express server that serves
// this bundle also mounts the API there). Local dev points at the separate API
// process via VITE_API_URL in frontend/.env.
const BASE = import.meta.env.VITE_API_URL || '/api'

const TIMEOUT_MS = 15000

/** Serialise params, dropping empty / null / undefined values. */
function toQuery(params) {
  if (!params) return ''
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      value.filter((v) => v !== undefined && v !== null && v !== '').forEach((v) => sp.append(key, v))
      return
    }
    sp.append(key, String(value))
  })
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

function joinUrl(path) {
  const base = BASE.replace(/\/+$/, '')
  const tail = String(path || '').replace(/^\/+/, '')
  return `${base}/${tail}`
}

/** Pull a useful message out of whatever the server (or network) gave us. */
async function readResponse(res) {
  const type = res.headers.get('content-type') || ''
  let payload = null

  if (type.includes('application/json')) {
    payload = await res.json().catch(() => null)
  } else {
    const text = await res.text().catch(() => '')
    payload = text ? { message: text } : null
  }

  if (!res.ok || (payload && payload.success === false)) {
    const message =
      (payload && (payload.message || payload.error)) ||
      (res.status === 404
        ? 'We could not find what you were looking for.'
        : res.status === 401
          ? 'Your session has expired. Please sign in again.'
          : `Request failed (${res.status}).`)
    const err = new Error(message)
    err.status = res.status
    err.errors = (payload && payload.errors) || null
    err.payload = payload
    throw err
  }

  return payload
}

async function request(path, { method = 'GET', body, token, params, signal } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  // Let a caller's signal (e.g. component unmount) also abort this request.
  const onAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onAbort, { once: true })
  }

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(joinUrl(path) + toQuery(params), {
      method,
      headers,
      signal: controller.signal,
      body: body === undefined ? undefined : JSON.stringify(body)
    })
    return await readResponse(res)
  } catch (err) {
    if (err.name === 'AbortError') {
      // A caller-driven abort must stay an abort so hooks can ignore it.
      if (signal && signal.aborted) throw err
      const timeoutErr = new Error('The server took too long to respond. Please try again.')
      timeoutErr.status = 408
      throw timeoutErr
    }
    if (err instanceof TypeError) {
      const netErr = new Error('Unable to reach the server. Please check your connection.')
      netErr.status = 0
      throw netErr
    }
    throw err
  } finally {
    clearTimeout(timer)
    if (signal) signal.removeEventListener('abort', onAbort)
  }
}

export function apiGet(path, params, options = {}) {
  return request(path, { method: 'GET', params, ...options })
}

export function apiSend(path, method = 'POST', body, token, options = {}) {
  return request(path, { method, body, token, ...options })
}

/**
 * Multipart upload. Uses XMLHttpRequest rather than fetch because it is still
 * the only way to get real upload progress, which matters for a 5 MB photo on a
 * phone. Never set Content-Type by hand — the browser has to add the multipart
 * boundary itself.
 *
 * @param {File[]} files
 * @param {{token: string, folder?: string, onProgress?: (percent:number)=>void, signal?: AbortSignal}} opts
 * @returns {Promise<Array<{url,publicId,width,height,bytes,format,resourceType}>>}
 */
export function uploadFiles(files, { token, folder, onProgress, signal } = {}) {
  const list = Array.from(files || [])
  if (!list.length) return Promise.reject(new Error('Choose a file first.'))

  return new Promise((resolve, reject) => {
    const form = new FormData()
    list.forEach((file) => form.append('files', file))
    if (folder) form.append('folder', folder)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE}/media/upload`)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }

    xhr.onload = () => {
      let payload
      try {
        payload = JSON.parse(xhr.responseText)
      } catch {
        return reject(new Error(`Upload failed (${xhr.status}).`))
      }
      if (xhr.status >= 200 && xhr.status < 300 && payload.success) {
        return resolve(payload.files || [payload.data])
      }
      reject(new Error(payload.message || `Upload failed (${xhr.status}).`))
    }

    xhr.onerror = () => reject(new Error('Could not reach the server. Check your connection.'))
    xhr.ontimeout = () => reject(new Error('The upload timed out. Try a smaller file.'))
    xhr.timeout = 120000

    signal?.addEventListener('abort', () => xhr.abort(), { once: true })
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'))

    xhr.send(form)
  })
}

export const api = {
  /* ---------- Public reads ---------- */
  properties: (params, options) => apiGet('/properties', params, options),
  featured: (limit = 6, options) => apiGet('/properties/featured', { limit }, options),
  suggest: (q, options) => apiGet('/properties/suggest', { q }, options),
  property: (slug, options) => apiGet(`/properties/${encodeURIComponent(slug)}`, undefined, options),
  filters: (options) => apiGet('/meta/filters', undefined, options),
  stats: (options) => apiGet('/meta/stats', undefined, options),
  localities: (params, options) => apiGet('/localities', params, options),
  developers: (options) => apiGet('/developers', undefined, options),
  testimonials: (options) => apiGet('/testimonials', undefined, options),
  team: (options) => apiGet('/team', undefined, options),
  blogs: (params, options) => apiGet('/blogs', params, options),
  blog: (slug, options) => apiGet(`/blogs/${encodeURIComponent(slug)}`, undefined, options),
  settings: (options) => apiGet('/settings', undefined, options),
  health: (options) => apiGet('/health', undefined, options),

  /* ---------- Public writes ---------- */
  createEnquiry: (payload) => apiSend('/enquiries', 'POST', payload),
  login: (email, password) => apiSend('/auth/login', 'POST', { email, password }),

  /* ---------- Admin (token required) ---------- */
  admin: {
    me: (token) => apiGet('/auth/me', undefined, { token }),
    updateAccount: (payload, token) => apiSend('/auth/me', 'PUT', payload, token),

    createProperty: (payload, token) => apiSend('/properties', 'POST', payload, token),
    updateProperty: (id, payload, token) =>
      apiSend(`/properties/${encodeURIComponent(id)}`, 'PUT', payload, token),
    deleteProperty: (id, token) =>
      apiSend(`/properties/${encodeURIComponent(id)}`, 'DELETE', undefined, token),

    enquiries: (params, token) => apiGet('/enquiries', params, { token }),
    updateEnquiry: (id, payload, token) =>
      apiSend(`/enquiries/${encodeURIComponent(id)}`, 'PATCH', payload, token),
    deleteEnquiry: (id, token) =>
      apiSend(`/enquiries/${encodeURIComponent(id)}`, 'DELETE', undefined, token),

    blogs: (params, token) => apiGet('/blogs', params, { token }),
    createBlog: (payload, token) => apiSend('/blogs', 'POST', payload, token),
    updateBlog: (id, payload, token) =>
      apiSend(`/blogs/${encodeURIComponent(id)}`, 'PUT', payload, token),
    deleteBlog: (id, token) =>
      apiSend(`/blogs/${encodeURIComponent(id)}`, 'DELETE', undefined, token),

    testimonials: (params, token) => apiGet('/testimonials', params, { token }),
    createTestimonial: (payload, token) => apiSend('/testimonials', 'POST', payload, token),
    updateTestimonial: (id, payload, token) =>
      apiSend(`/testimonials/${encodeURIComponent(id)}`, 'PUT', payload, token),
    deleteTestimonial: (id, token) =>
      apiSend(`/testimonials/${encodeURIComponent(id)}`, 'DELETE', undefined, token),

    team: (params, token) => apiGet('/team', params, { token }),
    createTeamMember: (payload, token) => apiSend('/team', 'POST', payload, token),
    updateTeamMember: (id, payload, token) =>
      apiSend(`/team/${encodeURIComponent(id)}`, 'PUT', payload, token),
    deleteTeamMember: (id, token) =>
      apiSend(`/team/${encodeURIComponent(id)}`, 'DELETE', undefined, token),

    localities: (params, token) => apiGet('/localities', params, { token }),
    createLocality: (payload, token) => apiSend('/localities', 'POST', payload, token),
    updateLocality: (id, payload, token) =>
      apiSend(`/localities/${encodeURIComponent(id)}`, 'PUT', payload, token),
    deleteLocality: (id, token) =>
      apiSend(`/localities/${encodeURIComponent(id)}`, 'DELETE', undefined, token),

    updateSettings: (payload, token) => apiSend('/settings', 'PUT', payload, token),

    /* ---------- Media (Cloudinary) ---------- */
    mediaStatus: (token) => apiGet('/media/status', undefined, { token }),
    uploadFiles: (files, opts) => uploadFiles(files, opts),
    deleteMedia: (publicId, token, resourceType = 'image') =>
      apiSend(`/media?publicId=${encodeURIComponent(publicId)}&resourceType=${resourceType}`, 'DELETE', undefined, token)
  }
}

/* ------------------------------------------------------------------ */
/* Admin session storage — shared by AdminLogin, RequireAdmin, AdminLayout */
/* ------------------------------------------------------------------ */

export const TOKEN_KEY = 'rk_admin_token'
export const USER_KEY = 'rk_admin_user'

const safeStorage = () => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Reads the saved JWT. Falls back to a bare `token` key for safety. */
export function getToken() {
  const store = safeStorage()
  if (!store) return ''
  return store.getItem(TOKEN_KEY) || store.getItem('token') || ''
}

/** Fired after setToken so the admin shell can refresh the name it shows. */
export const ADMIN_USER_EVENT = 'rk-admin-user'

export function setToken(token, user) {
  const store = safeStorage()
  if (!store) return
  if (token) store.setItem(TOKEN_KEY, token)
  if (user) store.setItem(USER_KEY, JSON.stringify(user))
  try {
    window.dispatchEvent(new Event(ADMIN_USER_EVENT))
  } catch {
    // Storage works without the event; the shell just refreshes on next load.
  }
}

export function getStoredUser() {
  const store = safeStorage()
  if (!store) return null
  try {
    return JSON.parse(store.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function clearToken() {
  const store = safeStorage()
  if (!store) return
  store.removeItem(TOKEN_KEY)
  store.removeItem(USER_KEY)
  store.removeItem('token')
}

export const API_BASE = BASE
export default api
