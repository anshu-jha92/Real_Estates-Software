/**
 * Rama Kripa Estates badge — the client's own artwork, cropped to the ring with a
 * transparent surround so the same file works on the cream pages and the dark
 * green bands. Decorative: every caller pairs it with the name in text.
 *
 * @param {{ size?: number, className?: string }} props
 */
export default function LogoMark({ size = 44, className = '' }) {
  return (
    <img
      className={`rk-logomark ${className}`.trim()}
      src="/rke-logo.png"
      width={size}
      height={size}
      alt=""
      decoding="async"
    />
  )
}
