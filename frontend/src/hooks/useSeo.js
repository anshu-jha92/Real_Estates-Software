import { useEffect } from 'react'

const SUFFIX = 'Rama Kripa Estates'

function upsertMeta(selector, attr, name, content) {
  if (!content) return
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let tag = document.head.querySelector(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

/**
 * Per-page SEO. Pass a bare title and the brand suffix is appended.
 *
 *   useSeo({
 *     title: 'Property in Sector 88, Faridabad',
 *     description: '…',
 *     image: 'https://…'
 *   })
 */
export default function useSeo({ title, description, image, canonical, keywords } = {}) {
  useEffect(() => {
    const fullTitle = title ? (title.includes(SUFFIX) ? title : `${title} | ${SUFFIX}`) : SUFFIX
    const previousTitle = document.title
    document.title = fullTitle

    upsertMeta('meta[name="description"]', 'name', 'description', description)
    upsertMeta('meta[name="keywords"]', 'name', 'keywords', keywords)
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', image)
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href)
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle)
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image)
    upsertLink('canonical', canonical || window.location.href)

    return () => {
      document.title = previousTitle
    }
  }, [title, description, image, canonical, keywords])
}

export { useSeo }
