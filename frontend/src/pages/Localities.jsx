import { Link } from 'react-router-dom'
import { MdArrowForward, MdLocationCity, MdTrendingUp, MdMap, MdSearchOff } from 'react-icons/md'
import PageHero from '../components/layout/PageHero'
import Section from '../components/ui/Section'
import SectionTitle from '../components/ui/SectionTitle'
import Reveal from '../components/ui/Reveal'
import EmptyState from '../components/ui/EmptyState'
import MapEmbed from '../components/ui/MapEmbed'
import useSeo from '../hooks/useSeo'
import useFetch from '../hooks/useFetch'
import { api } from '../api/client'
import { useSite, MAP_EMBED_URL } from '../context/SiteContext'
import { FARIDABAD_LOCALITIES, IMAGE_IDS, UNSPLASH, onImageError } from '../data/constants'
import { formatPrice } from '../utils/format'
import './Localities.css'

const HERO_IMAGE = UNSPLASH(IMAGE_IDS.hero[3], 1600)

const FALLBACK_IMAGES = [
  ...IMAGE_IDS.residential.slice(0, 5),
  ...IMAGE_IDS.commercial.slice(0, 2),
  IMAGE_IDS.hero[3]
]

/**
 * Indicative rates we quote when a locality record carries no price note —
 * ballpark asking rates for Faridabad, kept deliberately as ranges.
 */
const PRICE_NOTES = {
  'greater-faridabad': 'Apartments around ₹5,200 - ₹7,400 per sq. ft.',
  'sector-88-89': 'SCO plots around ₹1.6 - ₹2.4 Lac per sq. yd.',
  'sector-75-80': 'Apartments around ₹5,800 - ₹8,200 per sq. ft.',
  'old-faridabad': 'Builder floors around ₹4,600 - ₹6,500 per sq. ft.',
  ballabgarh: 'Floors and plots around ₹3,400 - ₹4,800 per sq. ft.',
  'sohna-road': 'Plotted land around ₹55,000 - ₹95,000 per sq. yd.',
  surajkund: 'Premium homes around ₹8,500 - ₹13,000 per sq. ft.',
  'bypass-road': 'Plots and shops around ₹70,000 - ₹1.3 Lac per sq. yd.'
}

/** Normalise an API locality (or a seeded constant) into what the card needs. */
function toCard(item, index) {
  const name = item.name || item.locality || 'Faridabad'
  const slug = item.slug || ''
  const priceLine =
    item.priceNote ||
    PRICE_NOTES[slug] ||
    (Number(item.priceFrom) > 0 ? `Starting around ${formatPrice(item.priceFrom)}` : 'Rates on request — ask us for this month')

  return {
    key: item._id || slug || name,
    name,
    query: item.query || name,
    count: Number(item.count) > 0 ? Number(item.count) : 0,
    description:
      item.description ||
      item.blurb ||
      `Flats, floors and plots available in ${name}, Faridabad. Ask us for the current asking rates and inventory.`,
    priceLine,
    image: item.image || UNSPLASH(FALLBACK_IMAGES[index % FALLBACK_IMAGES.length], 900)
  }
}

