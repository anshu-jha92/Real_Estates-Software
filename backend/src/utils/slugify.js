/** "BPTP Park Elite Premium, Sector 84" -> "bptp-park-elite-premium-sector-84" */
export default function slugify(input = '') {
  // NFKD splits accents off their base letter, then the a-z0-9 filter drops them.
  return String(input)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export { slugify };

/**
 * Slug that is unique for a collection. Appends -2, -3 ... when taken.
 * `excludeId` keeps a document's own slug free while updating it.
 */
export async function uniqueSlug(Model, text, excludeId = null) {
  const base = slugify(text) || 'listing';
  let slug = base;
  let n = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}
