import { Link } from 'react-router-dom'
import {
  MdCall,
  MdMailOutline,
  MdLocationOn,
  MdSchedule,
  MdDirections,
  MdArrowForward,
  MdHeadsetMic
} from 'react-icons/md'
import { FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaXTwitter } from 'react-icons/fa6'
import PageHero from '../components/layout/PageHero'
import Section from '../components/ui/Section'
import SectionTitle from '../components/ui/SectionTitle'
import Reveal from '../components/ui/Reveal'
import Accordion from '../components/ui/Accordion'
import MapEmbed from '../components/ui/MapEmbed'
import ContactForm from '../components/forms/ContactForm'
import Logo from '../components/brand/Logo'
import useSeo from '../hooks/useSeo'
import { useSite, MAP_DIRECTIONS_URL, MAP_EMBED_URL } from '../context/SiteContext'
import { IMAGE_IDS, UNSPLASH } from '../data/constants'
import { mailtoHref, phoneHref, whatsappHref } from '../utils/format'
import './Contact.css'

const HERO_IMAGE = UNSPLASH(IMAGE_IDS.hero[5], 1600)

const SOCIAL_ICONS = {
  facebook: { icon: FaFacebookF, label: 'Facebook' },
  instagram: { icon: FaInstagram, label: 'Instagram' },
  linkedin: { icon: FaLinkedinIn, label: 'LinkedIn' },
  youtube: { icon: FaYoutube, label: 'YouTube' },
  twitter: { icon: FaXTwitter, label: 'X (Twitter)' }
}

const FAQS = [
  {
    id: 'faq-rera',
    title: 'How do I check whether a Faridabad project is really RERA registered?',
    content: (
      <>
        <p>
          Every licensed project in the city carries a Haryana RERA (HRERA Panchkula) registration number, and it must be
          printed on the builder&rsquo;s brochure, hoarding and allotment letter. Take that number to the HRERA portal and
          confirm the promoter name, licensed area, sanctioned plan and completion date before you pay a token amount.
        </p>
        <p>
          We do this check for you on every listing we publish, and we will show you the licence and the DTCP layout for the
          sector before you visit the site.
        </p>
      </>
    )
  },
  {
    id: 'faq-costs',
    title: 'What will registry actually cost me over and above the price?',
    content: (
      <>
        <p>
          In Haryana, stamp duty on a sale deed is 7% of the collector rate or the transaction value, whichever is higher, for a
          male buyer; 5% for a female buyer and 6% for a joint male-female purchase. Registration fee is capped at ₹50,000.
        </p>
        <p>
          Add builder charges that are quoted separately &mdash; IFMS, club membership, power backup, car parking and 1% TDS if the
          consideration crosses ₹50 lakh. We hand you a written cost sheet with all of it added up before you commit.
        </p>
      </>
    )
  },
  {
    id: 'faq-neharpar',
    title: 'Is Greater Faridabad (Neharpar) a better buy than the old sectors?',
    content: (
      <>
        <p>
          They serve different buyers. Sectors 75 to 89 give you newer group housing, wider sectoral roads, the FMDA master plan
          and better per-square-foot appreciation, but some pockets are still waiting on full water and sewer commissioning.
        </p>
        <p>
          Sectors 14, 15, 16, 21C and Old Faridabad give you settled markets, metro access and independent floors on freehold
          land &mdash; steadier rent, slower capital growth. Tell us your holding period and we will tell you which side of the
          bypass suits it.
        </p>
      </>
    )
  },
  {
    id: 'faq-loan',
    title: 'Can you arrange a home loan, and how long does sanction take?',
    content: (
      <>
        <p>
          Yes. We are empanelled with SBI, HDFC, LIC Housing Finance and PNB Housing, and most Faridabad projects on our list are
          already approved with at least two of them, which cuts the legal and technical appraisal short.
        </p>
        <p>
          A salaried file with complete documents is usually sanctioned in five to seven working days; a self-employed file with
          three years of ITR takes about ten. We get the sanction letter in hand before you pay the booking amount, never after.
        </p>
      </>
    )
  },
  {
    id: 'faq-visit',
    title: 'Do you charge for site visits, and can you show several projects in one day?',
    content: (
      <>
        <p>
          Site visits are free and we provide the car. A typical Sunday round covers three to four shortlisted projects &mdash; say
          two societies in Sector 86 and 88 and a builder floor in Sector 79 &mdash; with time at each for you to check the layout,
          lift lobby, water pressure and parking.
        </p>
        <p>
          Outstation and NRI buyers get a recorded video walkthrough of the same properties instead, along with our written notes
          on construction stage and neighbourhood.
        </p>
      </>
    )
  }
]

