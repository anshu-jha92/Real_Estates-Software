import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MdLocationOn,
  MdPhoneInTalk,
  MdMailOutline,
  MdAccessTime,
  MdKeyboardArrowDown,
  MdSend,
  MdCheckCircle
} from 'react-icons/md'
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaXTwitter
} from 'react-icons/fa6'
import Logo from '../brand/Logo'
import { useSite } from '../../context/SiteContext'
import { FARIDABAD_LOCALITIES, FOOTER_LINKS } from '../../data/constants'
import { mailtoHref, phoneHref } from '../../utils/format'
import './Footer.css'

const SOCIAL_META = [
  { key: 'facebook', label: 'Facebook', Icon: FaFacebookF },
  { key: 'instagram', label: 'Instagram', Icon: FaInstagram },
  { key: 'linkedin', label: 'LinkedIn', Icon: FaLinkedinIn },
  { key: 'youtube', label: 'YouTube', Icon: FaYoutube },
  { key: 'twitter', label: 'X (Twitter)', Icon: FaXTwitter }
]

const LOCALITY_LINKS = FARIDABAD_LOCALITIES.map((locality) => ({
  label: locality.name,
  to: `/properties?locality=${encodeURIComponent(locality.query)}`
}))

/** Column heading: a real disclosure button on mobile, plain heading above 768px. */
function FooterColumn({ title, links, compact, id }) {
  const [open, setOpen] = useState(false)
  const expanded = compact ? open : true

  return (
    <div className={`rk-footer__col${expanded ? ' is-open' : ''}`}>
      <h2 className="rk-footer__heading">
        {compact ? (
          <button
            type="button"
            className="rk-footer__heading-btn"
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((value) => !value)}
          >
            {title}
            <MdKeyboardArrowDown className="rk-footer__chevron" aria-hidden="true" />
          </button>
        ) : (
          <span className="rk-footer__heading-btn">{title}</span>
        )}
      </h2>

      <ul className="rk-footer__list" id={id}>
        {links.map((link) => (
          <li key={link.label}>
            <Link className="rk-footer__link" to={link.to}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Deep-green site footer: brand note, quick links, property types, popular
 * Faridabad localities, contact block with newsletter, and the legal bar.
 */
export default function Footer() {
  const { settings } = useSite()
  const [compact, setCompact] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  /* Columns collapse into accordions below 768px only. */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = (event) => setCompact(event.matches)
    sync(mq)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const socials = SOCIAL_META.filter(({ key }) => settings.socials?.[key])
  const phones = settings.phones || []
  const year = new Date().getFullYear()

  const onSubscribe = (event) => {
    event.preventDefault()
    const address = email.trim()
    if (!address) return
    window.location.href = mailtoHref(
      settings.email,
      'Subscribe me to Rama Kripa Estates updates',
      `Please add ${address} to your Faridabad property mailing list.`
    )
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="rk-footer">
      <div className="rk-container rk-footer__inner">
        <div className="rk-footer__brand">
          <Logo variant="light" showTagline={false} size={52} />

          <p className="rk-footer__about">
            Rama Kripa Estates has been matching families and businesses with the right address in
            Faridabad since 2007 — from the plotted colonies of Neharpar to the SCO frontage of
            Sector 88.
          </p>
          <p className="rk-footer__about">
            One city, sector by sector: verified listings, RERA-checked projects and honest registry
            rates.
          </p>

          {socials.length > 0 && (
            <ul className="rk-footer__socials">
              {socials.map(({ key, label, Icon }) => (
                <li key={key}>
                  <a
                    className="rk-footer__social"
                    href={settings.socials[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Rama Kripa Estates on ${label}`}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <FooterColumn
          title="Quick Links"
          links={FOOTER_LINKS.quick}
          compact={compact}
          id="rk-footer-quick"
        />
        <FooterColumn
          title="Property Types"
          links={FOOTER_LINKS.types}
          compact={compact}
          id="rk-footer-types"
        />
        <FooterColumn
          title="Popular Localities"
          links={LOCALITY_LINKS}
          compact={compact}
          id="rk-footer-localities"
        />

        <div className="rk-footer__col rk-footer__col--contact is-open">
          <h2 className="rk-footer__heading">
            <span className="rk-footer__heading-btn">Get In Touch</span>
          </h2>

          <ul className="rk-footer__contact">
            <li>
              <MdLocationOn aria-hidden="true" />
              <address>{settings.address}</address>
            </li>
            {phones.length > 0 && (
              <li>
                <MdPhoneInTalk aria-hidden="true" />
                <span>
                  {phones.map((phone, index) => (
                    <span key={phone}>
                      {index > 0 && <span aria-hidden="true"> / </span>}
                      <a href={phoneHref(phone)}>{phone}</a>
                    </span>
                  ))}
                </span>
              </li>
            )}
            <li>
              <MdMailOutline aria-hidden="true" />
              <a href={mailtoHref(settings.email, 'Property enquiry — Rama Kripa Estates')}>
                {settings.email}
              </a>
            </li>
            <li>
              <MdAccessTime aria-hidden="true" />
              <span>{settings.hours}</span>
            </li>
          </ul>

          <form className="rk-footer__news" onSubmit={onSubscribe}>
            <label className="rk-footer__news-label" htmlFor="rk-footer-email">
              New launches, price trends and site-visit dates
            </label>

            <div className="rk-footer__news-row">
              <input
                id="rk-footer-email"
                className="rk-footer__news-input"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setSubscribed(false)
                }}
              />
              <button type="submit" className="rk-footer__news-btn" aria-label="Subscribe">
                <MdSend aria-hidden="true" />
              </button>
            </div>

            <p className="rk-footer__news-note" role="status">
              {subscribed ? (
                <>
                  <MdCheckCircle aria-hidden="true" /> Your mail app has opened — just hit send and
                  we will add you to the list.
                </>
              ) : (
                'We send about two updates a month. No spam, unsubscribe any time.'
              )}
            </p>
          </form>
        </div>
      </div>

      <div className="rk-footer__bar">
        <div className="rk-container rk-footer__bar-inner">
          <p>© {year} Rama Kripa Estates. All rights reserved.</p>

          <ul className="rk-footer__legal">
            {FOOTER_LINKS.legal.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
