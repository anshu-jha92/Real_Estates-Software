import { MdPhoneInTalk, MdWhatsapp, MdVerified, MdSchedule } from 'react-icons/md'
import Section from '../ui/Section'
import EnquiryForm from '../forms/EnquiryForm'
import { useSite } from '../../context/SiteContext'
import { phoneHref, whatsappHref } from '../../utils/format'
import './CtaEnquiry.css'

const WHATSAPP_TEXT =
  'Hello Rama Kripa Estates, I am looking for a property in Faridabad. Please share options.'

/**
 * Home §14a — deep-green pitch panel beside the callback form.
 */
export default function CtaEnquiry() {
  const { settings } = useSite()
  const phone = settings.phones?.[0] || '+91 98110 00000'
  const whatsapp = settings.whatsapp || phone

  return (
    <Section tone="surface" className="rk-cta" ariaLabel="Request a callback">
      <div className="rk-cta__grid">
        <div className="rk-cta__panel">
          <span className="rk-cta__flourish" aria-hidden="true" />

          <span className="rk-eyebrow rk-eyebrow--light">Talk To Us</span>

          <h2 className="rk-cta__title">
            Let’s Find Your Address in <em>Faridabad</em>
          </h2>

          <p className="rk-cta__text">
            Tell us the sector you like, the budget you are working with and when you want
            possession. One of our advisors will call you back the same working day with three
            options that genuinely fit — not a list of everything on the market.
          </p>

          <ul className="rk-cta__points">
            <li>
              <MdVerified aria-hidden="true" />
              Every option checked against the Haryana RERA register
            </li>
            <li>
              <MdSchedule aria-hidden="true" />
              Callback within 24 hours, site visit within the week
            </li>
          </ul>

          <div className="rk-cta__contact">
            <a className="rk-cta__line" href={phoneHref(phone)}>
              <span className="rk-cta__lineIcon" aria-hidden="true">
                <MdPhoneInTalk />
              </span>
              <span>
                <small>Call our Faridabad desk</small>
                {phone}
              </span>
            </a>

            <a
              className="rk-cta__line"
              href={whatsappHref(whatsapp, WHATSAPP_TEXT)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="rk-cta__lineIcon rk-cta__lineIcon--wa" aria-hidden="true">
                <MdWhatsapp />
              </span>
              <span>
                <small>Chat on WhatsApp</small>
                Send us your requirement
              </span>
            </a>
          </div>
        </div>

        <div className="rk-cta__card">
          <EnquiryForm source="home-cta" title="Request a Callback" />
        </div>
      </div>
    </Section>
  )
}
