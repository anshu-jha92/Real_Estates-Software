import { Link, useParams } from 'react-router-dom'
import {
  MdArrowBack,
  MdArrowForward,
  MdCalendarToday,
  MdPerson,
  MdSchedule,
  MdVisibility,
  MdErrorOutline
} from 'react-icons/md'
import Section from '../components/ui/Section'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Reveal from '../components/ui/Reveal'
import Breadcrumb from '../components/layout/Breadcrumb'
import ShareRow from '../components/property/ShareRow'
import useSeo from '../hooks/useSeo'
import useFetch from '../hooks/useFetch'
import { api } from '../api/client'
import { IMAGE_IDS, UNSPLASH, onImageError } from '../data/constants'
import { formatDate, formatNumber, truncate } from '../utils/format'
import './BlogDetail.css'

const COVER_FALLBACKS = [
  IMAGE_IDS.residential[2],
  IMAGE_IDS.plots[0],
  IMAGE_IDS.commercial[1],
  IMAGE_IDS.interior[3]
]

const coverFor = (post, index = 0) =>
  post?.coverImage || post?.image || post?.thumbnail || UNSPLASH(COVER_FALLBACKS[index % COVER_FALLBACKS.length], 1400)

const looksLikeHtml = (text) => /<\/?(p|h[1-6]|ul|ol|li|blockquote|figure|table|strong|em|a)\b/i.test(text)

/**
 * Editors publish through the admin panel, so the content is first-party — but
 * strip the obviously dangerous bits anyway before it reaches innerHTML.
 * ponytail: regex scrub, not a parser. Swap in DOMPurify if untrusted authors
 * ever get publish rights.
 */
function scrubHtml(html) {
  return String(html)
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
}

/** Article body: HTML from the editor, or plain text split on blank lines. */
function ArticleBody({ content }) {
  const text = String(content || '').trim()

  if (!text) {
    return <p className="rk-post__para">This article is being written up. Please check back shortly.</p>
  }

  if (looksLikeHtml(text)) {
    // eslint-disable-next-line react/no-danger
    return <div className="rk-post__html" dangerouslySetInnerHTML={{ __html: scrubHtml(text) }} />
  }

  return (
    <>
      {text
        .split(/\n{2,}/)
        .map((para) => para.trim())
        .filter(Boolean)
        .map((para, index) => (
          <p className="rk-post__para" key={index}>
            {para}
          </p>
        ))}
    </>
  )
}

function readTimeLabel(post) {
  if (Number(post?.readTime) > 0) return `${Math.round(Number(post.readTime))} min read`
  const words = String(post?.content || '')
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return `${Math.max(2, Math.ceil(words / 200))} min read`
}

