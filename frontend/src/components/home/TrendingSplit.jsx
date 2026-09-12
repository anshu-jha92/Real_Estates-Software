import { Link } from 'react-router-dom'
import { MdCheckCircle, MdTrendingUp, MdArrowForward } from 'react-icons/md'
import Section from '../ui/Section'
import Reveal from '../ui/Reveal'
import PropertyCard from '../property/PropertyCard'
import PropertyCardSkeleton from '../property/PropertyCardSkeleton'
import EmptyState from '../ui/EmptyState'
import useFetch from '../../hooks/useFetch'
import { api } from '../../api/client'
import './TrendingSplit.css'

const CHECKLIST = [
  'Sectors 75 to 89 tracked weekly — launch prices, resale rates and actual registry values.',
  'Site visits arranged the same week, including transport from your doorstep.',
  'Possession-ready towers and under-construction stock compared side by side.'
]

/**
 * Home §10 — sticky pitch on the left, three trending Faridabad listings on
 * the right. Falls back to an EmptyState (never a blank column) if the API is
 * unreachable or nothing is flagged as trending.
 */
export default function TrendingSplit() {
  const { data, loading, error } = useFetch(
    (signal) => api.properties({ trending: true, limit: 3 }, { signal }),
    []
  )

  const properties = Array.isArray(data?.data) ? data.data : []

  return (
    <Section tone="white" className="rk-trend" ariaLabel="Trending properties in Greater Faridabad">
      <div className="rk-trend__grid">
        <div className="rk-trend__left">
          <div className="rk-trend__sticky">
            <span className="rk-eyebrow">Most Enquired This Month</span>

            <h2 className="rk-trend__title">
              Trending in <em>Greater Faridabad</em>
            </h2>

            <p className="rk-trend__text">
              Neharpar is where the city is actually moving. New group-housing towers along the
              Bypass Road, the FMDA sector roads and the Sector 88 retail belt have pushed enquiry
              volumes past every other pocket of Faridabad this quarter. These are the projects our
              buyers are asking about right now.
            </p>

            <ul className="rk-trend__list">
              {CHECKLIST.map((point) => (
                <li className="rk-trend__listItem" key={point}>
                  <MdCheckCircle className="rk-trend__tick" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="rk-trend__actions">
              <Link className="rk-btn rk-btn--gold" to="/properties?trending=true">
                <MdTrendingUp className="rk-btn__icon" aria-hidden="true" />
                Browse Trending
              </Link>
              <Link className="rk-btn rk-btn--outline" to="/contact">
                Talk to an Expert
                <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="rk-trend__right">
          {loading && (
            <div className="rk-trend__cards" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <PropertyCardSkeleton key={i} variant="wide" />
              ))}
            </div>
          )}

          {!loading && properties.length > 0 && (
            <div className="rk-trend__cards">
              {properties.map((property, index) => (
                <Reveal key={property._id || property.slug || index} delay={index * 90}>
                  <PropertyCard property={property} variant="wide" />
                </Reveal>
              ))}
            </div>
          )}

          {!loading && properties.length === 0 && (
            <EmptyState
              icon={MdTrendingUp}
              tone={error ? 'error' : 'default'}
              title={error ? 'Trending list unavailable' : 'No trending projects listed yet'}
              message={
                error
                  ? 'We could not load the trending projects just now. Our full Faridabad portfolio is still one click away.'
                  : 'Our advisors are updating this week’s Neharpar shortlist. Browse the full portfolio in the meantime.'
              }
              action={
                <Link className="rk-btn rk-btn--outline" to="/properties">
                  View All Properties
                </Link>
              }
            />
          )}
        </div>
      </div>
    </Section>
  )
}
