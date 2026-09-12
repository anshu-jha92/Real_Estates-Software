import { useEffect, useId, useRef, useState } from 'react'
import { MdCheckCircle, MdErrorOutline } from 'react-icons/md'
import { api } from '../../api/client'
import Field, { focusFirstError, normalisePhone, validateEmail, validateName, validatePhone } from './Field'
import './ContactForm.css'

const EMPTY = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  message: '',
  website: '' // honeypot
}

/**
 * The Contact page form (BUILD_SPEC §6): First / Last name side by side above
 * 640px, then mobile, email and message, then a full-width gold Submit.
 */
export default function ContactForm({ onSuccess, className = '' }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)
  const formRef = useRef(null)
  const successRef = useRef(null)
  const hpId = `rk-contact-website-${useId()}`

  useEffect(() => {
    if (done) successRef.current?.focus()
  }, [done])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    if (values.website.trim()) return // bot

    const nextErrors = {
      firstName: validateName(values.firstName, 'first name'),
      lastName: validateName(values.lastName, 'last name'),
      phone: validatePhone(values.phone),
      email: validateEmail(values.email, true),
      message: values.message.trim().length >= 10 ? '' : 'Please tell us a little more (at least 10 characters).'
    }
    setErrors(nextErrors)
    setSubmitError('')

    if (Object.values(nextErrors).some(Boolean)) {
      requestAnimationFrame(() => focusFirstError(formRef.current))
      return
    }

    setSubmitting(true)
    try {
      await api.createEnquiry({
        name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
        phone: normalisePhone(values.phone),
        email: values.email.trim(),
        subject: 'Contact page enquiry',
        message: values.message.trim(),
        source: 'contact-page'
      })
      setDone(true)
      onSuccess?.(values)
    } catch (err) {
      setSubmitError(err?.message || 'We could not send your message just now. Please try again or call +91 98110 00000.')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setValues(EMPTY)
    setErrors({})
    setSubmitError('')
    setDone(false)
  }

  if (done) {
    return (
      <div className={`rk-contactForm rk-contactForm--done ${className}`.trim()} ref={successRef} tabIndex={-1}>
        <span className="rk-contactForm__tick" aria-hidden="true">
          <MdCheckCircle />
        </span>
        <h3 className="rk-contactForm__doneTitle">Message sent</h3>
        <p className="rk-contactForm__doneText" role="status">
          Thank you! Our Faridabad expert will call you within 24 hours.
        </p>
        <p className="rk-contactForm__doneMeta">
          Office hours are 10:00 to 19:00, Monday to Sunday, at SCO 12, Sector 88, Greater Faridabad.
        </p>
        <button type="button" className="rk-contactForm__again" onClick={reset}>
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} className={`rk-contactForm ${className}`.trim()} onSubmit={handleSubmit} noValidate>
      <p className="rk-contactForm__intro">Please fill the form &amp; we will get back to you as soon as possible.</p>

      <div className="rk-contactForm__hp" aria-hidden="true">
        <label htmlFor={hpId}>Website</label>
        <input id={hpId} type="text" name="website" value={values.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="rk-contactForm__row">
        <Field
          label="First Name"
          name="firstName"
          value={values.firstName}
          onChange={handleChange}
          error={errors.firstName}
          required
          placeholder="Rajesh"
          autoComplete="given-name"
          maxLength={40}
        />
        <Field
          label="Last Name"
          name="lastName"
          value={values.lastName}
          onChange={handleChange}
          error={errors.lastName}
          required
          placeholder="Sharma"
          autoComplete="family-name"
          maxLength={40}
        />
      </div>

      <Field
        label="Mobile Number"
        name="phone"
        type="tel"
        inputMode="tel"
        value={values.phone}
        onChange={handleChange}
        error={errors.phone}
        required
        placeholder="98110 00000"
        autoComplete="tel"
        maxLength={16}
      />

      <Field
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        required
        placeholder="you@example.com"
        autoComplete="email"
      />

      <Field
        as="textarea"
        label="Message"
        name="message"
        value={values.message}
        onChange={handleChange}
        error={errors.message}
        required
        rows={5}
        maxLength={2000}
        placeholder="Which sector are you looking in, and what is your budget and possession timeline?"
      />

      {submitError && (
        <p className="rk-contactForm__alert" role="alert">
          <MdErrorOutline aria-hidden="true" />
          <span>{submitError}</span>
        </p>
      )}

      <button
        type="submit"
        className="rk-btn rk-btn--gold rk-btn--block rk-contactForm__submit"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting && <span className="rk-contactForm__spinner rk-anim-spin" aria-hidden="true" />}
        {submitting ? 'Sending…' : 'Submit'}
      </button>
    </form>
  )
}
