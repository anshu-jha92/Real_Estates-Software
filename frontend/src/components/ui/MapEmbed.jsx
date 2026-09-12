import { MdDirections } from 'react-icons/md'
import './MapEmbed.css'

const DEFAULT_QUERY = 'Sector 88, Greater Faridabad, Haryana 121002'

/** Google Maps iframe URL — no API key needed (BUILD_SPEC §11). */
export function buildMapSrc({ query, lat, lng }) {
  const hasCoords = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && (lat || lng)
  if (hasCoords) return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`
  return `https://www.google.com/maps?q=${encodeURIComponent(query || DEFAULT_QUERY)}&output=embed`
}

export function buildDirectionsUrl({ query, lat, lng }) {
  const hasCoords = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && (lat || lng)
  const destination = hasCoords ? `${lat},${lng}` : query || DEFAULT_QUERY
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

/**
 * Rounded, shadowed Google Maps frame.
 *
 * @param {{ query?: string, lat?: number, lng?: number, title: string,
 *           height?: number|string, src?: string, showDirections?: boolean,
 *           className?: string }} props
 */
export default function MapEmbed({
  query,
  lat,
  lng,
  title,
  height = 420,
  src,
  showDirections = true,
  className = ''
}) {
  const mapSrc = src || buildMapSrc({ query, lat, lng })
  const directions = buildDirectionsUrl({ query, lat, lng })
  const frameTitle = title || `Map of ${query || DEFAULT_QUERY}`

  return (
    <div className={`rk-map ${className}`.trim()}>
      <div
        className="rk-map__frame"
        style={{ '--rk-map-h': typeof height === 'number' ? `${height}px` : height }}
      >
        <iframe
          src={mapSrc}
          title={frameTitle}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      {showDirections && (
        <a
          className="rk-map__directions rk-link-gold"
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MdDirections aria-hidden="true" />
          Get Directions
          <span className="sr-only"> (opens Google Maps in a new tab)</span>
        </a>
      )}
    </div>
  )
}
