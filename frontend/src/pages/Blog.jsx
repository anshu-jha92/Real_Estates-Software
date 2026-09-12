import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MdArrowForward, MdCalendarToday, MdSchedule, MdPerson, MdDescription } from 'react-icons/md'
import PageHero from '../components/layout/PageHero'
import Section from '../components/ui/Section'
import SectionTitle from '../components/ui/SectionTitle'
import Reveal from '../components/ui/Reveal'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/property/Pagination'
import useSeo from '../hooks/useSeo'
import useFetch from '../hooks/useFetch'
import { api } from '../api/client'
import { IMAGE_IDS, UNSPLASH, onImageError } from '../data/constants'
import { formatDate, truncate } from '../utils/format'
import './Blog.css'

const HERO_IMAGE = UNSPLASH(IMAGE_IDS.interior[2], 1600)
const PER_PAGE = 9

const COVER_FALLBACKS = [
  IMAGE_IDS.residential[2],
  IMAGE_IDS.plots[0],
  IMAGE_IDS.commercial[1],
  IMAGE_IDS.residential[5],
  IMAGE_IDS.interior[3],
  IMAGE_IDS.hero[3]
]

const coverFor = (post, index) =>
  post.coverImage || post.image || post.thumbnail || UNSPLASH(COVER_FALLBACKS[index % COVER_FALLBACKS.length], 1000)

/** Minutes to read, from the post's own field or a 200-wpm estimate. */
function readTime(post) {
  if (Number(post.readTime) > 0) return `${Math.round(Number(post.readTime))} min read`
  const words = String(post.content || post.excerpt || '')
    .split(/\s+/)
    .filter(Boolean).length
  return `${Math.max(2, Math.ceil(words / 200))} min read`
}

