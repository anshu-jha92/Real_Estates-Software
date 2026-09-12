# Rama Kripa Estates — Build Spec (single source of truth)

Every agent MUST follow this file exactly. Names, paths, exports and contracts are binding.
Brand: **Rama Kripa Estates** — real estate consultancy, Faridabad, Haryana, India.
Tagline: **"Blessings in Every Address"**
NO international projects anywhere.

Root: `C:/Users/jhasa/Downloads/RealState`  (`backend/`, `frontend/`)

---

## 1. Stack

- Frontend: React 18 + Vite (CSR) + react-router-dom v6 + plain CSS (design tokens). Icons: `react-icons`. No Tailwind, no CSS-in-JS, no framer-motion (CSS animations + IntersectionObserver only).
- Backend: Node + Express 4 + Mongoose 8 + MongoDB Atlas. `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `express-rate-limit`, `morgan`.
- Data fetching: native `fetch` wrapped in `src/api/client.js`. No axios.
- Maps: Google Maps **iframe embed** (no API key). No map libraries.

---

## 2. Design system (frontend/src/styles/tokens.css) — USE THESE EXACT VARS

```
--rk-green-900:#08251B; --rk-green-800:#0F3D2E; --rk-green-700:#14513C;
--rk-green-600:#1B6B4F; --rk-green-500:#27866A; --rk-green-50:#EFF6F2;
--rk-gold-600:#A98218; --rk-gold-500:#C9A227; --rk-gold-400:#DFBE5A; --rk-gold-300:#EBD79A; --rk-gold-50:#FBF6E6;
--rk-cream:#FAF7F1; --rk-white:#FFFFFF; --rk-ink:#131A17; --rk-body:#3E4A45;
--rk-muted:#6B7671; --rk-line:#E7E2D8; --rk-surface:#F4F1EA;
--rk-danger:#C0392B; --rk-success:#1E874B; --rk-info:#2A6FB0;

--rk-font-display:'Playfair Display',Georgia,serif;
--rk-font-body:'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',sans-serif;