export default function BlogDetail() {
  const { slug } = useParams()
  const { data, loading, error, refetch } = useFetch((signal) => api.blog(slug, { signal }), [slug])

  const post = data?.data || null
  const related = Array.isArray(data?.related) ? data.related.slice(0, 3) : []

  const plainExcerpt = post
    ? post.excerpt || truncate(String(post.content || '').replace(/<[^>]*>/g, ' '), 180)
    : ''

  useSeo({
    title: post ? post.seo?.metaTitle || post.title : error ? 'Article not found' : 'Loading article',
    description:
      post
        ? post.seo?.metaDescription || plainExcerpt
        : 'Faridabad property guides from Rama Kripa Estates — circle rates, HRERA checks, stamp duty and sector-level advice.',
    keywords: Array.isArray(post?.seo?.keywords) && post.seo.keywords.length ? post.seo.keywords.join(', ') : undefined,
    image: post ? coverFor(post) : UNSPLASH(IMAGE_IDS.interior[2], 1400)
  })

  if (loading) {
    return (
      <Section tone="cream" size="lg" className="rk-post" ariaLabel="Loading article">
        <Loader label="Loading the article…" />
      </Section>
    )
  }

  if (!post) {
    return (
      <Section tone="cream" size="lg" className="rk-post" ariaLabel="Article not found">
        <EmptyState
          icon={MdErrorOutline}
          tone="error"
          title={error?.status === 404 ? 'That article does not exist' : 'We could not load this article'}
          message={
            error?.status === 404
              ? 'The link may be old or mistyped. All our Faridabad property guides are listed on the insights page.'
              : error?.message || 'The server did not respond. Please try again in a moment.'
          }
          action={
            <div className="rk-post__errorActions">
              <Link className="rk-btn rk-btn--gold" to="/blog">
                All Insights &amp; Guides
                <MdArrowForward className="rk-btn__icon" aria-hidden="true" />
              </Link>
              {error?.status !== 404 && (
                <button type="button" className="rk-btn rk-btn--outline" onClick={refetch}>
                  Try again
                </button>
              )}
            </div>
          }
        />
      </Section>
    )
  }

  const published = formatDate(post.publishedAt || post.createdAt)

  return (
    <article className="rk-post">
      <header className="rk-post__hero">
        <div className="rk-container">
          <Breadcrumb
            className="rk-post__crumbs"
            items={[{ label: 'Insights & Guides', to: '/blog' }, { label: post.title }]}
          />

          {post.category && <p className="rk-eyebrow">{post.category}</p>}

          <h1 className="rk-post__title">{post.title}</h1>

          {post.excerpt && <p className="rk-post__standfirst">{post.excerpt}</p>}

          <p className="rk-post__meta">
            <span>
              <MdPerson aria-hidden="true" />
              {post.author || 'Rama Kripa Estates'}
              {post.authorRole ? `, ${post.authorRole}` : ''}
            </span>
            {published && (
              <span>
                <MdCalendarToday aria-hidden="true" />
                <time dateTime={new Date(post.publishedAt || post.createdAt).toISOString()}>{published}</time>
              </span>
            )}
            <span>
              <MdSchedule aria-hidden="true" />
              {readTimeLabel(post)}
            </span>
            {Number(post.views) > 0 && (
              <span>
                <MdVisibility aria-hidden="true" />
                {formatNumber(post.views)} views
              </span>
            )}
          </p>
        </div>
      </header>

      <div className="rk-container rk-post__coverWrap">
        <figure className="rk-post__cover">
          <img
            src={coverFor(post)}
            alt={`Illustration for “${post.title}”`}
            loading="eager"
            decoding="async"
            onError={onImageError}
          />
        </figure>
      </div>

      <Section tone="cream" size="md" className="rk-post__main" ariaLabel="Article">
        <div className="rk-post__prose">
          <ArticleBody content={post.content} />
        </div>

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <ul className="rk-post__tags" aria-label="Article tags">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link className="rk-chip" to={`/blog?tag=${encodeURIComponent(tag)}`}>
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="rk-post__foot">
          <Link className="rk-post__back rk-link-gold" to="/blog">
            <MdArrowBack aria-hidden="true" />
            Back to all insights
          </Link>

          <ShareRow title={post.title} label="Share this article" className="rk-post__share" />
        </div>
      </Section>

      {related.length > 0 && (
        <Section tone="white" size="md" className="rk-post__related" ariaLabel="Related articles">
          <h2 className="rk-post__relatedTitle">Keep reading</h2>
          <p className="rk-post__relatedSub">Three more Faridabad guides on the same subject.</p>

          <ul className="rk-post__relatedGrid">
            {related.map((item, index) => (
              <Reveal as="li" key={item._id || item.slug} delay={index * 90}>
                <article className="rk-card rk-card--hover rk-post__relatedCard">
                  <Link className="rk-post__relatedMedia" to={`/blog/${item.slug}`} tabIndex={-1} aria-hidden="true">
                    <img
                      src={coverFor(item, index + 1)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={onImageError}
                    />
                  </Link>

                  <div className="rk-post__relatedBody">
                    <p className="rk-post__relatedMeta">
                      <MdCalendarToday aria-hidden="true" />
                      {formatDate(item.publishedAt || item.createdAt) || 'Recently published'}
                    </p>
                    <h3 className="rk-post__relatedName">
                      <Link to={`/blog/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p className="rk-post__relatedExcerpt">{truncate(item.excerpt || '', 120)}</p>
                    <Link className="rk-post__relatedCta rk-link-gold" to={`/blog/${item.slug}`}>
                      Read More
                      <MdArrowForward aria-hidden="true" />
                      <span className="sr-only">: {item.title}</span>
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        </Section>
      )}
    </article>
  )
}
