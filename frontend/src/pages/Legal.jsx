import { Link, useLocation } from 'react-router-dom'
import { MdArrowForward, MdMailOutline, MdCall, MdLocationOn, MdUpdate } from 'react-icons/md'
import PageHero from '../components/layout/PageHero'
import Section from '../components/ui/Section'
import useSeo from '../hooks/useSeo'
import { useSite } from '../context/SiteContext'
import { IMAGE_IDS, UNSPLASH } from '../data/constants'
import { mailtoHref, phoneHref } from '../utils/format'
import './Legal.css'

const HERO_IMAGE = UNSPLASH(IMAGE_IDS.commercial[4], 1600)
const LAST_UPDATED = '1 September 2026'

/* ------------------------------------------------------------------ */
/* Privacy Policy                                                      */
/* ------------------------------------------------------------------ */

const PRIVACY_SECTIONS = [
  {
    id: 'who-we-are',
    title: 'Who this policy covers',
    body: (
      <>
        <p>
          This policy explains how Rama Kripa Estates (&ldquo;we&rdquo;, &ldquo;us&rdquo;), a property consultancy operating from
          SCO 12, Sector 88, Greater Faridabad, Haryana 121002, collects and uses personal information through this website and
          through the enquiries, calls and site visits that follow from it.
        </p>
        <p>
          It applies to every visitor to ramakripaestate.com, whether you simply browse listings or submit an enquiry form. By
          using the site or sending us an enquiry, you agree to the handling of information described here.
        </p>
      </>
    )
  },
  {
    id: 'data-we-collect',
    title: 'Information we collect',
    body: (
      <>
        <p>We only ask for what a property consultant genuinely needs to help you:</p>
        <ul>
          <li>
            <strong>Enquiry details</strong> &mdash; your name, mobile number, email address, preferred locality, budget band,
            possession timeline and the message you write, submitted through the contact, enquiry or property-detail forms.
          </li>
          <li>
            <strong>Transaction information</strong> &mdash; if you proceed with a purchase, sale or rental, the identity and
            financial documents required for the agreement, home-loan application and registry (PAN, Aadhaar, address proof,
            bank statements, income proof). These are collected offline, at our office or by secure sharing, never through this
            website.
          </li>
          <li>
            <strong>Technical information</strong> &mdash; standard server logs such as your IP address, browser type, the pages
            you viewed and the time of your visit, kept for security and to understand which listings are useful.
          </li>
        </ul>
        <p>
          We do not knowingly collect information from anyone under 18, and we do not ask for card numbers, UPI credentials,
          internet-banking passwords or OTPs anywhere on this website. Nobody from Rama Kripa Estates will ever ask you for an OTP
          over the phone.
        </p>
      </>
    )
  },
  {
    id: 'how-we-use',
    title: 'How we use your enquiry data',
    body: (
      <>
        <p>Information you send us is used to:</p>
        <ul>
          <li>Call or message you back about the property or requirement you enquired about, usually within 24 hours.</li>
          <li>Shortlist matching properties in Faridabad and share floor plans, cost sheets and site-visit options.</li>
          <li>Arrange site visits, developer appointments and, where you ask for it, home-loan introductions.</li>
          <li>Complete legal, documentation and registry work you engage us for.</li>
          <li>Keep an internal record of the advice given, as required for a professional service.</li>
        </ul>
        <p>
          We may occasionally send you new launches or price updates for the sectors you told us about. Every such message
          carries an opt-out, and a single reply asking us to stop is enough &mdash; you do not need to give a reason.
        </p>
        <p>
          We do not sell, rent or trade your contact details. We do not run a lead-sale business, and your number is not passed
          to a pool of brokers.
        </p>
      </>
    )
  },
  {
    id: 'sharing',
    title: 'Who we share information with',
    body: (
      <>
        <p>Your details are shared only where it is necessary to do the job you asked us to do:</p>
        <ul>
          <li>
            <strong>Developers and sellers</strong> &mdash; your name and mobile number, when you ask us to register you for a
            specific project or to book a site visit, so the builder can allow entry and record the visit against your booking.
          </li>
          <li>
            <strong>Banks and housing-finance companies</strong> &mdash; only when you specifically ask us to arrange a home-loan
            introduction, and only the documents you hand over for that purpose.
          </li>
          <li>
            <strong>Advocates, deed writers and the sub-registrar office</strong> &mdash; where you engage us for documentation,
            mutation or registry work in Faridabad.
          </li>
          <li>
            <strong>Service providers</strong> &mdash; our website hosting, database and email providers, who process data on our
            instructions only.
          </li>
          <li>
            <strong>Authorities</strong> &mdash; where disclosure is required by Indian law, a court order or a lawful request
            from a government agency.
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'cookies',
    title: 'Cookies and analytics',
    body: (
      <>
        <p>
          This site uses a small amount of browser storage to remember practical things: the filters you applied on the
          properties page, your last search and whether you dismissed a notice. These stay in your own browser.
        </p>
        <p>
          Pages that embed a Google Map load content from Google, and Google may set its own cookies when that map loads. That is
          governed by Google&rsquo;s privacy policy, not ours. If you would rather not load it, most browsers let you block
          third-party content for a site.
        </p>
        <p>
          You can clear or block cookies from your browser settings at any time. The site will keep working; it will simply stop
          remembering your filters between visits.
        </p>
      </>
    )
  },
  {
    id: 'retention-security',
    title: 'How long we keep data, and how it is protected',
    body: (
      <>
        <p>
          Enquiry records are kept for up to three years from your last contact with us, because property decisions in Faridabad
          are often revisited a year or two later. Records connected to a completed transaction are kept for eight years, in line
          with tax and accounting requirements in India. After that they are deleted or anonymised.
        </p>
        <p>
          Data is held on access-controlled systems, transmitted over HTTPS and available only to the Rama Kripa Estates staff who
          need it for your file. No system is perfectly secure, but we do not keep documents on shared drives or personal
          devices, and we do not store payment credentials at all.
        </p>
      </>
    )
  },
  {
    id: 'your-rights',
    title: 'Your choices and rights',
    body: (
      <>
        <p>You can, at any time, ask us to:</p>
        <ul>
          <li>Tell you what personal information we hold about you.</li>
          <li>Correct anything that is wrong or out of date.</li>
          <li>Delete your enquiry record, where we are not required to keep it for a completed transaction.</li>
          <li>Stop contacting you about properties, entirely or for a particular sector.</li>
        </ul>
        <p>
          Write to us at the email address below with the mobile number you used, and we will act on the request within 30 days.
        </p>
      </>
    )
  },
  {
    id: 'grievance',
    title: 'Grievance contact',
    body: (
      <>
        <p>
          If you are unhappy with how your information has been handled, raise it with our grievance officer and we will respond
          within 30 days of receiving the complaint.
        </p>
        <p>
          <strong>Grievance Officer:</strong> Neha Chauhan, Legal &amp; Documentation Manager, Rama Kripa Estates.
        </p>
      </>
    )
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        We update this page whenever our practices change. The revision date at the top always shows the current version, and
        material changes are highlighted on the site for a reasonable period. Continuing to use the site after an update means
        you accept the revised policy.
      </p>
    )
  }
]

