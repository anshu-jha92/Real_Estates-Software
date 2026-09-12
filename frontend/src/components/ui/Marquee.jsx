import { Children } from 'react'
import './Marquee.css'

/**
 * Infinite CSS marquee. The children are rendered twice and the track is
 * translated by -50%, so the loop is seamless. Pauses on hover/focus and stops
 * entirely under `prefers-reduced-motion` (the CSS turns it into a scroller).
 *
 * @param {{ children: React.ReactNode, speed?: number, reverse?: boolean,
 *           gap?: number, pauseOnHover?: boolean, ariaLabel?: string,
 *           className?: string }} props
 */
export default function Marquee({
  children,
  speed = 34,
  reverse = false,
  gap = 56,
  pauseOnHover = true,
  ariaLabel = 'Scrolling logo strip',
  className = ''
}) {
  const items = Children.toArray(children)

  return (
    <div
      className={`rk-marquee ${pauseOnHover ? 'rk-marquee--pausable' : ''} ${className}`.trim()}
      style={{ '--rk-marquee-speed': `${speed}s`, '--rk-marquee-gap': `${gap}px` }}
      role="group"
      aria-label={ariaLabel}
    >
      <div className={`rk-marquee__track ${reverse ? 'rk-marquee__track--reverse' : ''}`.trim()}>
        <div className="rk-marquee__group">{items}</div>
        <div className="rk-marquee__group" aria-hidden="true">
          {items}
        </div>
      </div>
    </div>
  )
}