--rk-r-sm:8px; --rk-r-md:14px; --rk-r-lg:20px; --rk-r-xl:28px; --rk-r-pill:999px;
--rk-sh-sm:0 2px 8px rgba(8,37,27,.06);
--rk-sh-md:0 10px 30px rgba(8,37,27,.10);
--rk-sh-lg:0 24px 60px rgba(8,37,27,.16);
--rk-sh-gold:0 10px 30px rgba(201,162,39,.28);
--rk-container:1280px; --rk-gutter:clamp(16px,4vw,40px);
--rk-header-h:76px; --rk-topbar-h:42px;
--rk-ease:cubic-bezier(.22,1,.36,1); --rk-t:.35s var(--rk-ease);
```

Fonts loaded in `index.html` via Google Fonts (`Playfair Display` 400..700, `Plus Jakarta Sans` 300..800).

Global utility classes (in `base.css` / `components.css`): `.rk-container`, `.rk-section`, `.rk-btn`, `.rk-btn--gold`, `.rk-btn--green`, `.rk-btn--ghost`, `.rk-btn--outline`, `.rk-chip`, `.rk-badge`, `.rk-badge--gold`, `.rk-badge--green`, `.rk-badge--dark`, `.rk-card`, `.rk-input`, `.rk-select`, `.rk-textarea`, `.rk-label`, `.rk-eyebrow`, `.rk-h1` .. `.rk-h4`, `.rk-grid`, `.rk-skeleton`, `.rk-reveal` (+ `.is-visible`).

**Look**: cream/ivory page, deep-green dark bands, gold accents and thin gold rules, generous whitespace, serif display headings + sans body, soft shadows, 14–20px radii, gold underline animation on nav, image zoom on card hover. Premium, not flashy.

**Motion**: hero Ken-Burns slideshow + gradient overlay; `.rk-reveal` fade/slide-up on scroll (IntersectionObserver, `useReveal`); count-up stats; marquee for partner logos; `prefers-reduced-motion` MUST disable all of it.

**Responsive**: mobile-first. Breakpoints `480 / 768 / 1024 / 1280`. No horizontal scroll at 320px. Tap targets >= 44px. Grids: 1 col < 768, 2 col < 1080, 3 col >= 1080.

---

## 3. Backend

`backend/src/` layout:

```
server.js
config/db.js
models/{Property,Enquiry,Blog,Developer,Testimonial,Locality,User,Setting}.js
services/{propertyService,enquiryService,blogService,catalogService,authService,settingService,mediaService}.js
controllers/{propertyController,enquiryController,blogController,metaController,authController,settingController,mediaController}.js
routes/{propertyRoutes,enquiryRoutes,blogRoutes,metaRoutes,authRoutes,settingRoutes,mediaRoutes,index}.js
middleware/{auth.js,errorHandler.js,asyncHandler.js}
utils/{slugify.js,apiFeatures.js,AppError.js}
seed/seed.js
```

**Layering rules (binding):**

- `routes/` — wiring only. Path, middleware, handler. No logic.
- `controllers/` — HTTP adapters. Read `req`, call one service, shape the response. A controller MUST NOT import a model.
- `services/` — all business logic and data access. A service MUST NOT import express or reference `req` / `res`. To fail, it throws `AppError` (or a helper: `badRequest` / `unauthorized` / `forbidden` / `notFound` from `utils/AppError.js`); `errorHandler` turns that into JSON.
- `models/` — schemas, hooks, instance methods.

New cross-cutting work (email + WhatsApp notification on an enquiry, payment, CRM sync, image upload) belongs in `services/`, so the HTTP layer never changes for it.

`.env`: `PORT=5000`, `MONGO_URI=<atlas>`, `JWT_SECRET=`, `JWT_EXPIRES=7d`, `CLIENT_URL=http://localhost:5173`, `ADMIN_EMAIL=`, `ADMIN_PASSWORD=`,
`CLOUDINARY_CLOUD_NAME=`, `CLOUDINARY_API_KEY=`, `CLOUDINARY_API_SECRET=`, `CLOUDINARY_FOLDER=rama-kripa`.

### Media uploads (Cloudinary)

The API secret is **server-side only** — there is no Cloudinary key in the frontend bundle and no
unsigned upload preset. The browser posts the file to our own API, which signs and forwards it.

```
POST   /api/media/upload   [admin]  multipart, field `files` (up to 12)
                                    -> 201 { success, data | files:[{ url, publicId, width, height, bytes, format }] }
GET    /api/media/status   [admin]  -> { configured, maxBytes, accepts[] }
DELETE /api/media          [admin]  ?publicId=&resourceType=
```

- Mounted **above** the database guard: an upload does not need Mongo.
- `multer` memory storage — nothing is written to the server's disk.
- Limits: 10 MB per file, 12 files per request; JPG / PNG / WebP / AVIF / GIF / PDF only.
- On upload the original is capped at 2000px on the long edge (`crop: 'limit'`, never upscales) at `quality: auto:good`.
- The **stored** URL carries `f_auto,q_auto`, so Cloudinary serves WebP/AVIF to browsers that accept it and JPEG to those that do not. The database still holds a single plain URL string, exactly like a pasted one.

**Admin UI**: `components/forms/MediaInput.jsx` gives every image field BOTH a file upload
(drag-and-drop + picker, with progress and cancel) AND a paste-a-URL box. The URL route must never
be removed — it is how the client links stock or builder-supplied images. If the Cloudinary keys are
missing, the uploader hides itself and the URL box keeps working.

### Property model (exact fields)

