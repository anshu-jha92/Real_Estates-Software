/**
 * Link previews for WhatsApp, Facebook and X.
 *
 * Those crawlers never run JavaScript, so the og: tags React writes from
 * useSeo are invisible to them: every shared property link previewed with the
 * site-wide skyline and the homepage title, and a WhatsApp message carrying a
 * property URL showed no card at all.
 *
 * So for the two routes worth sharing — a property and a blog post — the head
 * of index.html is rewritten per request before the SPA fallback sends it. The
 * browser receives the same document and React takes over as usual; only the
 * crawler sees the difference.
 */
import Property from '../models/Property.js';
import Blog from '../models/Blog.js';

const BRAND = 'Rama Kripa Estates';
const AREA_LABEL = { sqft: 'sq. ft.', sqyd: 'sq. yd.', acre: 'acre' };
const INR = new Intl.NumberFormat('en-IN');

/** Mirrors the frontend's formatPrice: 75_00_000 -> "₹75 Lac". */
function money(value, { priceOnRequest, maxPrice } = {}) {
  const amount = (v) => {
    const n = Math.abs(Number(v));
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.00$/, '')} Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(2).replace(/\.?0+$/, '')} Lac`;
    return `₹${INR.format(Math.round(n))}`;
  };
  if (priceOnRequest) return 'Price on Request';
  const low = amount(value);
  if (!low) return 'Price on Request';
  const high = Number(maxPrice) > Number(value) ? amount(maxPrice) : null;
  return high ? `${low} - ${high}` : low;
}

function area(min, max, unit) {
  const label = AREA_LABEL[unit] || unit || '';
  const lo = Number(min);
  const hi = Number(max);
  if (Number.isFinite(lo) && lo > 0 && Number.isFinite(hi) && hi > lo) {
    return `${INR.format(lo)} - ${INR.format(hi)} ${label}`.trim();
  }
  const only = Number.isFinite(lo) && lo > 0 ? lo : hi;
  return Number.isFinite(only) && only > 0 ? `${INR.format(only)} ${label}`.trim() : '';
}

const place = (loc = {}) =>
  [loc.sector, loc.locality, loc.city]
    .filter((part, i, all) => part && all.indexOf(part) === i)
    .join(', ');

const clamp = (text, max = 200) => {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
};

/**
 * WhatsApp quietly drops a preview whose image is too heavy, and an uploaded
 * phone photo is several megabytes. Cloudinary can hand back a card-sized copy
 * from the same URL, so ask for one. Other hosts are passed through untouched.
 */
const cardImage = (url) =>
  String(url || '').replace(
    /(res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?!w_1200)/,
    '$1w_1200,h_630,c_fill,q_auto,f_jpg/'
  );

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Replace the content="" of one meta tag, wherever the attributes wrap. */
function setMeta(html, attr, name, value) {
  if (!value) return html;
  const tag = new RegExp(`(<meta[^>]*?${attr}="${name}"[^>]*?content=")[^"]*(")`, 'i');
  return html.replace(tag, (_, open, close) => `${open}${esc(value)}${close}`);
}

function applyMeta(html, { title, description, image, url }) {
  const tags = [
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:image', image],
    ['property', 'og:image:alt', title],
    ['property', 'og:url', url],
    ['name', 'description', description],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
    ['name', 'twitter:image', image],
  ];

  let out = html.replace(/<title>[^<]*<\/title>/i, () => `<title>${esc(title)} | ${BRAND}</title>`);
  for (const [attr, name, value] of tags) out = setMeta(out, attr, name, value);

  return out.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/i,
    (_, open, close) => `${open}${esc(url)}${close}`
  );
}

async function propertyMeta(slug) {
  const p = await Property.findOne({ slug, isActive: true })
    .select('title shortDescription description price maxPrice priceOnRequest areaMin areaMax areaUnit propertyType bedrooms location thumbnail images')
    .lean();
  if (!p) return null;

  // seo.metaTitle / metaDescription are written for Google and repeat the brand
  // and the sector; a preview card has room for one line, so it gets the plain
  // name and the facts someone actually asks first.
  const facts = [
    money(p.price, p),
    p.bedrooms > 0 ? `${p.bedrooms} BHK` : p.propertyType,
    area(p.areaMin, p.areaMax, p.areaUnit),
    place(p.location),
  ].filter(Boolean);

  return {
    title: p.title,
    description: clamp([facts.join(' · '), p.shortDescription || p.description].filter(Boolean).join(' — ')),
    image: cardImage(p.thumbnail || p.images?.[0]),
  };
}

async function blogMeta(slug) {
  const b = await Blog.findOne({ slug }).select('title excerpt coverImage').lean();
  if (!b) return null;
  return { title: b.title, description: clamp(b.excerpt), image: cardImage(b.coverImage) };
}

const ROUTES = [
  [/^\/property\/([^/?#]+)/, propertyMeta],
  [/^\/blog\/([^/?#]+)/, blogMeta],
];

/**
 * @param {string} html   the built index.html
 * @param {import('express').Request} req
 * @returns {Promise<string>} html with a per-page head, or the original
 */
export default async function socialMeta(html, req) {
  const route = ROUTES.find(([pattern]) => pattern.test(req.path));
  if (!route) return html;

  try {
    const meta = await route[1](decodeURIComponent(route[0].exec(req.path)[1]).toLowerCase());
    if (!meta) return html;
    // trust proxy is on, so protocol follows X-Forwarded-Proto behind Render.
    return applyMeta(html, { ...meta, url: `${req.protocol}://${req.get('host')}${req.path}` });
  } catch (err) {
    // A preview is never worth a blank page: serve the default head instead.
    console.warn('[og] Could not build the link preview:', err.message);
    return html;
  }
}
