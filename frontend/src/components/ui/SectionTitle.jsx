import './SectionTitle.css'

/**
 * Eyebrow + display heading + optional subtitle, with the gold rule.
 *
 * @param {{ eyebrow?: string, title: React.ReactNode, subtitle?: React.ReactNode,
 *           align?: 'left'|'center', light?: boolean, as?: React.ElementType,
 *           id?: string, className?: string, children?: React.ReactNode }} props
 */
export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  light = false,
  as: Heading = 'h2',
  id,
  className = '',
  children
}) {
  const classes = [
    'rk-sectiontitle',
    `rk-sectiontitle--${align}`,
    light ? 'rk-sectiontitle--light' : '',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      {eyebrow && (
        <span className={`rk-eyebrow ${light ? 'rk-eyebrow--light' : ''}`.trim()}>{eyebrow}</span>
      )}

      <Heading id={id} className="rk-sectiontitle__title">
        {title}
      </Heading>

      <span className="rk-sectiontitle__rule" aria-hidden="true" />

      {subtitle && <p className="rk-sectiontitle__subtitle">{subtitle}</p>}

      {children}
    </div>
  )
}
