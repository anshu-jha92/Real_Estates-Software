# Rama Kripa Estates — Frontend

Premium real-estate website for **Rama Kripa Estates**, a property consultancy in
Faridabad, Haryana. *Blessings in Every Address.*

React 18 + Vite (client-side rendered), `react-router-dom` v6, plain CSS with
design tokens, `react-icons`. No Tailwind, no CSS-in-JS, no animation library —
motion is CSS keyframes plus `IntersectionObserver`.

---

## 1. Setup

```bash
cd frontend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```

| Script            | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Vite dev server on port 5173 (does not open a browser) |
| `npm run build`   | Production bundle into `dist/`                |
| `npm run preview` | Serves the built bundle on port 4173          |
| `npm run lint`    | ESLint over `src/`                            |

Node 18 or newer is required.

## 2. Environment

Only one variable is needed. Vite only exposes keys prefixed with `VITE_`.

```ini
# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

Point it at the deployed API (for example `https://api.ramakripaestate.com/api`)
when building for production. If the API is unreachable the site still renders:
`SiteContext` ships full default settings (address, phone numbers, hours, map)
and every list view falls back to an `EmptyState` rather than a blank screen.

## 3. Running with the backend

Two terminals, from the repository root:

```bash
# terminal 1 — API on :5000
cd backend
npm install
npm run seed        # loads real Faridabad demo data (idempotent)
npm run dev

# terminal 2 — site on :5173
cd frontend
npm run dev
```

The backend's `.env` must contain `CLIENT_URL=http://localhost:5173` so CORS
allows the dev server. Check `http://localhost:5000/api/health` first if the
site loads but shows no listings.

## 4. Admin

The dashboard lives at `http://localhost:5173/admin`.

* Sign in at `/admin/login` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` pair from
  the backend `.env` — the seed script creates exactly that one user.
* A successful login stores the JWT in `localStorage` under `rk_admin_token`
  (see `getToken` / `setToken` / `clearToken` in `src/api/client.js`).
* `RequireAdmin` in `App.jsx` redirects to the login page when the token is
  missing, remembering the page you were heading to.
* **Log out** in the admin topbar clears the token. Tokens expire after 7 days
  (`JWT_EXPIRES` on the backend); an expired token surfaces as a 401 and you are
  asked to sign in again.

Admin sections: Dashboard, Properties (list + create/edit form), Enquiries,
Blogs, Settings.

## 5. Folder map

```
frontend/
  index.html            SEO meta, Google Fonts, inline SVG favicon, #root
  vite.config.js        react plugin, port 5173, '@' -> /src
  src/
    main.jsx            BrowserRouter > SiteProvider > App, global CSS imports
    App.jsx             all routes, lazy pages, RequireAdmin, layouts
    styles/
      tokens.css        design tokens on :root — the only place colours live
      base.css          reset, typography scale, .rk-container, focus, scrollbar
      components.css    .rk-btn, .rk-card, .rk-input, .rk-grid, .rk-skeleton …
      animations.css    keyframes, .rk-reveal, prefers-reduced-motion overrides
    api/client.js       fetch wrapper (15s timeout) + `api.*` + admin token store
    context/SiteContext.jsx   settings / filter meta / stats + useSite()
    hooks/              useReveal, useFetch, useDebounce, useCountUp,
                        useLockBodyScroll, useSeo
    utils/format.js     formatPrice (Lac/Cr), formatArea, slugify, buildQuery …
    data/constants.js   CATEGORIES, PRICE_STEPS, NAV_LINKS, AMENITY_ICONS,
                        HERO_SLIDES, UNSPLASH(), IMAGE_FALLBACK
    layouts/            MainLayout (public shell), AdminLayout (sidebar shell)
    components/
      brand/            Logo, LogoMark (inline SVG monogram)
      layout/           TopBar, Header, MobileNav, Footer, FloatingActions,
                        ScrollToTop, Breadcrumb, PageHero
      home/             Hero, HeroSearch, CategoryStrip, FeaturedProperties, …
      property/         PropertyCard, FilterBar, ImageGallery, Pagination, …
      forms/            EnquiryForm, ContactForm, NewsletterForm, Field
      ui/               Section, SectionTitle, Reveal, Loader, EmptyState,
                        Modal, Toast, MapEmbed, Marquee, Accordion, Tabs
    pages/              Home, Properties, PropertyDetail, Localities, About,
                        Contact, Enquiry, Blog, BlogDetail, Legal, NotFound
    pages/admin/        AdminLogin, AdminDashboard, AdminProperties,
                        AdminPropertyForm, AdminEnquiries, AdminBlogs,
                        AdminSettings
```

Each component keeps its CSS in a sibling `.css` file that the component
imports, with an `rk-` class prefix.

## 6. House rules

* **Colours** come from `tokens.css` only. Never hardcode a hex value; use
  `var(--rk-gold-500)` or `rgba()` over a token colour.
* **Filters live in the URL** (`useSearchParams`), so a filtered result list is
  shareable and the back button behaves.
* **Every remote `<img>`** needs `loading="lazy"`, `decoding="async"`, an
  explicit aspect ratio and
  `onError={e => { e.currentTarget.src = IMAGE_FALLBACK }}`.
* **Motion** must respect `prefers-reduced-motion` — `animations.css` disables
  it globally, so do not re-enable it in a component.
* **Accessibility**: labels tied to inputs, `aria-expanded` on toggles, Esc
  closes overlays, visible `:focus-visible` rings, 44px minimum tap targets.
* **SEO**: call `useSeo({ title, description })` at the top of every page.

## 7. Deploying

`npm run build` produces a static `dist/`. Serve it from any static host
(Netlify, Vercel, Nginx) with a **SPA rewrite** — every unknown path must fall
back to `index.html`, otherwise a deep link such as
`/property/3-bhk-in-sector-88` will 404 on refresh.
