import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MdCall,
  MdCheckCircle,
  MdErrorOutline,
  MdLocationOn,
  MdMailOutline,
  MdPersonOutline,
  MdPhoneIphone,
  MdSchedule,
  MdSell,
  MdAccountBalanceWallet,
  MdDateRange,
  MdArrowForward
} from 'react-icons/md'
import { FaWhatsapp } from 'react-icons/fa6'
import PageHero from '../components/layout/PageHero'
import Section from '../components/ui/Section'
import SectionTitle from '../components/ui/SectionTitle'
import Reveal from '../components/ui/Reveal'
import Field, {
  focusFirstError,
  normalisePhone,
  validateEmail,
  validateName,
  validatePhone
} from '../components/forms/Field'
import useSeo from '../hooks/useSeo'
import { api } from '../api/client'
import { useSite } from '../context/SiteContext'
import { FARIDABAD_LOCALITIES, IMAGE_IDS, UNSPLASH, WHY_US } from '../data/constants'
import { mailtoHref, phoneHref, whatsappHref } from '../utils/format'
import './Enquiry.css'

const HERO_IMAGE = UNSPLASH(IMAGE_IDS.hero[4], 1600)

const LOOKING_FOR = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'plots', label: 'Plot' },
  { value: 'rent', label: 'Rent' },
  { value: 'office-space', label: 'Office Space' }
]

/** Budget bands in rupees. `max: 0` means "and above". */
const BUDGETS = [
  { value: 'under-30l', label: 'Under ₹30 Lac', min: 0, max: 3000000 },
  { value: '30l-50l', label: '₹30 Lac - ₹50 Lac', min: 3000000, max: 5000000 },
  { value: '50l-75l', label: '₹50 Lac - ₹75 Lac', min: 5000000, max: 7500000 },
  { value: '75l-1cr', label: '₹75 Lac - ₹1 Cr', min: 7500000, max: 10000000 },
  { value: '1cr-2cr', label: '₹1 Cr - ₹2 Cr', min: 10000000, max: 20000000 },
  { value: '2cr-5cr', label: '₹2 Cr - ₹5 Cr', min: 20000000, max: 50000000 },
  { value: 'above-5cr', label: 'Above ₹5 Cr', min: 50000000, max: 0 },
  { value: 'rent-budget', label: 'Monthly rent (under ₹1 Lac)', min: 0, max: 100000 }
]

const TIMELINES = [
  { value: 'immediate', label: 'Immediate' },
  { value: '3-6-months', label: '3 - 6 months' },
  { value: '6-12-months', label: '6 - 12 months' },
  { value: 'investment', label: 'Investment (no fixed date)' }
]

const STEPS = [
  {
    title: 'We call you back within 24 hours',
    text: 'A Faridabad advisor, not a call centre. We confirm your sector preference, budget band, loan requirement and who else is deciding with you.'
  },
  {
    title: 'You get a shortlist with real numbers',
    text: 'Three to five options on WhatsApp with the actual asking price, carpet area, floor, RERA number and the all-in cost sheet including stamp duty.'
  },
  {
    title: 'We drive you to the site, free',
    text: 'Pick a day and we cover three or four properties in one round. If nothing fits, we say so and go back to the drawing board — no pressure to close.'
  }
]

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  lookingFor: '',
  locality: '',
  budget: '',
  timeline: '',
  message: '',
  website: '' // honeypot
}

const budgetLabel = (value) => BUDGETS.find((b) => b.value === value)?.label || ''
const timelineLabel = (value) => TIMELINES.find((t) => t.value === value)?.label || ''
const lookingForLabel = (value) => LOOKING_FOR.find((l) => l.value === value)?.label || ''

