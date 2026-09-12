import Section from '../ui/Section'
import SectionTitle from '../ui/SectionTitle'
import PropertyGrid from './PropertyGrid'
import './SimilarProperties.css'

/**
 * "You may also like" block at the bottom of PropertyDetail.
 * Renders nothing when the API returned no similar properties.
 *
 * @param {{ properties?: object[], similar?: object[], loading?: boolean,
 *           title?: string, eyebrow?: string, subtitle?: React.ReactNode,
 *           variant?: 'grid'|'wide'|'compact', tone?: 'cream'|'surface'|'white'|'none',
 *           count?: number, id?: string, className?: string }} props
 */
export default function SimilarProperties({
  properties,
  similar,
  loading = false,
  title = 'Similar properties in Faridabad',
  eyebrow = 'You may also like',
  subtitle = 'Hand-picked from the same locality and budget band, so you can compare before you decide.',
  variant = 'grid',
  tone = 'cream',
  count = 3,
  id = 'similar-properties',
  className = ''
}) {
  const list = Array.isArray(properties) && properties.length
    ? properties
    : Array.isArray(similar)
      ? similar
      : []

  if (!loading && !list.length) return null

  return (
    <Section id={id} tone={tone} className={`rk-similar ${className}`.trim()}>
      <SectionTitle eyebrow={eyebrow} title={title} subtitle={subtitle} align="left" />

      <PropertyGrid
        properties={list}
        loading={loading}
        count={count}
        variant={variant}
        className="rk-similar__grid"
      />
    </Section>
  )
}