```
title*, slug(unique, auto), shortDescription, description(long text),
category*: 'residential'|'commercial'|'plots'|'rent'|'office-space',
propertyType: String,   // "3 BHK Apartment","Independent Floor","Retail Shop","Residential Plot","Office Space","Builder Floor","Warehouse","SCO Plot"
listingType: 'sale'|'rent' (default 'sale'),
status: 'new-launch'|'under-construction'|'ready-to-move'|'resale'|'sold-out',
price: Number, maxPrice: Number, priceOnRequest: Boolean,
priceUnit: 'total'|'per-sqft'|'per-sqyd'|'per-month',
areaMin: Number, areaMax: Number, areaUnit: 'sqft'|'sqyd'|'acre',
bedrooms: Number, bathrooms: Number, balconies: Number, floorsTotal: Number, parking: Number,
furnishing: 'unfurnished'|'semi-furnished'|'furnished',
configurations: [{ label, areaValue, areaUnit, price, priceOnRequest }],
location: { locality, sector, city(default 'Faridabad'), state(default 'Haryana'), pincode, address, landmark, lat, lng, mapEmbedUrl },
developer, reraNumber, possession, launchDate,
amenities: [String], highlights: [String], nearby: [{ label, distance }],
images: [String], thumbnail, brochureUrl, videoUrl,
badges: [String], isFeatured: Boolean, isTrending: Boolean, isActive: Boolean(default true),
views: Number, order: Number,
seo: { metaTitle, metaDescription, keywords:[String] },
timestamps
```

Text index on `title, shortDescription, description, developer, location.locality, location.sector, location.city, propertyType`.

### REST contract (all JSON `{ success, ... }`)

```
GET    /api/health
GET    /api/properties            ?search,category,listingType,propertyType,status,city,locality,minPrice,maxPrice,
                                   bedrooms,minArea,maxArea,featured,trending,sort(newest|price-asc|price-desc|popular),page,limit
       -> { success, data:[Property], page, pages, total, limit }
GET    /api/properties/featured?limit=
GET    /api/properties/:slug      -> { success, data, similar:[...4] }   (also accepts a Mongo id)
POST   /api/properties            [admin]
PUT    /api/properties/:id        [admin]
DELETE /api/properties/:id        [admin]

GET    /api/meta/filters   -> { success, data:{ cities[], localities[], propertyTypes[], categories[{key,label,count}], statuses[], priceRange:{min,max}, bedrooms[] } }
GET    /api/meta/stats     -> { success, data:{ total, residential, commercial, plots, rent, officeSpace, localities } }

GET    /api/localities                 -> Locality list (name, slug, city, image, description, count)
GET    /api/developers                 -> Developer list (name, logo, website)
GET    /api/testimonials               -> Testimonial list (name, role, message, rating, avatar)

POST   /api/enquiries      { name*, phone*, email, subject, message, propertyId, propertySlug, propertyTitle, budgetMin, budgetMax, interestedIn, source }
                            -> 201 { success, message } ; rate-limited 5 / 10 min / IP
GET    /api/enquiries      [admin]  ?status,page
PATCH  /api/enquiries/:id  [admin]  { status:'new'|'contacted'|'closed', note }
DELETE /api/enquiries/:id  [admin]

GET    /api/blogs ?page,limit,tag   ; GET /api/blogs/:slug ; POST/PUT/DELETE [admin]
GET    /api/settings  -> single Setting doc (phones[], email, address, whatsapp, socials{}, hours, mapEmbedUrl, heroSlides[], about, stats[])
PUT    /api/settings  [admin]
POST   /api/auth/login { email, password } -> { success, token, user }
GET    /api/auth/me   [admin]
```

Validation errors -> 400 `{success:false,message,errors}`. Central `errorHandler`. `asyncHandler` wraps controllers. CORS allows `CLIENT_URL`. Mongoose `lean()` on reads. Pagination default limit 12, max 60.

### Seed (`backend/src/seed/seed.js`, `npm run seed`)

Realistic **Faridabad** data, no lorem ipsum:

