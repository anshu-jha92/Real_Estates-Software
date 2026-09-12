import { useEffect, useState } from 'react'
import { MdErrorOutline, MdLock, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import Field, { validateName } from '../../components/forms/Field'
import { useToast } from '../../components/ui/Toast'
import { api, getStoredUser, setToken } from '../../api/client'
import { getToken, handleAuthError } from './auth'
import './admin.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_PASSWORD = 8

export default function AdminAccount() {
  const toast = useToast()
  const stored = getStoredUser()

  const [name, setName] = useState(stored?.name || '')
  const [email, setEmail] = useState(stored?.email || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  const [showPasswords, setShowPasswords] = useState(false)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = 'My Account — Rama Kripa Estates Admin'
  }, [])

  const clearPasswordFields = () => {
    setNewPassword('')
    setConfirmPassword('')
    setCurrentPassword('')
  }

  const save = async (event) => {
    event.preventDefault()
    setAlert('')

    const next = {}
    const nameError = validateName(name)
    if (nameError) next.name = nameError
    if (!email.trim()) next.email = 'Enter your sign-in email address.'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.'

    if (newPassword) {
      if (newPassword.length < MIN_PASSWORD) {
        next.newPassword = `Use at least ${MIN_PASSWORD} characters.`
      } else if (newPassword !== confirmPassword) {
        // Caught here rather than on the server so a typo can never lock you out.
        next.confirmPassword = 'The two passwords do not match.'
      }
    } else if (confirmPassword) {
      next.newPassword = 'Enter the new password you want to use.'
    }

    if (!currentPassword) next.currentPassword = 'Enter your current password to confirm.'

    setErrors(next)
    if (Object.keys(next).length) {
      toast.error('Please check the form', 'Some details still need fixing.')
      return
    }

    const emailChanged = email.trim().toLowerCase() !== (stored?.email || '').toLowerCase()

    setSaving(true)
    try {
      const res = await api.admin.updateAccount(
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          currentPassword,
          ...(newPassword ? { newPassword } : {})
        },
        getToken()
      )

      // The server hands back a fresh token, so this browser stays signed in.
      setToken(res.token, res.user)
      clearPasswordFields()
      setErrors({})

      toast.success(
        'Sign-in details updated',
        newPassword && emailChanged
          ? `Sign in with ${res.user.email} and your new password. Any other device has been signed out.`
          : newPassword
            ? 'Use your new password next time. Any other device has been signed out.'
            : emailChanged
              ? `Next time, sign in with ${res.user.email}.`
              : 'Your name has been updated.'
      )
    } catch (err) {
      if (handleAuthError(err)) return
      if (err.errors) setErrors(err.errors)
      setAlert(err.message || 'We could not save your details. Please try again.')
      toast.error('Could not save', err.message || 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rk-adm">
      <header className="rk-adm-head">
        <div className="rk-adm-head__text">
          <h2 className="rk-adm-head__title">My Account</h2>
          <p className="rk-adm-head__sub">
            The email and password you use to sign in to this control panel. This is separate from
            the public contact details on the website — change those under <strong>Settings</strong>.
          </p>
        </div>
      </header>

      {alert && (
        <p className="rk-adm-alert" role="alert">
          <MdErrorOutline aria-hidden="true" />
          <span>{alert}</span>
        </p>
      )}

      <form onSubmit={save} noValidate>
        <section className="rk-adm-card" aria-label="Your sign-in details">
          <div className="rk-adm-card__head">
            <h3 className="rk-adm-card__title">
              <MdPerson aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 6 }} />
              Sign-in details
              <small>Used on the Control Panel login screen</small>
            </h3>
          </div>

          <div className="rk-adm-card__body">
            <div className="rk-adm-grid rk-adm-grid--2">
              <Field
                label="Your name"
                name="acc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                hint="Shown in the top right of the panel."
                autoComplete="name"
                required
              />
              <Field
                label="Sign-in email"
                name="acc-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                hint="This becomes your username the next time you sign in."
                autoComplete="username"
                required
              />
            </div>
          </div>
        </section>

        <section className="rk-adm-card" aria-label="Change your password">
          <div className="rk-adm-card__head">
            <h3 className="rk-adm-card__title">
              <MdLock aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 6 }} />
              Change password
              <small>Leave both boxes empty to keep your current password</small>
            </h3>
            <button
              type="button"
              className="rk-btn rk-btn--ghost rk-btn--sm rk-adm-card__spacer"
              onClick={() => setShowPasswords((v) => !v)}
              aria-pressed={showPasswords}
            >
              {showPasswords ? (
                <MdVisibilityOff className="rk-btn__icon" aria-hidden="true" />
              ) : (
                <MdVisibility className="rk-btn__icon" aria-hidden="true" />
              )}
              {showPasswords ? 'Hide' : 'Show'} passwords
            </button>
          </div>

          <div className="rk-adm-card__body">
            <div className="rk-adm-grid rk-adm-grid--2">
              <Field
                label="New password"
                name="acc-new-password"
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={errors.newPassword}
                hint={`At least ${MIN_PASSWORD} characters.`}
                autoComplete="new-password"
              />
              <Field
                label="Repeat new password"
                name="acc-confirm-password"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                hint="Type it again so a typo cannot lock you out."
                autoComplete="new-password"
              />
            </div>
          </div>
        </section>

        <section className="rk-adm-card" aria-label="Confirm it is you">
          <div className="rk-adm-card__head">
            <h3 className="rk-adm-card__title">
              Confirm it is you
              <small>Required for any change on this page</small>
            </h3>
          </div>

          <div className="rk-adm-card__body">
            <p className="rk-adm-note" style={{ marginTop: 0 }}>
              We ask for your current password so that nobody who finds this panel already open can
              change your email and lock you out. Changing your password also signs out every other
              device.
            </p>
            <div className="rk-adm-grid rk-adm-grid--2">
              <Field
                label="Current password"
                name="acc-current-password"
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={errors.currentPassword}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div className="rk-adm-footbar">
            <p className="rk-adm-footbar__note">
              You stay signed in here. Changing your password signs you out everywhere else.
            </p>
            <div className="rk-adm-footbar__actions">
              <button type="submit" className="rk-btn rk-btn--gold rk-btn--md" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}
