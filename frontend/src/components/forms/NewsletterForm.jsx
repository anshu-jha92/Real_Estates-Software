import { useId, useState } from 'react'
import { MdArrowForward, MdCheckCircle, MdErrorOutline } from 'react-icons/md'
import { api } from '../../api/client'
import { titleCase } from '../../utils/format'
import { validateEmail } from './Field'
import './NewsletterForm.css'

/** "rajesh.sharma@gmail.com" -> "Rajesh Sharma" so the admin inbox stays readable. */
const nameFromEmail = (email) => {
  const local = String(email).split('@')[0].replace(/[._-]+/g, ' ').trim()
  const guess = titleCase(local)
  return guess.length >= 2 ? guess.slice(0, 80) : 'Newsletter Subscriber'
}

/**
 * Footer newsletter sign-up. Posts through the enquiry endpoint with
 * source 'newsletter'.
 *
 * ponytail: the Enquiry model requires name + phone, so a subscription sends a
 * derived name and a 0000000000 placeholder number. Swap for a real
 * /api/subscribers collection if the list ever needs its own admin screen.
 */
export default function NewsletterForm({
  label = 'Faridabad property updates',
  placeholder = 'Enter your email address',
  className = ''
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [message, setMessage] = useState('')
  const id = `rk-newsletter-${useId()}`

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return

    const error = validateEmail(email, true)
    if (error) {
      setStatus('error')
      setMessage(error)
      return
    }

    setStatus('sending')
    setMessage('')
    try {
      await api.createEnquiry({
        name: nameFromEmail(email),
        phone: '0000000000',
        email: email.trim(),
        subject: 'Newsletter subscription',
        message: `Newsletter subscription request from ${email.trim()}.`,
        source: 'newsletter'
      })
      setStatus('done')
      setMessage('You are on the list. Look out for new Faridabad launches and price updates.')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setMessage(err?.message || 'We could not sign you up just now. Please try again in a moment.')
    }
  }

  const sending = status === 'sending'

  return (
    <form className={`rk-newsletter ${className}`.trim()} onSubmit={handleSubmit} noValidate>
      <label className="rk-newsletter__label" htmlFor={id}>
        {label}
      </label>

      <div className="rk-newsletter__row">
        <input
          id={id}
          className="rk-input rk-newsletter__input"
          type="email"
          name="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (status === 'error') {
              setStatus('idle')
              setMessage('')
            }
          }}
          placeholder={placeholder}
          autoComplete="email"
          required
          aria-invalid={status === 'error' ? 'true' : undefined}
          aria-describedby={message ? `${id}-msg` : undefined}
          disabled={sending}
        />
        <button
          type="submit"
          className="rk-newsletter__btn"
          disabled={sending}
          aria-busy={sending}
          aria-label={sending ? 'Subscribing' : 'Subscribe to property updates'}
        >
          {sending ? <span className="rk-newsletter__spinner rk-anim-spin" aria-hidden="true" /> : <MdArrowForward aria-hidden="true" />}
        </button>
      </div>

      {message && (
        <p
          className={`rk-newsletter__msg rk-newsletter__msg--${status === 'done' ? 'ok' : 'error'}`}
          id={`${id}-msg`}
          role={status === 'done' ? 'status' : 'alert'}
        >
          {status === 'done' ? <MdCheckCircle aria-hidden="true" /> : <MdErrorOutline aria-hidden="true" />}
          <span>{message}</span>
        </p>
      )}
    </form>
  )
}