- \>= 24 properties spread across all 5 categories, real Faridabad localities: Sector 75, 76, 77, 78, 79, 80, 81, 84, 85, 86, 87, 88, 89 (Greater Faridabad / Neharpar), Sector 14, 15, 16, 21C, 28, 37, Ballabgarh, Sohna Road, Mathura Road, Bypass Road, Tigaon Road, Palwal Road, Old Faridabad, NIT Faridabad, Surajkund, Anangpur, Dayalpur, Bhatia Chowk, Badkhal.
- Developers: BPTP, Omaxe, Adore, Puri Constructions, RPS Group, Emerald, Amolik, SRS, Ansal, Godrej, Signature Global, Navraj, Bhumika, TDI, Vatika, Piyush Group.
- Use free Unsplash image URLs (`https://images.unsplash.com/photo-...?auto=format&fit=crop&w=1200&q=80`) — 4-6 per property.
- 1 admin user from env, 8 localities with images, 12 developers, 6 testimonials (Indian names), 6 blogs about Faridabad property, 1 Setting doc:
  phones `+91 98110 00000` / `+91 92120 00000`, email `info@ramakripaestate.com`,
  address `SCO 12, Sector 88, Greater Faridabad, Haryana 121002`, hours `10:00 - 19:00, Mon-Sun`.
- Seed must be idempotent (clear then insert).

---

## 4. Frontend routes (`App.jsx`)

```
/                          Home
/properties                Properties            (all filters via query string)
/residential               Properties (category=residential)
/commercial                Properties (category=commercial)
/plots                     Properties (category=plots)
/rent                      Properties (listingType=rent)
/office-spaces             Properties (category=office-space)
/property/:slug            PropertyDetail
/localities                Localities
/locality/:slug            Properties (locality preset)
/about                     About
/contact                   Contact
/enquiry                   Enquiry
/blog                      Blog
/blog/:slug                BlogDetail
/privacy-policy            Legal
/terms                     Legal
/admin/login               AdminLogin
/admin                     AdminLayout -> AdminDashboard | AdminProperties | AdminPropertyForm | AdminEnquiries | AdminBlogs | AdminSettings
*                          NotFound
```

Every non-admin route sits inside `MainLayout` (TopBar + Header + `<Outlet/>` + Footer + FloatingActions + ScrollToTop).

Filters live in the **URL query string** (`useSearchParams`) so results are shareable and back-button-safe.

### Exact frontend file tree

```
frontend/
  index.html  vite.config.js  package.json  .env.example
  src/
    main.jsx  App.jsx
    styles/{tokens.css,base.css,components.css,animations.css}
    api/client.js
    context/SiteContext.jsx        // settings + filter meta, provider + useSite()
    hooks/{useReveal.js,useFetch.js,useDebounce.js,useCountUp.js,useLockBodyScroll.js,useSeo.js}
    utils/format.js                // formatPrice, formatArea, categoryLabel, statusLabel, buildQuery
    data/constants.js              // CATEGORIES, PRICE_STEPS, SORTS, AMENITY_ICONS, NAV_LINKS
    layouts/{MainLayout.jsx,AdminLayout.jsx}
    components/
      brand/{Logo.jsx,LogoMark.jsx}
      layout/{TopBar.jsx,Header.jsx,MobileNav.jsx,Footer.jsx,FloatingActions.jsx,ScrollToTop.jsx,Breadcrumb.jsx,PageHero.jsx}
      home/{Hero.jsx,HeroSearch.jsx,CategoryStrip.jsx,FeaturedProperties.jsx,StatsBand.jsx,WhyChooseUs.jsx,LocalityShowcase.jsx,TrendingSplit.jsx,DeveloperMarquee.jsx,Testimonials.jsx,BlogTeaser.jsx,CtaEnquiry.jsx,MapBand.jsx}
      property/{PropertyCard.jsx,PropertyCardSkeleton.jsx,PropertyGrid.jsx,FilterBar.jsx,FilterSidebar.jsx,SortSelect.jsx,Pagination.jsx,ImageGallery.jsx,AmenityList.jsx,ConfigTable.jsx,SimilarProperties.jsx,ShareRow.jsx}
      forms/{EnquiryForm.jsx,ContactForm.jsx,NewsletterForm.jsx,Field.jsx}
      ui/{Section.jsx,SectionTitle.jsx,Reveal.jsx,Loader.jsx,EmptyState.jsx,Modal.jsx,Toast.jsx,MapEmbed.jsx,Marquee.jsx,Accordion.jsx,Tabs.jsx}
    pages/{Home.jsx,Properties.jsx,PropertyDetail.jsx,Localities.jsx,About.jsx,Contact.jsx,Enquiry.jsx,Blog.jsx,BlogDetail.jsx,Legal.jsx,NotFound.jsx}
    pages/admin/{AdminLogin.jsx,AdminDashboard.jsx,AdminProperties.jsx,AdminPropertyForm.jsx,AdminEnquiries.jsx,AdminBlogs.jsx,AdminSettings.jsx}
```

