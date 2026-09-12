import { Link } from 'react-router-dom'
import { MdArrowForward } from 'react-icons/md'
import Section from '../ui/Section'
import SectionTitle from '../ui/SectionTitle'
import Marquee from '../ui/Marquee'
import useFetch from '../../hooks/useFetch'
import { api } from '../../api/client'
import { onImageError } from '../../data/constants'
import './DeveloperMarquee.css'

/** Builders we actually transact with in Faridabad (BUILD_SPEC §3 seed list). */
const FALLBACK_DEVELOPERS = [
  'BPTP',
  'Omaxe',
  'Adore',
  'Puri Constructions',
  'RPS Group',
  'Emerald',
  'Amolik',
  'SRS',
  'Ansal',
  'Signature Global',
  'Navraj',
  'Piyush Group'
].map((name) => ({ name }))

/**
 * Home §11 — "Our Association". Seamless CSS marquee of developer tie-ups.
 * Pauses on hover/focus; `prefers-reduced-motion` turns it into a static grid.
 *
 * The pills are plain text/logos rather than links: Marquee duplicates the
 * track and hides the copy from assistive tech, and focusable content inside
 * an aria-hidden subtree is a keyboard trap. The single link below covers the
 * "show me their projects" intent instead.
 */
export default function DeveloperMarquee() {
  const { data } = useFetch((signal) => api.developers({ signal }), [])

  const live = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  const developers = (live.length ? live : FALLBACK_DEVELOPERS).filter((d) => d && d.name)

  if (!developers.length) return null

  return (
    <Section tone="cream" size="sm" className="rk-devs" ariaLabel="Our developer associations">
      <SectionTitle
        eyebrow="Our Association"
        title="Developers we work with in Faridabad"
        subtitle="Channel-partner tie-ups with the builders shaping Neharpar, the Bypass Road belt and the old sectors — so you get allotments at launch price, not a resale premium."
        align="center"
      />

      <Marquee
        className="rk-devs__marquee"
        speed={42}
        gap={40}
        ariaLabel="Developer partners of Rama Kripa Estates"
      >
        {developers.map((dev) => (
          <span className="rk-devs__pill" key={dev._id || dev.name}>
            {dev.logo ? (
              <img
                className="rk-devs__logo"
                src={dev.logo}
                alt={`${dev.name} logo`}
                loading="lazy"
                decoding="async"
                onError={onImageError}
              />
            ) : (
              <span className="rk-devs__name">{dev.name}</span>
            )}
          </span>
        ))}
      </Marquee>

      <p className="rk-devs__foot">
        <Link className="rk-link-gold" to="/properties">
          Browse projects by developer
          <MdArrowForward aria-hidden="true" />
        </Link>
      </p>
    </Section>
  )
}
