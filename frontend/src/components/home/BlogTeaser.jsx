import { Link } from 'react-router-dom'
import { MdArrowForward, MdCalendarToday, MdSchedule } from 'react-icons/md'
import Section from '../ui/Section'
import SectionTitle from '../ui/SectionTitle'
import Reveal from '../ui/Reveal'
import useFetch from '../../hooks/useFetch'
import { api } from '../../api/client'
import { IMAGE_IDS, UNSPLASH, onImageError } from '../../data/constants'
import { formatDate, truncate, imageUrl } from '../../utils/format'
import './BlogTeaser.css'

const COVER_FALLBACKS = [IMAGE_IDS.residential[2], IMAGE_IDS.plots[0], IMAGE_IDS.commercial[1]]

/** Minutes to read, from the post's own field or a 200-wpm estimate. */
function readTime(post) {
  if (Number(post.readTime) > 0) return `${Math.round(Number(post.readTime))} min read`
  const words = String(post.content || post.body || post.excerpt || '')
    .split(/\s+/)
    .filter(Boolean).length
  return `${Math.max(2, Math.ceil(words / 200))} min read`
}

/**
 * Home §13 — the three latest Faridabad guides. Renders nothing at all when
 * the blog API is empty or unreachable, so the home page never shows a
 * half-built section.
 */
export default function BlogTeaser() {
  const { data, loading } = useFetch((signal) => api.blogs({ limit: 3 }, { signal }), [])

  const posts = (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []).slice(0, 3)

  if (loading || !posts.length) return null

  return (
    <Section tone="cream" className="rk-blogt" ariaLabel="Insights and guides">
      <div className="rk-blogt__head">
        <SectionTitle
          eyebrow="From Our Desk"
          title="Insights & Guides"
          subtitle="Circle rates, RERA checks, stamp duty in Haryana and which Faridabad sector is actually worth your money — written by the people who do the paperwork."
        />
        <Link className="rk-btn rk-btn--outline rk-blogt__all" to="/blog">
          View All Insights
          <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
        </Link>
      </div>

      <ul className="rk-blogt__grid">
        {posts.map((post, index) => {
          const to = post.slug ? `/blog/${post.slug}` : '/blog'
          const cover =
            post.image || post.cover || post.thumbnail || UNSPLASH(COVER_FALLBACKS[index % 3], 900)
          const date = formatDate(post.publishedAt || post.createdAt || post.date)

          return (
            <Reveal as="li" key={post._id || post.slug || index} delay={index * 90} className="rk-blogt__item">
              <article className="rk-blogt__card">
                <Link className="rk-blogt__media" to={to} tabIndex={-1} aria-hidden="true">
                  <img
                    className="rk-blogt__img"
                    src={imageUrl(cover, 600)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={onImageError}
                  />
                </Link>

                <div className="rk-blogt__body">
                  <p className="rk-blogt__meta">
                    {date && (
                      <span>
                        <MdCalendarToday aria-hidden="true" />
                        {date}
                      </span>
                    )}
                    <span>
                      <MdSchedule aria-hidden="true" />
                      {readTime(post)}
                    </span>
                  </p>

                  <h3 className="rk-blogt__title">
                    <Link to={to}>{post.title}</Link>
                  </h3>

                  <p className="rk-blogt__excerpt">
                    {truncate(post.excerpt || post.shortDescription || post.content || '', 140)}
                  </p>

                  <Link
                    className="rk-blogt__more rk-link-gold"
                    to={to}
                    aria-label={`Read more: ${post.title}`}
                  >
                    Read More
                    <MdArrowForward aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Reveal>
          )
        })}
      </ul>
    </Section>
  )
}