Each component may ship a sibling `.css` file imported by it (e.g. `Header.jsx` + `Header.css`). Keep component CSS scoped with an `rk-<name>` class prefix.

**All components use default exports.** `PropertyCard` props: `{ property, variant?: 'grid'|'wide'|'compact' }`.

### api/client.js

```js
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export async function apiGet(path, params)   // builds query string, throws Error(message)
export async function apiSend(path, method, body, token)
export const api = { properties, featured, property, filters, stats, localities, developers,
                     testimonials, blogs, blog, settings, createEnquiry, login, admin: { ... } }
```

Every list call returns `{ data, page, pages, total }`. Handle network failure gracefully: pages show `EmptyState`, never a blank screen.

---

## 5. Home page section order (top -> bottom)

1. **TopBar** (dark green): address, hours, `CALL TO EXPERT` gold pill (tel:), social icons. Hidden < 992px.
2. **Header** (sticky, cream -> white on scroll, shadow on scroll): Logo | nav (Home, Who We Are with dropdown [About Us, Our Team, Why Us], Residential, Commercial, Plots dropdown [Plots in Faridabad, SCO / Commercial Plots], Rent, Office Spaces, Blog, Contact) | `Enquire Now` gold button. Mobile: hamburger -> full-screen drawer with accordion submenus.
3. **Hero** (100svh, min 620px): Ken-Burns crossfade slideshow of Faridabad / Delhi-NCR skyline images + dark green gradient overlay; animated eyebrow, `Looking For Luxury Homes in Faridabad?` display headline with a rotating word (Homes / Plots / Offices / Shops), subline, then **HeroSearch**, then 3 trust pills (RERA Registered, 1200+ Families, 18+ Years). Scroll cue at bottom.
4. **HeroSearch** glass card: tab row `Buy | Rent | Plots | Commercial` + fields `Search by project, locality or developer` (text), `Property Type` (select), `Location / Sector` (select), `Min Price`, `Max Price` (selects, formatted in Lakh / Cr) and a gold `SEARCH` button. Submitting navigates to `/properties?...`. Mobile: stacked, with a `More filters` toggle.
5. **CategoryStrip**: 5 tilted-icon cards — Residential, Commercial, Plots, Rent, Office Spaces — with live counts from `/api/meta/stats`.
6. **FeaturedProperties**: eyebrow `OUR PORTFOLIO`, title `Properties in Faridabad`, intro paragraph, tab filter (All / Residential / Commercial / Plots / Rent), 3-col PropertyCard grid (6 cards) plus a `View All Properties` outline button. Skeletons while loading.
7. **StatsBand** (dark green + gold rules): 4 count-up stats — 18+ Years, 1,200+ Happy Families, 250+ Projects, 40+ Developer Tie-ups.
8. **WhyChooseUs**: 6 cards — Verified and RERA-checked listings, Faridabad-only expertise, Site visits and transport, Home-loan assistance, Legal and documentation, Post-sale support.
9. **LocalityShowcase**: `Explore Faridabad by Location` — image cards for Greater Faridabad (Neharpar), Sector 88 and 89, Sector 75-80, Old Faridabad, Ballabgarh, Sohna Road, Surajkund, Bypass Road. Each links to `/properties?locality=`.
10. **TrendingSplit**: two columns — left sticky copy + CTA, right 3 `variant="wide"` trending cards.
11. **DeveloperMarquee**: `Our Association` — infinite CSS marquee of developer logos (grayscale -> colour on hover), pauses on hover.
12. **Testimonials**: slider, gold star ratings, avatar, name + locality.
13. **BlogTeaser**: 3 latest posts, `Insights & Guides`.
14. **CtaEnquiry + MapBand**: split — left dark-green panel with `EnquiryForm` (Name, Phone, Email, Interested In, Message), right the **Google Maps iframe centred on Faridabad** with the office address and a `Get Directions` link under it.
15. **Footer** (deep green): brand column (logo, 2-line about, socials), Quick Links, Property Types, Popular Localities, Contact block (address / phone / email / hours) + newsletter. Bottom bar `© 2026 Rama Kripa Estates. All rights reserved.` + Privacy / Terms.
16. **FloatingActions**: WhatsApp bubble + Call bubble (bottom-right, stacked, mobile-safe) + back-to-top.