export default function Enquiry() {
  const { settings, filters } = useSite()

  useSeo({
    title: 'Send an Enquiry — Tell Us What You Need in Faridabad',
    description:
      'Share your requirement — sector, budget and possession timeline — and a Rama Kripa Estates advisor will call you back within 24 hours with matching flats, plots, shops or offices in Faridabad.',
    keywords:
      'property enquiry Faridabad, buy flat Greater Faridabad, plot enquiry Neharpar, real estate consultant Faridabad',
    image: HERO_IMAGE
  })

  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)
  const formRef = useRef(null)
  const successRef = useRef(null)
  const hpId = `rk-enqpage-website-${useId()}`

  useEffect(() => {
    if (done) successRef.current?.focus()
  }, [done])

  const localityOptions = useMemo(() => {
    const live = Array.isArray(filters?.localities) ? filters.localities.filter(Boolean) : []
    const source = live.length ? live : FARIDABAD_LOCALITIES.map((l) => l.query)
    return Array.from(new Set(source)).sort((a, b) => String(a).localeCompare(String(b), 'en'))
  }, [filters])

  const phones = Array.isArray(settings.phones) && settings.phones.length ? settings.phones : ['+91 98110 00000']
  const primaryPhone = phones[0]
  const email = settings.email || 'info@ramakripaestate.com'
  const address = settings.address || 'SCO 12, Sector 88, Greater Faridabad, Haryana 121002'
  const hours = settings.hours || '10:00 - 19:00, Mon-Sun'
  const whatsappLink = whatsappHref(
    settings.whatsapp || primaryPhone,
    'Hello Rama Kripa Estates, I have a property requirement in Faridabad.'
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    if (values.website.trim()) return // bot

    // Same rules as EnquiryForm: name and phone required, email optional.
    const nextErrors = {
      name: validateName(values.name, 'name'),
      phone: validatePhone(values.phone),
      email: validateEmail(values.email, false)
    }
    setErrors(nextErrors)
    setSubmitError('')

    if (Object.values(nextErrors).some(Boolean)) {
      requestAnimationFrame(() => focusFirstError(formRef.current))
      return
    }

    const band = BUDGETS.find((b) => b.value === values.budget)

    const summary = [
      values.lookingFor ? `Looking for: ${lookingForLabel(values.lookingFor)}` : '',
      values.locality ? `Preferred locality: ${values.locality}` : '',
      values.budget ? `Budget: ${budgetLabel(values.budget)}` : '',
      values.timeline ? `Possession: ${timelineLabel(values.timeline)}` : ''
    ]
      .filter(Boolean)
      .join('\n')

    setSubmitting(true)
    try {
      await api.createEnquiry({
        name: values.name.trim(),
        phone: normalisePhone(values.phone),
        email: values.email.trim(),
        subject: values.lookingFor
          ? `Enquiry page — ${lookingForLabel(values.lookingFor)} in Faridabad`
          : 'Enquiry page — Faridabad property',
        message: [summary, values.message.trim()].filter(Boolean).join('\n\n'),
        interestedIn: values.lookingFor,
        budgetMin: band && band.min > 0 ? band.min : null,
        budgetMax: band && band.max > 0 ? band.max : null,
        source: 'enquiry-page'
      })
      setDone(true)
    } catch (err) {
      setSubmitError(
        err?.message ||
          `We could not send your enquiry just now. Please try again or call ${primaryPhone}.`
      )
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

  return (
    <div className="rk-enq">
      <PageHero
        eyebrow="One form, one call back"
        title="Send an Enquiry"
        subtitle="Tell us the sector, the budget and when you need possession. We come back with options that actually fit — usually the same working day."
        image={HERO_IMAGE}
        breadcrumb={[{ label: 'Send an Enquiry' }]}
      />

      <Section tone="cream" size="md" className="rk-enq__main" ariaLabel="Property enquiry form">
        <div className="rk-enq__row">
          <Reveal className="rk-enq__formCol">
            <div className="rk-card rk-card--pad rk-enq__formCard">
              {done ? (
                <div className="rk-enq__done" ref={successRef} tabIndex={-1}>
                  <span className="rk-enq__tick" aria-hidden="true">
                    <MdCheckCircle />
                  </span>
                  <h2 className="rk-enq__doneTitle">Enquiry received</h2>
                  <p className="rk-enq__doneText" role="status">
                    Thank you! Our Faridabad expert will call you within 24 hours.
                  </p>
                  <p className="rk-enq__doneMeta">
                    In a hurry? Call <a href={phoneHref(primaryPhone)}>{primaryPhone}</a> between 10:00 and 19:00, any day of
                    the week, or walk into our Sector 88 office.
                  </p>
                  <div className="rk-enq__doneActions">
                    <button type="button" className="rk-btn rk-btn--outline" onClick={reset}>
                      Send another enquiry
                    </button>
                    <Link className="rk-btn rk-btn--gold" to="/properties">
                      Browse properties
                      <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ) : (
                <form ref={formRef} className="rk-enq__form" onSubmit={handleSubmit} noValidate>
                  <SectionTitle
                    eyebrow="Your requirement"
                    title="What are you looking for?"
                    as="h2"
                    subtitle="Only the name and mobile number are compulsory — everything else just helps us shortlist faster."
                  />

                  {/* Honeypot — hidden from people, catnip for bots. */}
                  <div className="rk-enq__hp" aria-hidden="true">
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

                  <div className="rk-enq__grid">
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
                      hint="Optional — we send cost sheets and floor plans here."
                      className="rk-enq__wide"
                    />

                    <Field
                      as="select"
                      searchable
                      label="Looking For"
                      name="lookingFor"
                      value={values.lookingFor}
                      onChange={handleChange}
                      icon={<MdSell />}
                      options={LOOKING_FOR}
                      placeholder="Select a property type"
                    />

                    <Field
                      as="select"
                      searchable
                      label="Preferred Locality"
                      name="locality"
                      value={values.locality}
                      onChange={handleChange}
                      icon={<MdLocationOn />}
                      options={localityOptions}
                      placeholder="Any locality in Faridabad"
                    />

                    <Field
                      as="select"
                      searchable
                      label="Budget Range"
                      name="budget"
                      value={values.budget}
                      onChange={handleChange}
                      icon={<MdAccountBalanceWallet />}
                      options={BUDGETS}
                      placeholder="Select a budget band"
                    />

                    <Field
                      as="select"
                      searchable
                      label="Possession Timeline"
                      name="timeline"
                      value={values.timeline}
                      onChange={handleChange}
                      icon={<MdDateRange />}
                      options={TIMELINES}
                      placeholder="When do you need it?"
                    />

                    <Field
                      as="textarea"
                      label="Message"
                      name="message"
                      value={values.message}
                      onChange={handleChange}
                      rows={5}
                      maxLength={2000}
                      placeholder="For example: 3 BHK, ready to move, park facing, Sector 86 or 88, home loan needed for 70% of the value."
                      className="rk-enq__wide"
                    />
                  </div>

                  {submitError && (
                    <p className="rk-enq__alert" role="alert">
                      <MdErrorOutline aria-hidden="true" />
                      <span>{submitError}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    className="rk-btn rk-btn--gold rk-btn--block rk-enq__submit"
                    disabled={submitting}
                    aria-busy={submitting}
                  >
                    {submitting && <span className="rk-enq__spinner rk-anim-spin" aria-hidden="true" />}
                    {submitting ? 'Sending your enquiry…' : 'Send Enquiry'}
                  </button>

                  <p className="rk-enq__consent">
                    By submitting, you agree that Rama Kripa Estates may contact you about matching Faridabad properties. Read
                    our <Link to="/privacy-policy">Privacy Policy</Link>.
                  </p>
                </form>
              )}
            </div>
          </Reveal>

          <div className="rk-enq__sideCol">
            <Reveal variant="right" delay={100}>
              <section className="rk-enq__steps" aria-labelledby="rk-enq-steps-title">
                <h2 className="rk-enq__sideTitle" id="rk-enq-steps-title">
                  What happens next
                </h2>
                <ol className="rk-enq__stepList">
                  {STEPS.map((step, index) => (
                    <li className="rk-enq__step" key={step.title}>
                      <span className="rk-enq__stepNum" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div className="rk-enq__stepBody">
                        <h3 className="rk-enq__stepTitle">{step.title}</h3>
                        <p className="rk-enq__stepText">{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </Reveal>

            <Reveal variant="right" delay={180}>
              <section className="rk-enq__office" aria-labelledby="rk-enq-office-title">
                <h2 className="rk-enq__officeTitle" id="rk-enq-office-title">
                  Rather talk to someone?
                </h2>

                <ul className="rk-enq__officeList">
                  <li>
                    <span className="rk-enq__officeIcon" aria-hidden="true">
                      <MdLocationOn />
                    </span>
                    <address>{address}</address>
                  </li>
                  <li>
                    <span className="rk-enq__officeIcon" aria-hidden="true">
                      <MdCall />
                    </span>
                    <span className="rk-enq__officePhones">
                      {phones.map((phone) => (
                        <a key={phone} href={phoneHref(phone)}>
                          {phone}
                        </a>
                      ))}
                    </span>
                  </li>
                  <li>
                    <span className="rk-enq__officeIcon" aria-hidden="true">
                      <MdMailOutline />
                    </span>
                    <a href={mailtoHref(email, 'Property enquiry — Faridabad')}>{email}</a>
                  </li>
                  <li>
                    <span className="rk-enq__officeIcon" aria-hidden="true">
                      <MdSchedule />
                    </span>
                    <span>{hours}</span>
                  </li>
                </ul>

                <a className="rk-btn rk-btn--gold rk-btn--block" href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp className="rk-btn__icon" aria-hidden="true" />
                  WhatsApp Us
                </a>
              </section>
            </Reveal>

            <Reveal variant="right" delay={240}>
              <section className="rk-enq__why" aria-labelledby="rk-enq-why-title">
                <h2 className="rk-enq__sideTitle" id="rk-enq-why-title">
                  Why buy through us
                </h2>
                <ul className="rk-enq__whyList">
                  {WHY_US.map((item) => {
                    const Icon = item.icon
                    return (
                      <li className="rk-enq__whyItem" key={item.title}>
                        <span className="rk-enq__whyIcon" aria-hidden="true">
                          <Icon />
                        </span>
                        <span className="rk-enq__whyBody">
                          <strong>{item.title}</strong>
                          <span>{item.text}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
                <Link className="rk-link-gold rk-enq__whyLink" to="/about">
                  More about Rama Kripa Estates
                  <MdArrowForward aria-hidden="true" />
                </Link>
              </section>
            </Reveal>
          </div>
        </div>
      </Section>
    </div>
  )
}
