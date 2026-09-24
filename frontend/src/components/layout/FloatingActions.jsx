import { useEffect, useState } from 'react'
import { MdPhoneInTalk, MdKeyboardArrowUp } from 'react-icons/md'
import { FaWhatsapp } from 'react-icons/fa6'
import { useSite } from '../../context/SiteContext'
import { phoneHref, whatsappHref } from '../../utils/format'
import './FloatingActions.css'

const WHATSAPP_TEXT =
  'Hello Rama Kripa Estates, I saw your website and would like to discuss a property in Faridabad.'

/** The page they were on, so the office sees a preview card of it, not a bare hello. */
const messageWithPage = () =>
  typeof window === 'undefined' ? WHATSAPP_TEXT : `${WHATSAPP_TEXT}

${window.location.href}`

/**
 * Fixed bottom-right stack: WhatsApp, call, and a back-to-top button that
 * appears after 500px of scroll. Safe-area aware so it clears the iOS home bar.
 */
export default function FloatingActions() {
  const { settings } = useSite()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        setShowTop(window.scrollY > 500)
        ticking = false
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const phone = settings.phones?.[0] || ''

  const scrollTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div className="rk-fab">
      {settings.whatsapp && (
        <a
          className="rk-fab__btn rk-fab__btn--whatsapp"
          href={whatsappHref(settings.whatsapp, messageWithPage())}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Rama Kripa Estates on WhatsApp"
        >
          <span className="rk-fab__ring" aria-hidden="true" />
          <FaWhatsapp aria-hidden="true" />
          <span className="rk-fab__tip">Chat on WhatsApp</span>
        </a>
      )}

      {phone && (
        <a
          className="rk-fab__btn rk-fab__btn--call"
          href={phoneHref(phone)}
          aria-label={`Call Rama Kripa Estates on ${phone}`}
        >
          <MdPhoneInTalk aria-hidden="true" />
          <span className="rk-fab__tip">Call {phone}</span>
        </a>
      )}

      <button
        type="button"
        className={`rk-fab__btn rk-fab__btn--top${showTop ? ' is-visible' : ''}`}
        onClick={scrollTop}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
      >
        <MdKeyboardArrowUp aria-hidden="true" />
        <span className="rk-fab__tip">Back to top</span>
      </button>
    </div>
  )
}
