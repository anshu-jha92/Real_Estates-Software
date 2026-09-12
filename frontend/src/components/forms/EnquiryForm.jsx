import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MdCheckCircle, MdErrorOutline, MdMailOutline, MdPersonOutline, MdPhoneIphone, MdSell } from 'react-icons/md'
import { api } from '../../api/client'
import { CATEGORIES } from '../../data/constants'
import Field, { focusFirstError, normalisePhone, validateEmail, validateName, validatePhone } from './Field'
import './EnquiryForm.css'

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.key, label: c.label }))

const propertyMessage = (property) =>
  property?.title ? `Hello, I am interested in [${property.title}]. Please share details.` : ''

const emptyForm = (property) => ({
  name: '',
  phone: '',
  email: '',
  interestedIn: property?.category || '',
  message: propertyMessage(property),
  website: '' // honeypot — real people never see this
})

/**
 * The site-wide enquiry form. Used on the home CTA band, the enquiry page and
 * the sticky card on a property page (pass `property` there).
 */
export default function EnquiryForm({
  property = null,
  source = 'website',
  compact = false,
  title = 'Request a Callback',
  subtitle = 'Share your requirement and a Rama Kripa Estates advisor will call you back with matching options in Faridabad.',
  onSuccess,
  className = ''
}) {
  const [values, setValues] = useState(() => emptyForm(property))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)
  const formRef = useRef(null)
  const successRef = useRef(null)
  const hpId = `rk-enquiry-website-${useId()}`

  // Keep the prefilled message in step with the property being viewed.
  useEffect(() => {
    setValues((prev) => ({ ...prev, message: propertyMessage(property), interestedIn: property?.category || prev.interestedIn }))
  }, [property?.title, property?.category])

  useEffect(() => {
    if (done) successRef.current?.focus()
  }, [done])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev))
  }

  const validate = () => ({
    name: validateName(values.name, 'name'),
    phone: validatePhone(values.phone),
    email: validateEmail(values.email, false)
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    // Honeypot: a bot filled the hidden field, so pretend nothing happened.
    if (values.website.trim()) return

    const nextErrors = validate()
    const hasError = Object.values(nextErrors).some(Boolean)
    setErrors(nextErrors)
    setSubmitError('')

    if (hasError) {
      requestAnimationFrame(() => focusFirstError(formRef.current))
      return
    }

    setSubmitting(true)
    try {
      await api.createEnquiry({
        name: values.name.trim(),
        phone: normalisePhone(values.phone),
        email: values.email.trim(),
        message: values.message.trim(),
        interestedIn: property ? property.category || '' : values.interestedIn,
        subject: property?.title ? `Enquiry: ${property.title}` : 'Website enquiry',
        propertyId: property?._id || property?.id || '',
        propertySlug: property?.slug || '',
        propertyTitle: property?.title || '',
        source
      })
      setDone(true)
      onSuccess?.(values)
    } catch (err) {
      setSubmitError(err?.message || 'We could not send your enquiry just now. Please try again or call us on +91 98110 00000.')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setValues(emptyForm(property))
    setErrors({})
    setSubmitError('')
    setDone(false)
  }

  if (done) {
    return (
      <div
        className={`rk-enquiry rk-enquiry--done ${compact ? 'rk-enquiry--compact' : ''} ${className}`.trim()}
        ref={successRef}
        tabIndex={-1}
      >
        <span className="rk-enquiry__tick" aria-hidden="true">
          <MdCheckCircle />
        </span>
        <h3 className="rk-enquiry__doneTitle">Enquiry received</h3>
        <p className="rk-enquiry__doneText" role="status">
          Thank you! Our Faridabad expert will call you within 24 hours.
        </p>
        <p className="rk-enquiry__doneMeta">
          In a hurry? Call <a href="tel:+919811000000">+91 98110 00000</a> between 10:00 and 19:00, any day of the week.
        </p>
        <button type="button" className="rk-enquiry__again" onClick={reset}>
          Send another enquiry
        </button>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      className={`rk-enquiry ${compact ? 'rk-enquiry--compact' : ''} ${className}`.trim()}
      onSubmit={handleSubmit}
      noValidate
    >
      {(title || subtitle) && (
        <header className="rk-enquiry__head">
          {title && <h3 className="rk-enquiry__title">{title}</h3>}
          {subtitle && <p className="rk-enquiry__subtitle">{subtitle}</p>}
        </header>
      )}

      {property?.title && (
        <p className="rk-enquiry__context">
          Enquiring about <strong>{property.title}</strong>
        </p>
      )}

      {/* Honeypot — hidden from people, catnip for bots. */}
      <div className="rk-enquiry__hp" aria-hidden="true">
        <label htmlFor={hpId}>Website</label>
        <input
          id={hpId}
          type="text"
          name="website"
          value={values.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="rk-enquiry__grid">
        <Field
          label="Full Name"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          required
          icon={<MdPersonOutline />}
          placeholder="e.g. Rajesh Sharma"
          autoComplete="name"
          maxLength={80}
        />

        <Field
          label="Mobile Number"
          name="phone"
          type="tel"
          inputMode="tel"
          value={values.phone}
          onChange={handleChange}
          error={errors.phone}
          required
          icon={<MdPhoneIphone />}
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
          icon={<MdMailOutline />}
          placeholder="you@example.com"
          autoComplete="email"
          className="rk-enquiry__wide"
        />

        {!property && (
          <Field
            as="select"
            label="Interested In"
            name="interestedIn"
            value={values.interestedIn}
            onChange={handleChange}
            icon={<MdSell />}
            options={CATEGORY_OPTIONS}
            placeholder="Select a property type"
            className="rk-enquiry__wide"
          />
        )}

        <Field
          as="textarea"
          label="Message"
          name="message"
          value={values.message}
          onChange={handleChange}
          placeholder="Tell us your preferred sector, budget and possession timeline."
          rows={compact ? 3 : 4}
          maxLength={2000}
          className="rk-enquiry__wide"
        />
      </div>

      {submitError && (
        <p className="rk-enquiry__alert" role="alert">
          <MdErrorOutline aria-hidden="true" />
          <span>{submitError}</span>
        </p>
      )}

      <button type="submit" className="rk-btn rk-btn--gold rk-btn--block rk-enquiry__submit" disabled={submitting} aria-busy={submitting}>
        {submitting && <span className="rk-enquiry__spinner rk-anim-spin" aria-hidden="true" />}
        {submitting ? 'Sending your enquiry…' : 'Send Enquiry'}
      </button>

      <p className="rk-enquiry__consent">
        By submitting, you agree that Rama Kripa Estates may contact you about matching Faridabad properties. Read our{' '}
        <Link to="/privacy-policy">Privacy Policy</Link>.
      </p>
    </form>
  )
}
