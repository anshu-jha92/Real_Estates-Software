import './Section.css'

/**
 * Page section wrapper: handles vertical rhythm, background tone and the
 * centred container. Anything that needs a full-bleed background should pass
 * `contained={false}` and build its own container inside.
 *
 * @param {{ children: React.ReactNode, id?: string, tone?: 'cream'|'surface'|'white'|'dark'|'none',
 *           size?: 'sm'|'md'|'lg', contained?: boolean, as?: React.ElementType,
 *           className?: string, ariaLabel?: string }} props
 */
export default function Section({
  children,
  id,
  tone = 'none',
  size = 'md',
  contained = true,
  as: Tag = 'section',
  className = '',
  ariaLabel,
  ...rest
}) {
  const classes = [
    'rk-section',
    `rk-section--${size}`,
    tone !== 'none' ? `rk-section--${tone}` : '',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag id={id} className={classes} aria-label={ariaLabel} {...rest}>
      {contained ? <div className="rk-container">{children}</div> : children}
    </Tag>
  )
}
