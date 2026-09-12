import { Link } from 'react-router-dom'
import { MdArrowOutward, MdLocationCity } from 'react-icons/md'
import Section from '../ui/Section'
import SectionTitle from '../ui/SectionTitle'
import Reveal from '../ui/Reveal'
import useFetch from '../../hooks/useFetch'
import { api } from '../../api/client'
import { FARIDABAD_LOCALITIES, IMAGE_IDS, UNSPLASH, onImageError } from '../../data/constants'
import './LocalityShowcase.css'
import { imageUrl } from '../../utils/format'

/** Images cycle through the approved ids when the API sends a locality without one. */
const FALLBACK_IMAGES = [
  ...IMAGE_IDS.residential.slice(0, 5),
  ...IMAGE_IDS.commercial.slice(0, 2),
  IMAGE_IDS.hero[3]
]

/** Normalise an API locality (or a constant) into what the tile needs. */
function toTile(item, index) {
  const name = item.name || item.locality || 'Faridabad'
  return {
    key: item.slug || item._id || name,
    name,
    query: item.query || item.name || name,
    count: Number(item.count) > 0 ? Number(item.count) : 0,
    blurb: item.blurb || item.description || '',
    image: item.image || UNSPLASH(FALLBACK_IMAGES[index % FALLBACK_IMAGES.length], 900)
  }
}

/**
 * Home §9 — mosaic of Faridabad localities. Uses live localities when the API
 * is up and the seeded constants otherwise, so the section is never empty.
 */
export default function LocalityShowcase() {
  const { data } = useFetch((signal) => api.localities(undefined, { signal }), [])

  const live = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  const source = live.length ? live : FARIDABAD_LOCALITIES
  // Capped at 8 so the desktop mosaic always tiles without a hole.
  const tiles = source.slice(0, 8).map(toTile)

  return (
    <Section tone="cream" className="rk-loc" ariaLabel="Explore Faridabad by location">
      <div className="rk-loc__head">
        <SectionTitle
          eyebrow="Neighbourhoods"
          title="Explore Faridabad by Location"
          subtitle="From the planned sectors of Neharpar to the old kothi lanes of Sector 15 — pick a pocket and see what is available there right now."
        />
        <Link className="rk-btn rk-btn--outline rk-loc__all" to="/localities">
          All Localities
          <MdArrowOutward className="rk-btn__icon" aria-hidden="true" />
        </Link>
      </div>

      <Reveal>
        <ul className="rk-loc__grid">
          {tiles.map((tile) => (
            <li className="rk-loc__item" key={tile.key}>
              <Link
                className="rk-loc__card"
                to={`/properties?locality=${encodeURIComponent(tile.query)}`}
              >
                <img
                  className="rk-loc__img"
                  src={imageUrl(tile.image, 800)}
                  alt={`Property in ${tile.name}, Faridabad`}
                  loading="lazy"
                  decoding="async"
                  onError={onImageError}
                />
                <span className="rk-loc__scrim" aria-hidden="true" />

                <span className="rk-loc__body">
                  <span className="rk-loc__name">{tile.name}</span>
                  <span className="rk-loc__meta">
                    <MdLocationCity aria-hidden="true" />
                    {tile.count > 0
                      ? `${tile.count} ${tile.count === 1 ? 'Property' : 'Properties'}`
                      : 'View listings'}
                  </span>
                  {tile.blurb && <span className="rk-loc__blurb">{tile.blurb}</span>}
                </span>

                <span className="rk-loc__arrow" aria-hidden="true">
                  <MdArrowOutward />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
