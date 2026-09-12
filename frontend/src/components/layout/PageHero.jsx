import Breadcrumb from './Breadcrumb'
import { IMAGE_FALLBACK, IMAGE_IDS, UNSPLASH, onImageError } from '../../data/constants'
import './PageHero.css'

const DEFAULT_IMAGE = UNSPLASH(IMAGE_IDS.hero[2], 1600)

/**
 * Inner-page banner: ~300px image band under a deep-green gradient with a
 * slow Ken-Burns drift, the display-serif page title and the breadcrumb.
 *
 * @param {{ title: string, subtitle?: string, image?: string,
 *           breadcrumb?: Array<{ label: string, to?: string }>|React.ReactNode,
 *           eyebrow?: string, alt?: string }} props
 */
export default function PageHero({
  title,
  subtitle,
  image = DEFAULT_IMAGE,
  breadcrumb,
  eyebrow,
  alt = ''
}) {
  return (
    <section className="rk-pagehero" aria-labelledby="rk-pagehero-title">
      <div className="rk-pagehero__media" aria-hidden={alt ? undefined : 'true'}>
        <img
          className="rk-pagehero__img"
          src={image || IMAGE_FALLBACK}
          alt={alt}
          loading="eager"
          decoding="async"
          onError={onImageError}
        />
      </div>

      <div className="rk-pagehero__overlay" aria-hidden="true" />

      <div className="rk-container rk-pagehero__inner">
        {eyebrow && <p className="rk-eyebrow rk-eyebrow--light">{eyebrow}</p>}

        <h1 className="rk-pagehero__title" id="rk-pagehero-title">
          {title}
        </h1>

        {subtitle && <p className="rk-pagehero__subtitle">{subtitle}</p>}

        {Array.isArray(breadcrumb) ? (
          <Breadcrumb items={breadcrumb} variant="light" className="rk-pagehero__crumbs" />
        ) : (
          breadcrumb || null
        )}
      </div>
    </section>
  )
}
