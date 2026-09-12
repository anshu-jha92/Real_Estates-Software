import { useEffect, useRef, useState } from 'react'
import { FaWhatsapp, FaFacebookF, FaXTwitter, FaLinkedinIn } from 'react-icons/fa6'
import { MdEmail, MdContentCopy, MdCheck } from 'react-icons/md'
import { mailtoHref } from '../../utils/format'
import './ShareRow.css'

/** Clipboard write with the old execCommand path for older / insecure contexts. */
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }

  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '-1000px'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

/**
 * Share buttons for a property page. Uses the live page URL unless one is passed.
 *
 * @param {{ url?: string, title?: string, label?: string, className?: string }} props
 */
export default function ShareRow({
  url,
  title = 'Property at Rama Kripa Estates',
  label = 'Share this property',
  className = ''
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const encodedUrl = encodeURIComponent(shareUrl)
  const message = `${title} — Rama Kripa Estates, Faridabad`
  const encodedText = encodeURIComponent(message)

  const links = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${message}\n${shareUrl}`)}`,
      icon: FaWhatsapp
    },
    {
      key: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FaFacebookF
    },
    {
      key: 'x',
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      icon: FaXTwitter
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: FaLinkedinIn
    },
    {
      key: 'email',
      label: 'Email',
      href: mailtoHref('', message, `${message}\n\n${shareUrl}`),
      icon: MdEmail,
      external: false
    }
  ]

  const handleCopy = async () => {
    const ok = await copyText(shareUrl)
    setCopied(ok)
    clearTimeout(timer.current)
    if (ok) timer.current = setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className={`rk-share ${className}`.trim()}>
      <span className="rk-share__label">{label}</span>

      <ul className="rk-share__list">
        {links.map(({ key, label: name, href, icon: Icon, external = true }) => (
          <li key={key}>
            <a
              className={`rk-share__btn rk-share__btn--${key}`}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              aria-label={`Share on ${name}`}
              title={`Share on ${name}`}
            >
              <Icon aria-hidden="true" />
            </a>
          </li>
        ))}

        <li>
          <button
            type="button"
            className={`rk-share__btn rk-share__btn--copy ${copied ? 'is-copied' : ''}`.trim()}
            onClick={handleCopy}
            aria-label={copied ? 'Link copied to clipboard' : 'Copy link to this property'}
            title={copied ? 'Copied!' : 'Copy link'}
          >
            {copied ? <MdCheck aria-hidden="true" /> : <MdContentCopy aria-hidden="true" />}
            <span className="rk-share__copytext">{copied ? 'Copied!' : 'Copy link'}</span>
          </button>
        </li>
      </ul>

      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Property link copied to clipboard' : ''}
      </span>
    </div>
  )
}