export default function Contact() {
  const { settings } = useSite()

  useSeo({
    title: 'Contact Us — Property Consultants in Greater Faridabad',
    description:
      'Talk to Rama Kripa Estates at SCO 12, Sector 88, Greater Faridabad. Call +91 98110 00000, WhatsApp us or send the enquiry form and a Faridabad property advisor will call you back within 24 hours.',
    keywords:
      'contact property dealer Faridabad, real estate office Sector 88, property consultant Greater Faridabad, Rama Kripa Estates contact',
    image: HERO_IMAGE
  })

  const phones = Array.isArray(settings.phones) && settings.phones.length ? settings.phones : ['+91 98110 00000']
  const primaryPhone = phones[0]
  const email = settings.email || 'info@ramakripaestate.com'
  const address = settings.address || 'SCO 12, Sector 88, Greater Faridabad, Haryana 121002'
  const addressLines =
    Array.isArray(settings.addressLines) && settings.addressLines.length
      ? settings.addressLines
      : address.split(',').map((part) => part.trim())
  const hours = settings.hours || '10:00 - 19:00, Mon-Sun'
  const directionsUrl = settings.directionsUrl || MAP_DIRECTIONS_URL
  const mapSrc = settings.mapEmbedUrl || MAP_EMBED_URL
  const socials = settings.socials || {}

  const whatsappLink = whatsappHref(
    settings.whatsapp || primaryPhone,
    'Hello Rama Kripa Estates, I would like to discuss a property in Faridabad.'
  )

  const tiles = [
    {
      key: 'call',
      icon: MdCall,
      title: 'Call Us',
      text: 'Speak to a Faridabad advisor directly, any day between 10:00 and 19:00.',
      value: primaryPhone,
      href: phoneHref(primaryPhone),
      cta: 'Call now',
      external: false
    },
    {
      key: 'whatsapp',
      icon: FaWhatsapp,
      title: 'WhatsApp',
      text: 'Send your requirement and we will reply with matching options and floor plans.',
      value: 'Chat on WhatsApp',
      href: whatsappLink,
      cta: 'Start a chat',
      external: true
    },
    {
      key: 'email',
      icon: MdMailOutline,
      title: 'Email Us',
      text: 'Share a detailed brief, a rent agreement or documents you want reviewed.',
      value: email,
      href: mailtoHref(email, 'Property enquiry — Faridabad'),
      cta: 'Write to us',
      external: false
    }
  ]

  return (
    <div className="rk-contact">
      <PageHero
        eyebrow="We are listening"
        title="Contact Us"
        subtitle="Our office sits on the SCO frontage of Sector 88, minutes from the Bypass Road. Walk in, call, or send the form — every enquiry is answered by a person, not a bot."
        image={HERO_IMAGE}
        breadcrumb={[{ label: 'Contact Us' }]}
      />

      <Section tone="cream" size="md" className="rk-contact__main" ariaLabel="Contact form and office details">
        <div className="rk-contact__row">
          <Reveal className="rk-contact__formCol">
            <div className="rk-card rk-card--pad rk-contact__formCard">
              <SectionTitle
                eyebrow="Send a message"
                title="Tell us what you are looking for"
                as="h2"
                subtitle="Sector, budget, possession timeline — the more you tell us, the fewer wasted site visits you make."
              />
              <ContactForm />
            </div>
          </Reveal>

          <Reveal className="rk-contact__infoCol" variant="right" delay={120}>
            <aside className="rk-contact__info" aria-labelledby="rk-contact-info-title">
              <Logo variant="light" showTagline={false} size={52} className="rk-contact__logo" />

              <h2 className="rk-contact__infoTitle" id="rk-contact-info-title">
                For inquiries Contact:
              </h2>
              <p className="rk-contact__brand">{settings.brandName || 'Rama Kripa Estates'}</p>

              <ul className="rk-contact__list">
                <li className="rk-contact__listItem">
                  <span className="rk-contact__icon" aria-hidden="true">
                    <MdLocationOn />
                  </span>
                  <div className="rk-contact__itemBody">
                    <span className="rk-contact__itemLabel">Office address</span>
                    <address className="rk-contact__address">
                      {addressLines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </address>
                  </div>
                </li>

                <li className="rk-contact__listItem">
                  <span className="rk-contact__icon" aria-hidden="true">
                    <MdMailOutline />
                  </span>
                  <div className="rk-contact__itemBody">
                    <span className="rk-contact__itemLabel">Email</span>
                    <a className="rk-contact__link" href={mailtoHref(email, 'Property enquiry — Faridabad')}>
                      {email}
                    </a>
                  </div>
                </li>

                <li className="rk-contact__listItem">
                  <span className="rk-contact__icon" aria-hidden="true">
                    <MdCall />
                  </span>
                  <div className="rk-contact__itemBody">
                    <span className="rk-contact__itemLabel">Phone</span>
                    {phones.map((phone) => (
                      <a className="rk-contact__link" key={phone} href={phoneHref(phone)}>
                        {phone}
                      </a>
                    ))}
                  </div>
                </li>

                <li className="rk-contact__listItem">
                  <span className="rk-contact__icon" aria-hidden="true">
                    <MdSchedule />
                  </span>
                  <div className="rk-contact__itemBody">
                    <span className="rk-contact__itemLabel">Office hours</span>
                    <span className="rk-contact__value">{hours}</span>
                    <span className="rk-contact__note">Site visits on Sunday are by appointment.</span>
                  </div>
                </li>
              </ul>

              <a className="rk-btn rk-btn--gold rk-btn--block rk-contact__whatsapp" href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp className="rk-btn__icon" aria-hidden="true" />
                WhatsApp Us
              </a>

              <div className="rk-contact__socials">
                <span className="rk-contact__socialLabel">Follow us</span>
                <ul className="rk-contact__socialList">
                  {Object.entries(SOCIAL_ICONS).map(([key, { icon: Icon, label }]) => {
                    const href = socials[key]
                    if (!href) return null
                    return (
                      <li key={key}>
                        <a
                          className="rk-contact__social"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Rama Kripa Estates on ${label}`}
                        >
                          <Icon aria-hidden="true" />
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </aside>
          </Reveal>
        </div>
      </Section>

      <Section tone="white" size="sm" className="rk-contact__mapSection" ariaLabel="Our location in Faridabad">
        <MapEmbed
          className="rk-contact__map"
          src={mapSrc}
          query={address}
          title="Rama Kripa Estates office — Sector 88, Greater Faridabad, Haryana"
          height={460}
          showDirections={false}
        />

        <p className="rk-contact__strip">
          <span className="rk-contact__stripIcon" aria-hidden="true">
            <MdLocationOn />
          </span>
          <span className="rk-contact__stripText">
            <strong>Address:</strong> {settings.brandName || 'Rama Kripa Estates'}, {address}
          </span>
          <a className="rk-contact__stripLink rk-link-gold" href={directionsUrl} target="_blank" rel="noopener noreferrer">
            <MdDirections aria-hidden="true" />
            Get Directions
            <span className="sr-only"> (opens Google Maps in a new tab)</span>
          </a>
        </p>
      </Section>

      <Section tone="cream" size="md" className="rk-contact__quick" ariaLabel="Quick ways to reach us">
        <SectionTitle
          eyebrow="Straight through"
          title="Three faster ways to reach us"
          align="center"
          subtitle="No call centre, no ticket number. These go to the same Faridabad team that handles your registry."
        />

        <ul className="rk-contact__tiles">
          {tiles.map((tile, index) => {
            const Icon = tile.icon
            return (
              <Reveal as="li" key={tile.key} delay={index * 90} className="rk-contact__tileWrap">
                <a
                  className="rk-card rk-card--hover rk-contact__tile"
                  href={tile.href}
                  {...(tile.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className="rk-contact__tileIcon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="rk-contact__tileTitle">{tile.title}</span>
                  <span className="rk-contact__tileText">{tile.text}</span>
                  <span className="rk-contact__tileValue">{tile.value}</span>
                  <span className="rk-contact__tileCta">
                    {tile.cta}
                    <MdArrowForward aria-hidden="true" />
                  </span>
                </a>
              </Reveal>
            )
          })}
        </ul>
      </Section>

      <Section tone="surface" size="md" className="rk-contact__faq" ariaLabel="Frequently asked questions">
        <div className="rk-contact__faqGrid">
          <div className="rk-contact__faqAside">
            <SectionTitle
              eyebrow="Before you buy"
              title="Questions Faridabad buyers ask us"
              as="h2"
              subtitle="Five things worth settling before you pay a token amount anywhere in the city."
            />
            <div className="rk-contact__faqCard">
              <span className="rk-contact__faqCardIcon" aria-hidden="true">
                <MdHeadsetMic />
              </span>
              <p className="rk-contact__faqCardText">
                Still unsure? Send us your shortlist and we will give you an honest read on each project &mdash; including the ones
                we do not sell.
              </p>
              <Link className="rk-btn rk-btn--outline rk-contact__faqCta" to="/enquiry">
                Send an Enquiry
                <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <Accordion items={FAQS} defaultOpen={0} className="rk-contact__accordion" />
        </div>
      </Section>
    </div>
  )
}
