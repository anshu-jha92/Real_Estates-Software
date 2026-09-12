import { Link } from 'react-router-dom'
import { MdHome, MdArrowForward, MdLocationCity, MdCall } from 'react-icons/md'
import PageHero from '../components/layout/PageHero'
import Section from '../components/ui/Section'
import useSeo from '../hooks/useSeo'
import { useSite } from '../context/SiteContext'
import { FOOTER_LINKS, IMAGE_IDS, UNSPLASH } from '../data/constants'
import { phoneHref } from '../utils/format'
import './NotFound.css'

const HERO_IMAGE = UNSPLASH(IMAGE_IDS.hero[2], 1600)

export default function NotFound() {
  const { settings, stats } = useSite()

  useSeo({
    title: 'Page Not Found (404)',
    description:
      'This page does not exist on ramakripaestate.com. Browse property in Faridabad instead — flats, plots, shops and offices across Greater Faridabad, Old Faridabad and Ballabgarh.',
    image: HERO_IMAGE
  })

  const phones = Array.isArray(settings.phones) && settings.phones.length ? settings.phones : ['+91 98110 00000']
  const primaryPhone = phones[0]
  const count = Number(stats?.total) > 0 ? Number(stats.total) : 250

  return (
    <div className="rk-404">
      <PageHero
        eyebrow="Wrong turn"
        title="Page Not Found"
        subtitle="The link you followed has moved, expired or never existed. Everything else on the site is exactly where you left it."
        image={HERO_IMAGE}
        breadcrumb={[{ label: 'Page Not Found' }]}
      />

      <Section tone="cream" size="lg" className="rk-404__main" ariaLabel="Page not found">
        <div className="rk-404__inner">
          <p className="rk-404__code" aria-hidden="true">
            404
          </p>

          <h2 className="rk-404__headline">
            This address doesn&rsquo;t exist &mdash; but {count}+ others do.
          </h2>

          <p className="rk-404__text">
            Perhaps a listing was sold and taken down, or the URL was mistyped. Head back to the home page, or go straight to
            everything we currently have on the books in Faridabad.
          </p>

          <div className="rk-404__actions">
            <Link className="rk-btn rk-btn--gold rk-btn--lg" to="/">
              <MdHome className="rk-btn__icon" aria-hidden="true" />
              Back to Home
            </Link>
            <Link className="rk-btn rk-btn--outline rk-btn--lg" to="/properties">
              Browse All Properties
              <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
            </Link>
          </div>

          <div className="rk-404__localities">
            <h3 className="rk-404__localitiesTitle">
              <MdLocationCity aria-hidden="true" />
              Popular localities
            </h3>
            <ul className="rk-404__localityList">
              {FOOTER_LINKS.localities.map((item) => (
                <li key={item.to}>
                  <Link className="rk-chip" to={item.to}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="rk-404__help">
            Looking for something specific? Call{' '}
            <a className="rk-404__phone" href={phoneHref(primaryPhone)}>
              <MdCall aria-hidden="true" />
              {primaryPhone}
            </a>{' '}
            or <Link to="/enquiry">send us a two-line enquiry</Link> and we will find it for you.
          </p>
        </div>
      </Section>
    </div>
  )
}
