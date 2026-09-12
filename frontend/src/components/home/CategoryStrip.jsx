import { Link } from 'react-router-dom'
import { useSite } from '../../context/SiteContext'
import { CATEGORIES } from '../../data/constants'
import { formatNumber } from '../../utils/format'
import './CategoryStrip.css'

/** Category key -> the field name it carries in `/api/meta/stats`. */
const STAT_FIELD = {
  residential: 'residential',
  commercial: 'commercial',
  plots: 'plots',
  rent: 'rent',
  'office-space': 'officeSpace'
}

/**
 * The five category cards that ride over the bottom edge of the hero, each
 * showing its live listing count.
 */
export default function CategoryStrip() {
  const { stats, loading } = useSite()

  return (
    <section className="rk-catstrip" id="explore" aria-label="Browse property categories">
      <div className="rk-container">
        <ul className="rk-catstrip__list">
          {CATEGORIES.map(({ key, label, slug, icon: Icon }) => {
            const count = Number(stats?.[STAT_FIELD[key]]) || 0

            return (
              <li key={key} className="rk-catstrip__item">
                <Link to={slug} className="rk-catstrip__card">
                  <span className="rk-catstrip__icon" aria-hidden="true">
                    <Icon />
                  </span>

                  <span className="rk-catstrip__label">{label}</span>

                  {loading ? (
                    <span className="rk-skeleton rk-catstrip__count-skeleton" aria-hidden="true" />
                  ) : (
                    <span className="rk-catstrip__count">
                      {count > 0
                        ? `${formatNumber(count)} ${count === 1 ? 'Property' : 'Properties'}`
                        : 'View listings'}
                    </span>
                  )}

                  <span className="rk-catstrip__rule" aria-hidden="true" />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