## 6. Contact page (mirror the client's reference screenshots)

`PageHero` (muted image band + `Contact Us` + breadcrumb) -> two-column card row: left = white card, intro line `Please fill the form & we will get back to you as soon as possible.`, fields **First Name\*, Last Name\*, Mobile Number\*, Email\*, Message\*** and a full-width Submit button; right = sticky info card (logo, `For inquiries Contact:`, company, address, email, phone, hours, social icon row). Below: **full-width Google Map iframe of Faridabad**, then an address strip `Address: Rama Kripa Estates, SCO 12, Sector 88, Greater Faridabad, Haryana 121002 — Get Directions` (gold link). Then 3 quick-contact tiles (Call / WhatsApp / Email) and a short FAQ accordion.

## 7. Properties page

Sticky `FilterBar` (search, category, type, locality, status, budget, bedrooms, area, sort, `Clear all`) — desktop left sidebar (sticky, collapsible groups) plus a mobile bottom-sheet `Filters` button showing an active-filter count. Active filter chips row. Result count + sort. Responsive card grid, skeletons on load, `Pagination`, `EmptyState` with a reset CTA. All state in the URL.

## 8. PropertyDetail page

Breadcrumb -> title + badges + locality (left) / price + `Enquire Now` (right) -> `ImageGallery` (main image, thumb strip, lightbox, keyboard arrows) -> 2 columns:
**left** — Overview stat grid (Type, Configuration, Area, Status, Possession, Floors, Parking, RERA), Description, `ConfigTable` (config / area / price / enquire), `AmenityList` (icon grid), Location block (address + nearby distances + map iframe), Developer note, `ShareRow` (WhatsApp / FB / X / LinkedIn / Copy link);
**right** — sticky agent/enquiry card (Rama Kripa Estates logo, phone, `Hello, I am interested in [Title]` prefilled message, Name / Phone / Email / Message, Send Enquiry) plus brochure download and a `Schedule a Site Visit` button.
Bottom: `SimilarProperties`.

## 9. Non-negotiables

- Fully responsive 320px -> 1920px, verified mentally at 375 / 768 / 1024 / 1440.
- Accessible: semantic landmarks, alt text, labels tied to inputs, visible `:focus-visible`, `aria-expanded` on toggles, Esc closes overlays, contrast >= 4.5:1.
- No dead links (`href="#"`), no lorem ipsum, no placeholder TODOs.
- Zero console errors. Loading, error and empty states everywhere.
- Images: `loading="lazy"`, `decoding="async"`, explicit aspect-ratio to avoid layout shift.
- SEO: per-page `document.title` + meta description via the `useSeo` hook.

---

## 10. Approved image IDs (use ONLY these — do not invent Unsplash IDs)

Build every URL as `https://images.unsplash.com/photo-<ID>?auto=format&fit=crop&w=1400&q=80`.