/* ------------------------------------------------------------------ */
/* Terms & Conditions                                                  */
/* ------------------------------------------------------------------ */

const TERMS_SECTIONS = [
  {
    id: 'acceptance',
    title: 'Acceptance of these terms',
    body: (
      <>
        <p>
          These terms govern your use of ramakripaestate.com, operated by Rama Kripa Estates, a property consultancy at SCO 12,
          Sector 88, Greater Faridabad, Haryana 121002. By browsing the site, using its search or submitting an enquiry, you
          accept them.
        </p>
        <p>If you do not agree with any part of these terms, please do not use the website.</p>
      </>
    )
  },
  {
    id: 'listing-accuracy',
    title: 'Listing accuracy and availability',
    body: (
      <>
        <p>
          Property details on this site &mdash; price, carpet and super area, floor, configuration, possession date, amenities,
          images and floor plans &mdash; are provided by owners, developers and their channel partners, or compiled by us from
          those sources. We check what we reasonably can, but we cannot warrant that every figure is accurate or current.
        </p>
        <p>
          Prices in Faridabad move, inventory sells, and builders revise payment plans and specifications. Images and renders are
          indicative and may not depict the exact unit. Nothing on this site is an offer or a guarantee of availability at the
          price shown. Verify every material fact &mdash; measurements, approvals, dues and the sanctioned plan &mdash;
          independently before you pay any amount.
        </p>
      </>
    )
  },
  {
    id: 'rera',
    title: 'RERA and regulatory note',
    body: (
      <>
        <p>
          Where a project is registered under the Real Estate (Regulation and Development) Act, 2016, its Haryana RERA
          registration number is shown on the listing or is available from us on request. Buyers should independently verify the
          registration, the promoter details, the sanctioned layout and the declared completion date on the HRERA Panchkula
          portal before booking.
        </p>
        <p>
          Rama Kripa Estates acts as a real-estate agent. We do not promote, develop or construct any project, and we make no
          representation on behalf of a promoter beyond what the promoter has published. Any commitment on price, specification,
          possession date or payment plan is binding only when it appears in the builder-buyer agreement or the registered
          documents executed between you and the seller.
        </p>
      </>
    )
  },
  {
    id: 'no-advice',
    title: 'No brokerage, investment, legal or tax advice',
    body: (
      <>
        <p>
          The content on this site &mdash; including locality guides, rate ranges, rental-yield notes and articles &mdash; is
          general information about the Faridabad market. It is not investment advice, legal opinion or tax advice, and it is not
          tailored to your circumstances.
        </p>
        <p>
          Property values can fall as well as rise, rents can stay vacant, and a project can be delayed. Take independent legal,
          financial and tax advice before you commit. Any decision you make on the basis of this website is your own.
        </p>
      </>
    )
  },
  {
    id: 'use-of-site',
    title: 'Permitted use of the website',
    body: (
      <>
        <p>You may browse this site and use its search for your own genuine property requirement. You may not:</p>
        <ul>
          <li>Scrape, crawl, copy or republish listings, images or descriptions, in whole or in part.</li>
          <li>Submit false, abusive or automated enquiries, or use another person&rsquo;s contact details.</li>
          <li>Attempt to gain access to the admin area, the database or any part of the system not made public.</li>
          <li>Use the site to advertise, solicit or promote any competing service.</li>
        </ul>
        <p>We may withdraw access from anyone who does these things, without notice.</p>
      </>
    )
  },
  {
    id: 'enquiries',
    title: 'Enquiries and how we respond',
    body: (
      <>
        <p>
          Sending an enquiry does not create a booking, a reservation or a contract of agency. It is a request for a call back.
          By submitting a form, you consent to being contacted by phone, WhatsApp or email about your requirement, including on
          a number registered under the DND registry, and confirm the details you gave are your own.
        </p>
        <p>
          Where we are engaged for a transaction, our brokerage, its rate, and the point at which it becomes payable are agreed
          separately in writing before any visit or negotiation begins. Nothing on this page fixes a fee.
        </p>
      </>
    )
  },
  {
    id: 'ip',
    title: 'Intellectual property',
    body: (
      <p>
        The Rama Kripa Estates name, the logo, the tagline &ldquo;Blessings in Every Address&rdquo;, the site design, the written
        guides and all original photography are owned by us or licensed to us, and are protected under Indian copyright and
        trademark law. Photographs supplied by developers remain their property and are used with permission. You may not
        reproduce any of it commercially without our written consent. Short quotations with a visible credit and a link back are
        welcome.
      </p>
    )
  },
  {
    id: 'third-party',
    title: 'Third-party links and embedded content',
    body: (
      <p>
        This site links to developer sites, the HRERA portal, bank pages and other resources, and embeds Google Maps. We do not
        control those services and are not responsible for their content, availability or privacy practices. A link is not an
        endorsement.
      </p>
    )
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <>
        <p>
          This website is provided on an &ldquo;as is&rdquo; basis. To the fullest extent permitted by law, Rama Kripa Estates,
          its partners and its employees are not liable for any indirect, incidental or consequential loss &mdash; including lost
          profit, lost opportunity or loss of an expected appreciation &mdash; arising from your use of this site or from
          reliance on information published on it.
        </p>
        <p>
          Nothing in these terms limits liability for fraud, wilful misconduct or anything that cannot lawfully be excluded. Our
          total liability in connection with any engagement is limited to the brokerage actually received by us for that
          transaction.
        </p>
      </>
    )
  },
  {
    id: 'governing-law',
    title: 'Governing law and jurisdiction',
    body: (
      <p>
        These terms are governed by the laws of India. Any dispute arising out of or in connection with this website or our
        services is subject to the exclusive jurisdiction of the competent courts at Faridabad, Haryana. Where a dispute concerns
        a registered real-estate project, the remedies available under the Real Estate (Regulation and Development) Act, 2016 and
        the Haryana Real Estate Regulatory Authority continue to apply.
      </p>
    )
  },
  {
    id: 'contact-terms',
    title: 'Contacting us about these terms',
    body: (
      <p>
        Questions about these terms, a listing you believe is inaccurate, or a takedown request for content you own can be sent
        to us at the address and email below. We respond to every written notice within 30 days.
      </p>
    )
  }
]

