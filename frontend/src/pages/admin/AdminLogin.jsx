import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MdErrorOutline, MdLock, MdMailOutline, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import Logo from '../../components/brand/Logo'
import Field, { EMAIL_RE } from '../../components/forms/Field'
import { api } from '../../api/client'
import { isLoggedIn, setToken } from './auth'
import './admin.css'

/** Where to land after a successful sign-in: ?next=, router state, then /admin. */
function useReturnPath() {
  const location = useLocation()
  const next = new URLSearchParams(location.search).get('next')
  const fromState = location.state?.from
  const candidate = next || fromState || '/admin'
  // Only ever return to our own admin area — never to an attacker-supplied URL.
  return candidate.startsWith('/admin') && !candidate.startsWith('/admin/login') ? candidate : '/admin'
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const returnPath = useReturnPath()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Admin Sign In — Rama Kripa Estates'
  }, [])

  // Already signed in? Skip the form.
  useEffect(() => {
    if (isLoggedIn()) navigate(returnPath, { replace: true })
  }, [navigate, returnPath])

  const validate = () => {
    const next = {}
    if (!email.trim()) next.email = 'Please enter your admin email address.'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address, e.g. admin@rke.com.'
    if (!password) next.password = 'Please enter your password.'
    else if (password.length < 6) next.password = 'Your password must be at least 6 characters.'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!validate()) return

    setBusy(true)
    try {
      const res = await api.login(email.trim().toLowerCase(), password)
      setToken(res.token, res.user)
      navigate(returnPath, { replace: true })
    } catch (err) {
      setError(err.message || 'We could not sign you in. Please try again.')
      if (err.errors) setFieldErrors(err.errors)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="rk-adm-login">
      <div className="rk-adm-login__card">
        <div className="rk-adm-login__brand">
          <Logo variant="dark" showTagline={false} size={52} />
        </div>

        <h1 className="rk-adm-login__title">Control Panel</h1>
        <p className="rk-adm-login__sub">
          Sign in to manage Faridabad listings, buyer enquiries, articles and site settings.
        </p>

        <form className="rk-adm-login__form" onSubmit={handleSubmit} noValidate>
          {error && (
            <p className="rk-adm-alert" role="alert">
              <MdErrorOutline aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          <Field
            label="Email address"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="admin@rke.com"
            icon={<MdMailOutline />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email || ''}
            required
            autoFocus
          />

          <div className="rk-adm-login__pass">
            <Field
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your admin password"
              icon={<MdLock />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password || ''}
              required
            />
            <button
              type="button"
              className="rk-adm-login__eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <MdVisibilityOff aria-hidden="true" /> : <MdVisibility aria-hidden="true" />}
            </button>
          </div>

          <button type="submit" className="rk-btn rk-btn--green rk-btn--lg rk-btn--block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="rk-adm-login__foot">
          The seeded administrator is <strong>admin@rke.com</strong>. Forgot the password? Ask
          your developer to re-run the seed with a new <code>ADMIN_PASSWORD</code>.
          <br />
          <a href="/">Back to ramakripaestate.com</a>
        </p>
      </div>
    </main>
  )
}
