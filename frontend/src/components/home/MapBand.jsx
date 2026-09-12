import { MdLocationOn, MdPhoneInTalk, MdEmail, MdAccessTime, MdDirections } from 'react-icons/md'
import Section from '../ui/Section'
import SectionTitle from '../ui/SectionTitle'
import MapEmbed from '../ui/MapEmbed'
import { useSite, MAP_EMBED_URL, MAP_DIRECTIONS_URL } from '../../context/SiteContext'
import { phoneHref, mailtoHref } from '../../utils/format'
import './MapBand.css'

/**
 * Home §14b — the Faridabad office on the map, with the contact card
 * overlapping it on desktop and stacked underneath on mobile.
 */
export default function MapBand() {
  const { settings } = useSite()

  const address = settings.address || 'SCO 12, Sector 88, Greater Faridabad, Haryana 121002'
  const addressLines = settings.addressLines?.length
    ? settings.addressLines
    : address.split(',').map((part) => part.trim()).filter(Boolean)
  const phone = settings.phones?.[0] || '+91 98110 00000'
  const email = settings.email || 'info@ramakripaestate.com'
  const hours = settings.hours || '10:00 - 19:00, Mon-Sun'
  const directions = settings.directionsUrl || MAP_DIRECTIONS_URL

  return (
    <Section tone="white" className="rk-mapband" ariaLabel="Visit our Faridabad office">
      <SectionTitle
        eyebrow="Come Say Hello"
        title="Visit Our Faridabad Office"
        subtitle="Walk in with your requirement, or call ahead and we will keep the shortlist and the site-visit car ready."
        align="center"
      />

      <div className="rk-mapband__wrap">
        <MapEmbed
          className="rk-mapband__map"
          src={settings.mapEmbedUrl || MAP_EMBED_URL}
          query={address}
          title="Google Map showing the Rama Kripa Estates office in Sector 88, Greater Faridabad"
          height={420}
          showDirections={false}
        />

        <address className="rk-mapband__card">
          <h3 className="rk-mapband__cardTitle">Rama Kripa Estates</h3>
          <p className="rk-mapband__tagline">Blessings in Every Address</p>

          <ul className="rk-mapband__list">
            <li>
              <MdLocationOn aria-hidden="true" />
              <span>
                <small>Office</small>
                {addressLines.map((line) => (
                  <span className="rk-mapband__line" key={line}>
                    {line}
                  </span>
                ))}
              </span>
            </li>

            <li>
              <MdPhoneInTalk aria-hidden="true" />
              <span>
                <small>Phone</small>
                <a href={phoneHref(phone)}>{phone}</a>
              </span>
            </li>

            <li>
              <MdEmail aria-hidden="true" />
              <span>
                <small>Email</small>
                <a href={mailtoHref(email, 'Property enquiry — Faridabad')}>{email}</a>
              </span>
            </li>

            <li>
              <MdAccessTime aria-hidden="true" />
              <span>
                <small>Open</small>
                {hours}
              </span>
            </li>
          </ul>

          <a
            className="rk-mapband__directions rk-link-gold"
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MdDirections aria-hidden="true" />
            Get Directions
            <span className="sr-only"> (opens Google Maps in a new tab)</span>
          </a>
        </address>
      </div>
    </Section>
  )
}