const CONTENT = {
  privacy: {
    key: 'privacy',
    hero: 'Privacy Policy',
    eyebrow: 'Your data, plainly explained',
    subtitle:
      'What we collect when you send an enquiry, what we do with it, who else sees it and how to have it removed. No legal fog.',
    crumb: 'Privacy Policy',
    intro:
      'Rama Kripa Estates collects personal information for one reason: to help you buy, sell or rent a property in Faridabad. This page sets out exactly what that means in practice.',
    sections: PRIVACY_SECTIONS,
    seoTitle: 'Privacy Policy',
    seoDescription:
      'How Rama Kripa Estates collects, uses, shares and protects the personal information you give us through enquiry forms, calls and property transactions in Faridabad.'
  },
  terms: {
    key: 'terms',
    hero: 'Terms & Conditions',
    eyebrow: 'The rules of this website',
    subtitle:
      'Listing accuracy, our role as a RERA-registered agent, what our content is and is not, and the law that governs a dispute.',
    crumb: 'Terms & Conditions',
    intro:
      'These terms set out how you may use ramakripaestate.com and what you can and cannot rely on from the information published here. Please read them before you act on anything you find on this site.',
    sections: TERMS_SECTIONS,
    seoTitle: 'Terms & Conditions',
    seoDescription:
      'Terms of use for ramakripaestate.com — listing accuracy disclaimer, RERA note, limits on advice, intellectual property, limitation of liability and Faridabad, Haryana jurisdiction.'
  }
}