function PostSkeletons({ count = 6 }) {
  return (
    <ul className="rk-blog__grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li className="rk-blog__item" key={i}>
          <div className="rk-card rk-blog__card">
            <div className="rk-skeleton rk-blog__media" />
            <div className="rk-blog__body">
              <div className="rk-skeleton rk-skeleton--text" style={{ width: '40%' }} />
              <div className="rk-skeleton rk-skeleton--title" style={{ width: '85%' }} />
              <div className="rk-skeleton rk-skeleton--text" />
              <div className="rk-skeleton rk-skeleton--text" style={{ width: '70%' }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const listRef = useRef(null)
  const didMount = useRef(false)

  const tag = searchParams.get('tag') || ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  useSeo({
    title: tag ? `${tag} — Faridabad Property Insights` : 'Insights & Guides — Faridabad Property Advice',
    description:
      'Circle rates, HRERA checks, Haryana stamp duty, home-loan paperwork and sector-by-sector reads on Faridabad property — written by the consultants who do the registries.',
    keywords:
      'Faridabad property blog, Haryana stamp duty, HRERA registration, Neharpar investment, Faridabad circle rates',
    image: HERO_IMAGE
  })

  const { data, loading, error, refetch } = useFetch(
    (signal) => api.blogs({ page, limit: PER_PAGE, tag: tag || undefined }, { signal }),
    [page, tag]
  )

  // Move focus and scroll to the list when the reader pages or filters.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
    listRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [page, tag])

  const posts = Array.isArray(data?.data) ? data.data : []
  const tags = Array.isArray(data?.tags) ? data.tags : []
  const pages = Number(data?.pages) || 1
  const total = Number(data?.total) || posts.length

  // The wide "latest" card only makes sense on an unfiltered first page.
  const showFeatured = page === 1 && !tag && posts.length > 1
  const featured = showFeatured ? posts[0] : null
  const rest = showFeatured ? posts.slice(1) : posts

  const setParam = (next) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === 1 || value === '1') params.delete(key)
      else params.set(key, String(value))
    })
    setSearchParams(params, { replace: false })
  }

  return (
    <div className="rk-blog">
      <PageHero
        eyebrow="From our desk"
        title="Insights & Guides"
        subtitle="Everything a Faridabad buyer, seller or tenant keeps asking us — written down properly, with the numbers that apply in Haryana."
        image={HERO_IMAGE}
        breadcrumb={[{ label: 'Insights & Guides' }]}
      />

      <Section tone="cream" size="md" className="rk-blog__main" ariaLabel="Articles">
        <div className="rk-blog__head">
          <SectionTitle
            eyebrow="Reading room"
            title={tag ? `Articles tagged “${tag}”` : 'Faridabad property, explained'}
            as="h2"
            subtitle="No syndicated national copy. Every guide here is about this city, its sectors and its paperwork."
          />

          {tags.length > 0 && (
            <div className="rk-blog__filters" role="group" aria-label="Filter articles by tag">
              <button
                type="button"
                className={`rk-chip ${tag ? '' : 'is-active'}`.trim()}
                aria-pressed={!tag}
                onClick={() => setParam({ tag: '', page: 1 })}
              >
                All articles
              </button>
              {tags.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`rk-chip ${tag === item ? 'is-active' : ''}`.trim()}
                  aria-pressed={tag === item}
                  onClick={() => setParam({ tag: tag === item ? '' : item, page: 1 })}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rk-blog__list" ref={listRef} tabIndex={-1}>
          {loading && <PostSkeletons count={6} />}

          {!loading && featured && (
            <Reveal className="rk-blog__featuredWrap">
              <article className="rk-card rk-card--hover rk-blog__featured">
                <Link
                  className="rk-blog__featuredMedia"
                  to={`/blog/${featured.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <img
                    src={coverFor(featured, 0)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={onImageError}
                  />
                  <span className="rk-badge rk-badge--solid-gold rk-blog__featuredFlag">Latest</span>
                </Link>

                <div className="rk-blog__featuredBody">
                  {featured.category && <p className="rk-eyebrow">{featured.category}</p>}

                  <h3 className="rk-blog__featuredTitle">
                    <Link to={`/blog/${featured.slug}`}>{featured.title}</Link>
                  </h3>

                  <p className="rk-blog__featuredExcerpt">{truncate(featured.excerpt || featured.content || '', 260)}</p>

                  <p className="rk-blog__meta">
                    <span>
                      <MdPerson aria-hidden="true" />
                      {featured.author || 'Rama Kripa Estates'}
                    </span>
                    <span>
                      <MdCalendarToday aria-hidden="true" />
                      {formatDate(featured.publishedAt || featured.createdAt) || 'Recently published'}
                    </span>
                    <span>
                      <MdSchedule aria-hidden="true" />
                      {readTime(featured)}
                    </span>
                  </p>

                  <Link className="rk-btn rk-btn--green rk-blog__featuredCta" to={`/blog/${featured.slug}`}>
                    Read the guide
                    <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Reveal>
          )}

          {!loading && rest.length > 0 && (
            <ul className="rk-blog__grid">
              {rest.map((post, index) => (
                <Reveal as="li" key={post._id || post.slug} delay={(index % 3) * 90} className="rk-blog__item">
                  <article className="rk-card rk-card--hover rk-blog__card">
                    <Link className="rk-blog__media" to={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true">
                      <img
                        src={coverFor(post, index + 1)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={onImageError}
                      />
                    </Link>

                    <div className="rk-blog__body">
                      <p className="rk-blog__meta">
                        <span>
                          <MdCalendarToday aria-hidden="true" />
                          {formatDate(post.publishedAt || post.createdAt) || 'Recently published'}
                        </span>
                        <span>
                          <MdSchedule aria-hidden="true" />
                          {readTime(post)}
                        </span>
                      </p>

                      <h3 className="rk-blog__title">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>

                      <p className="rk-blog__excerpt">{truncate(post.excerpt || post.content || '', 150)}</p>

                      {Array.isArray(post.tags) && post.tags.length > 0 && (
                        <ul className="rk-blog__tags">
                          {post.tags.slice(0, 3).map((item) => (
                            <li className="rk-badge rk-badge--green" key={item}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}

                      <Link className="rk-blog__more rk-link-gold" to={`/blog/${post.slug}`}>
                        Read More
                        <MdArrowForward aria-hidden="true" />
                        <span className="sr-only">: {post.title}</span>
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </ul>
          )}

          {!loading && posts.length === 0 && (
            <EmptyState
              icon={MdDescription}
              tone={error ? 'error' : 'default'}
              title={error ? 'We could not load the articles' : tag ? `Nothing tagged “${tag}” yet` : 'No articles published yet'}
              message={
                error
                  ? 'The server did not respond. Try again in a moment, or call us on +91 98110 00000 and ask your question directly.'
                  : 'New Faridabad guides go up every few weeks. In the meantime, browse the properties we have on the books.'
              }
              action={
                error ? (
                  <button type="button" className="rk-btn rk-btn--outline" onClick={refetch}>
                    Try again
                  </button>
                ) : tag ? (
                  <button type="button" className="rk-btn rk-btn--outline" onClick={() => setParam({ tag: '', page: 1 })}>
                    Show all articles
                  </button>
                ) : (
                  <Link className="rk-btn rk-btn--gold" to="/properties">
                    Browse properties
                    <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
                  </Link>
                )
              }
            />
          )}
        </div>

        {!loading && posts.length > 0 && (
          <>
            <p className="rk-blog__count" aria-live="polite">
              Showing {posts.length} of {total} {total === 1 ? 'article' : 'articles'}
              {tag ? ` tagged “${tag}”` : ''}
            </p>
            <Pagination page={page} pages={pages} onPageChange={(next) => setParam({ page: next })} />
          </>
        )}
      </Section>
    </div>
  )
}