Hero / city (Faridabad-Delhi NCR skyline feel):
`1486406146926-c627a92ad1ab`, `1449824913935-59a10b8d2000`, `1477959858617-67f85cf4f1df`,
`1470723710355-95304d8aece4`, `1493246507139-91e8fad9978e`, `1518005020951-eccb494ad742`

Residential / apartments:
`1512917774080-9991f1c4c750`, `1568605114967-8130f3a36994`, `1600596542815-ffad4c1539a9`,
`1600585154340-be6161a56a0c`, `1580587771525-78b9dba3b914`, `1613490493576-7fde63acd811`,
`1560448204-e02f11c3d0e2`, `1502005229762-cf1b2da7c5d6`, `1570129477492-45c003edd2be`

Interiors:
`1600607687939-ce8a6c25118c`, `1600566753086-00f18fb6b3ea`, `1522708323590-d24dbb6b0267`,
`1554995207-c18c203602cb`, `1600210492486-724fe5c67fb0`, `1616486338812-3dadae4b4ace`

Commercial / office / retail:
`1497366216548-37526070297c`, `1497366754035-f200968a6e72`, `1524758631624-e2822e304c36`,
`1541888946425-d81bb19240f5`, `1519389950473-47ba0277781c`, `1497215728101-856f4ea42174`

Plots / land:
`1500382017468-9049fed747ef`, `1416879595882-3373a0480b5b`, `1464822759023-fed622ff2c3b`,
`1543965170-4c01a586684e`, `1595246140625-573b715d11dc`

People (testimonials / team) — `...?auto=format&fit=crop&w=200&h=200&q=80`:
`1507003211169-0a1dd7228f2d`, `1494790108377-be9c29b29330`, `1500648767791-00dcc994a43e`,
`1544005313-94ddf0286df2`, `1472099645785-5658abf4ff4e`, `1438761681033-6461ffad8d80`

**Mandatory fallback**: export `IMAGE_FALLBACK` (an inline SVG data-URI, deep-green -> gold gradient with the RKE badge) from `src/data/constants.js`, and add `onError={e => { e.currentTarget.src = IMAGE_FALLBACK }}` to EVERY remote `<img>`. A dead image must never show a broken icon.

## 11. Google Map embed (must actually work, no API key)

Use exactly this src for the Faridabad office map (and store the same string in Setting.mapEmbedUrl):

```
https://www.google.com/maps?q=Sector+88,+Greater+Faridabad,+Haryana+121002&output=embed
```

Directions link: `https://www.google.com/maps/dir/?api=1&destination=Sector+88,+Greater+Faridabad,+Haryana+121002`

For a property with `location.lat` / `location.lng`, `MapEmbed` builds
`https://www.google.com/maps?q=<lat>,<lng>&z=15&output=embed`, otherwise it falls back to the URL-encoded address.
`MapEmbed` props: `{ query?, lat?, lng?, title, height? }`, renders a `<iframe loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen>` inside a rounded, shadowed frame.

## 12. Logo

`LogoMark.jsx` — an `<img>` pointing at `/rke-logo.png`, the client's own artwork: a circular badge with a black outer ring, a red (`#E8262C`) inner ring, a black city skyline and `RKE` across the base. The PNG is transparent OUTSIDE the ring but keeps its white interior, so one file works on both the cream pages and the dark green bands — there is no light/dark variant. Props `{ size = 44, className }`. The badge is decorative (`alt=""`); every caller pairs it with the name in text.
`Logo.jsx` — mark + wordmark: `RAMA KRIPA` in `--rk-font-display` with `ESTATES` letter-spaced below, plus the tagline `Blessings in Every Address` (hidden on small screens). Props `{ variant = 'dark' | 'light', showTagline = true }`. Wrapped in a `<Link to="/">`.
Logo colours live in `--rk-brand-red` / `--rk-brand-red-300` / `--rk-brand-black` and are **logo-only** — the site UI stays green/gold.
`styles/base.css` tints every `<img>` with `--rk-surface` while it loads, so any transparent PNG needs `background: none` or it renders as a square plate behind the art.