/**
 * Privacy Policy and Terms & Conditions share one layout.
 * Accepts `kind` or `type`; falls back to the pathname so the page is correct
 * however it is routed.
 */
export default function Legal({ kind, type }) {
  const { pathname } = useLocation()
  const { settings } = useSite()

  const requested = String(kind || type || '').toLowerCase()
  const key =
    requested === 'terms' || requested === 'privacy'
      ? requested
      : pathname.includes('term')
        ? 'terms'
        : 'privacy'

  const doc = CONTENT[key]

  useSeo({
    title: `${doc.seoTitle} — Rama Kripa Estates, Faridabad`,
    description: doc.seoDescription,
    image: HERO_IMAGE
  })

  const phones = Array.isArray(settings.phones) && settings.phones.length ? settings.phones : ['+91 98110 00000']
  const primaryPhone = phones[0]
  const email = settings.email || 'info@ramakripaestate.com'
  const address = settings.address || 'SCO 12, Sector 88, Greater Faridabad, Haryana 121002'

  return (
    <div className="rk-legal">
      <PageHero
        eyebrow={doc.eyebrow}
        title={doc.hero}
        subtitle={doc.subtitle}
        image={HERO_IMAGE}
        breadcrumb={[{ label: doc.crumb }]}
      />

      <Section tone="cream" size="md" className="rk-legal__main" ariaLabel={doc.hero}>
        <div className="rk-legal__row">
          <nav className="rk-legal__toc" aria-labelledby="rk-legal-toc-title">
            <p className="rk-legal__tocTitle" id="rk-legal-toc-title">
              On this page
            </p>
            <ol className="rk-legal__tocList">
              {doc.sections.map((section, index) => (
                <li key={section.id}>
                  <a className="rk-legal__tocLink" href={`#${section.id}`}>
                    <span className="rk-legal__tocNum" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>

            <p className="rk-legal__tocSwitch">
              {key === 'privacy' ? (
                <Link className="rk-link-gold" to="/terms">
                  Read the Terms &amp; Conditions
                  <MdArrowForward aria-hidden="true" />
                </Link>
              ) : (
                <Link className="rk-link-gold" to="/privacy-policy">
                  Read the Privacy Policy
                  <MdArrowForward aria-hidden="true" />
                </Link>
              )}
            </p>
          </nav>

          <div className="rk-legal__doc">
            <p className="rk-legal__updated">
              <MdUpdate aria-hidden="true" />
              Last updated: <strong>{LAST_UPDATED}</strong>
            </p>

            <p className="rk-legal__intro">{doc.intro}</p>

            {doc.sections.map((section, index) => (
              <section className="rk-legal__section" id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
                <h2 className="rk-legal__sectionTitle" id={`${section.id}-title`}>
                  <span className="rk-legal__sectionNum" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                </h2>
                <div className="rk-legal__body">{section.body}</div>
              </section>
            ))}

            <section className="rk-legal__contact" aria-labelledby="rk-legal-contact-title">
              <h2 className="rk-legal__sectionTitle" id="rk-legal-contact-title">
                Contact us
              </h2>
              <ul className="rk-legal__contactList">
                <li>
                  <MdLocationOn aria-hidden="true" />
                  <address>{settings.brandName || 'Rama Kripa Estates'}, {address}</address>
                </li>
                <li>
                  <MdMailOutline aria-hidden="true" />
                  <a href={mailtoHref(email, `${doc.seoTitle} query`)}>{email}</a>
                </li>
                <li>
                  <MdCall aria-hidden="true" />
                  <a href={phoneHref(primaryPhone)}>{primaryPhone}</a>
                </li>
              </ul>
              <Link className="rk-btn rk-btn--outline rk-legal__contactCta" to="/contact">
                Go to the contact page
                <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
              </Link>
            </section>
          </div>
        </div>
      </Section>
    </div>
  )
}
