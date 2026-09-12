import useReveal from '../../hooks/useReveal'
import './Reveal.css'

/**
 * Wraps children in a scroll-triggered fade/slide. `delay` is in milliseconds
 * and feeds the `--rk-delay` custom property, so a grid can stagger by index.
 *
 * @param {{ children: React.ReactNode, delay?: number, as?: React.ElementType,
 *           variant?: 'up'|'left'|'right'|'zoom', className?: string, style?: object }} props
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  variant = 'up',
  className = '',
  style,
  ...rest
}) {
  const ref = useReveal()

  const classes = [
    'rk-reveal',
    variant !== 'up' ? `rk-reveal--${variant}` : '',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag ref={ref} className={classes} style={{ '--rk-delay': `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  )
}
