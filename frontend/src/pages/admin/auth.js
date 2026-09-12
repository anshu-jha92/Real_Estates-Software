/**
 * Admin session helpers.
 *
 * The JWT already lives in localStorage under `rk_admin_token` (see
 * `src/api/client.js`) — this module is the admin-side face of that store plus
 * the one thing the panel needs on top: a single place that reacts to a 401.
 */

import { clearToken, getToken, getStoredUser, setToken, TOKEN_KEY } from '../../api/client'

export { getToken, setToken, clearToken, getStoredUser, TOKEN_KEY }

/** True when a JWT is present. Route protection lives in `RequireAdmin`. */
export function isLoggedIn() {
  return Boolean(getToken())
}

const LOGIN_PATH = '/admin/login'

/**
 * Call this in every admin catch block:
 *
 *   catch (err) { if (handleAuthError(err)) return; setError(err.message) }
 *
 * An expired or rejected token is dropped and the browser is sent back to the
 * login screen (full replace, so the dead session cannot be reached with Back).
 * Returns true when it handled the error, so callers can stop.
 */
export function handleAuthError(err) {
  if (err?.status !== 401) return false

  clearToken()

  if (typeof window !== 'undefined' && window.location.pathname !== LOGIN_PATH) {
    const from = window.location.pathname + window.location.search
    window.location.replace(`${LOGIN_PATH}?next=${encodeURIComponent(from)}`)
  }

  return true
}