/** Placeholder cards while the API answers, so the grid never collapses. */
function LocalitySkeletons() {
  return (
    <ul className="rk-localities__grid" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <li className="rk-localities__item" key={i}>
          <div className="rk-card rk-localities__card">
            <div className="rk-skeleton rk-localities__media" />
            <div className="rk-localities__body">
              <div className="rk-skeleton rk-skeleton--title" style={{ width: '65%' }} />
              <div className="rk-skeleton rk-skeleton--text" />
              <div className="rk-skeleton rk-skeleton--text" style={{ width: '80%' }} />
              <div className="rk-skeleton rk-skeleton--text" style={{ width: '45%' }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Localities() {
  const { settings } = useSite()
  const { data, loading, error, refetch } = useFetch((signal) => api.localities(undefined, { signal }), [])

  useSeo({
    title: 'Faridabad Localities — Sector-by-Sector Property Guide',
    description:
      'Compare Faridabad micro-markets before you buy: Greater Faridabad (Neharpar), Sector 88 and 89, Sectors 75 to 80, Old Faridabad, Ballabgarh, Sohna Road, Surajkund and the Bypass Road — with indicative rates and live listings.',
    keywords:
      'Faridabad localities, Neharpar property rates, Sector 88 Faridabad, Old Faridabad property, Ballabgarh flats, Sohna Road plots',
    image: HERO_IMAGE
  })

  const live = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  // Never show an empty page: fall back to the seeded locality set.
  const source = live.length ? live : FARIDABAD_LOCALITIES
  const cards = source.map(toCard)

  const address = settings.address || 'SCO 12, Sector 88, Greater Faridabad, Haryana 121002'
  const mapSrc = settings.mapEmbedUrl || MAP_EMBED_URL

  return (
    <div className="rk-localities">
      <PageHero
        eyebrow="Know the ground first"
        title="Faridabad Localities"
        subtitle="Faridabad is not one market. A flat in Sector 86 and a kothi in Sector 15 answer to completely different buyers, rates and timelines."
        image={HERO_IMAGE}
        breadcrumb={[{ label: 'Localities' }]}
      />

      <Section tone="cream" size="md" className="rk-localities__main" ariaLabel="Faridabad micro-markets">
        <div className="rk-localities__intro">
          <SectionTitle
            eyebrow="Micro-markets"
            title="Where to buy in Faridabad, and why"
            as="h2"
            subtitle="A quick read on each pocket before you shortlist anything."
          />

          <div className="rk-localities__introCopy">
            <p>
              The city splits neatly along the Bypass Road. To its east lies Neharpar &mdash; Greater Faridabad &mdash; where
              Sectors 75 to 89 were laid out under the FMDA plan with wide sectoral roads, licensed group housing and the
              largest supply of new 2 and 3 BHK stock in the district. Prices here still track construction progress more than
              location, which is exactly why the sector you pick matters.
            </p>
            <p>
              West of the bypass sit the older, settled sectors: 14, 15, 16, 21C, Old Faridabad and NIT, plus Ballabgarh further
              south. These give you freehold plots, independent floors, walkable markets and Violet Line metro access &mdash;
              steadier rental demand, slower capital appreciation. Between them, the Sector 88 and 89 SCO frontage and the
              Sohna Road corridor carry most of the city&rsquo;s commercial and plotted-land activity.
            </p>
          </div>
        </div>

        {loading && <LocalitySkeletons />}

        {!loading && !cards.length && (
          <EmptyState
            icon={MdSearchOff}
            tone={error ? 'error' : 'default'}
            title={error ? 'We could not load the locality guide' : 'No localities to show yet'}
            message={
              error
                ? 'The listing service did not respond. Try again in a moment, or call us on +91 98110 00000 and we will talk you through the sectors.'
                : 'Locality pages are being updated. In the meantime, browse everything we have across Faridabad.'
            }
            action={
              error ? (
                <button type="button" className="rk-btn rk-btn--outline" onClick={refetch}>
                  Try again
                </button>
              ) : (
                <Link className="rk-btn rk-btn--gold" to="/properties">
                  Browse all properties
                  <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
                </Link>
              )
            }
          />
        )}

        {!loading && cards.length > 0 && (
          <ul className="rk-localities__grid">
            {cards.map((card, index) => {
              const to = `/properties?locality=${encodeURIComponent(card.query)}`
              return (
                <Reveal as="li" key={card.key} delay={(index % 3) * 90} className="rk-localities__item">
                  <article className="rk-card rk-card--hover rk-localities__card">
                    <Link className="rk-localities__media rk-card__media" to={to} tabIndex={-1} aria-hidden="true">
                      <img
                        src={card.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={onImageError}
                      />
                      <span className="rk-localities__count">
                        <MdLocationCity aria-hidden="true" />
                        {card.count > 0
                          ? `${card.count} ${card.count === 1 ? 'Property' : 'Properties'}`
                          : 'Ask for inventory'}
                      </span>
                    </Link>

                    <div className="rk-localities__body">
                      <h3 className="rk-localities__name">
                        <Link to={to}>{card.name}</Link>
                      </h3>

                      <p className="rk-localities__desc">{card.description}</p>

                      <p className="rk-localities__price">
                        <MdTrendingUp aria-hidden="true" />
                        <span>{card.priceLine}</span>
                      </p>

                      <Link className="rk-localities__cta rk-link-gold" to={to}>
                        View Properties
                        <MdArrowForward aria-hidden="true" />
                        <span className="sr-only"> in {card.name}</span>
                      </Link>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </ul>
        )}
      </Section>

      <Section tone="white" size="md" className="rk-localities__mapSection" ariaLabel="Faridabad on the map">
        <div className="rk-localities__mapHead">
          <SectionTitle
            eyebrow="On the map"
            title="Faridabad, end to end"
            as="h2"
            subtitle="Our office sits at SCO 12, Sector 88 — central to Neharpar and ten minutes from the Bypass Road."
          />
          <Link className="rk-btn rk-btn--outline rk-localities__mapCta" to="/contact">
            <MdMap className="rk-btn__icon" aria-hidden="true" />
            Visit the Office
          </Link>
        </div>

        <MapEmbed
          className="rk-localities__map"
          src={mapSrc}
          query={address}
          title="Map of Faridabad, Haryana — Rama Kripa Estates service area"
          height={440}
        />
      </Section>
    </div>
  )
}
