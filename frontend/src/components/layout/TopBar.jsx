import { MdLocationOn, MdAccessTime, MdPhoneInTalk } from 'react-icons/md'
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaXTwitter,
  FaWhatsapp
} from 'react-icons/fa6'
import { useSite } from '../../context/SiteContext'
import { phoneHref, whatsappHref } from '../../utils/format'
import './TopBar.css'

/** Order + icon for every social key a Setting doc can carry. */
const SOCIAL_META = [
  { key: 'facebook', label: 'Facebook', Icon: FaFacebookF },
  { key: 'instagram', label: 'Instagram', Icon: FaInstagram },
  { key: 'linkedin', label: 'LinkedIn', Icon: FaLinkedinIn },
  { key: 'youtube', label: 'YouTube', Icon: FaYoutube },
  { key: 'twitter', label: 'X (Twitter)', Icon: FaXTwitter }
]

/**
 * Deep-green utility strip above the header: office address + hours on the
 * left, a gold "call to expert" pill in the middle-right and the social row.
 * Hidden below 992px — the drawer and floating actions cover it there.
 */
export default function TopBar() {
  const { settings } = useSite()
  const phone = settings.phones?.[0] || ''
  const socials = SOCIAL_META.filter(({ key }) => settings.socials?.[key])

  return (
    <div className="rk-topbar">
      <div className="rk-container rk-topbar__inner">
        <ul className="rk-topbar__info">
          <li className="rk-topbar__item">
            <MdLocationOn className="rk-topbar__icon" aria-hidden="true" />
            <span>{settings.address}</span>
          </li>
          <li className="rk-topbar__item">
            <MdAccessTime className="rk-topbar__icon" aria-hidden="true" />
            <span>Open {settings.hours}</span>
          </li>
        </ul>

        <div className="rk-topbar__right">
          {phone && (
            <a className="rk-topbar__call" href={phoneHref(phone)}>
              <span className="rk-topbar__call-icon" aria-hidden="true">
                <MdPhoneInTalk />
              </span>
              <span className="rk-topbar__call-label">Call to Expert</span>
              <span className="rk-topbar__call-number">{phone}</span>
            </a>
          )}

          {(socials.length > 0 || settings.whatsapp) && (
            <ul className="rk-topbar__socials">
              {socials.map(({ key, label, Icon }) => (
                <li key={key}>
                  <a
                    className="rk-topbar__social"
                    href={settings.socials[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Rama Kripa Estates on ${label}`}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                </li>
              ))}
              {settings.whatsapp && (
                <li>
                  <a
                    className="rk-topbar__social rk-topbar__social--whatsapp"
                    href={whatsappHref(
                      settings.whatsapp,
                      'Hello Rama Kripa Estates, I would like to know more about properties in Faridabad.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with Rama Kripa Estates on WhatsApp"
                  >
                    <FaWhatsapp aria-hidden="true" />
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
