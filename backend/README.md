# Rama Kripa Estates - Backend API

REST API for **Rama Kripa Estates**, a real estate consultancy in Faridabad, Haryana.
Node + Express 4 + Mongoose 8 + MongoDB. ES modules throughout.

Base URL in development: `http://localhost:5000/api`

---

## 1. Setup

```bash
cd backend
npm install
cp .env.example .env     # then edit the values
npm run seed             # loads the Faridabad showcase data
npm run dev              # nodemon on http://localhost:5000
```

Verify it is alive:

```bash
curl http://localhost:5000/api/health
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the API with nodemon (auto restart on save). |
| `npm start` | Starts the API with plain node (production). |
| `npm run seed` | Wipes and re-inserts all showcase data. Safe to re-run. |

Requires Node 18 or newer.

---

## 2. Environment variables

All of these live in `backend/.env` (git-ignored). `.env.example` is the template.

| Variable | Required | Default / example | Notes |
| --- | --- | --- | --- |
| `PORT` | no | `5000` | Port the API listens on. |
| `NODE_ENV` | no | `development` | `morgan` request logging is on unless this is `production`. |
| `MONGO_URI` | **yes** | `mongodb://127.0.0.1:27017/ramakripa` | Local MongoDB or an Atlas SRV string. |
| `JWT_SECRET` | **yes** | long random string | Signs admin tokens. Change it before deploying. |
| `JWT_EXPIRES` | no | `7d` | Token lifetime. |
| `CLIENT_URL` | no | `http://localhost:5173` | The only origin CORS accepts. |
| `ADMIN_NAME` | no | `Rama Kripa Admin` | Used by the seed. |
| `ADMIN_EMAIL` | no | `admin@ramakripaestate.com` | Seeded admin login. |
| `ADMIN_PASSWORD` | no | `RamaKripa@2026` | Seeded admin password. Change it in production. |

Generate a real secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Pointing MONGO_URI at MongoDB Atlas

1. Create a free cluster at <https://cloud.mongodb.com>.
2. **Database Access** -> *Add New Database User* (password auth). Note the user and password.
3. **Network Access** -> *Add IP Address*. Add your own IP, or `0.0.0.0/0` while developing.
4. **Database** -> *Connect* -> *Drivers* -> copy the SRV string.
5. Paste it into `.env` and add the database name `ramakripa` before the `?`:

```env
MONGO_URI=mongodb+srv://ramakripa:YOUR_PASSWORD@cluster0.abcde.mongodb.net/ramakripa?retryWrites=true&w=majority&appName=Cluster0
```

URL-encode any special characters in the password (`@` becomes `%40`, `#` becomes `%23`).
Then run `npm run seed` again so the Atlas database gets the data.

If Mongo is unreachable the API **does not crash**. It logs a warning, keeps listening, answers
`/api/health`, and returns a clean `503` with an empty `data: []` on every other route, so the
frontend still boots and renders its empty states.

---

## 3. Endpoints

All responses are JSON and carry `success: true | false`.
`[admin]` routes need `Authorization: Bearer <token>` from `POST /api/auth/login`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | - | Liveness + database connection state. Answers even when Mongo is down. |
| GET | `/api/properties` | - | Filtered, sorted, paginated list. See query params below. |
| GET | `/api/properties/featured?limit=` | - | Featured listings (default 6, max 24). |
| GET | `/api/properties/:slug` | - | One property by slug **or** Mongo id. Increments `views`, returns 4 similar. |
| POST | `/api/properties` | admin | Create a property. |
| PUT | `/api/properties/:id` | admin | Update a property (slug regenerates if the title changes). |
| DELETE | `/api/properties/:id` | admin | Delete a property. |
| GET | `/api/meta/filters` | - | Dropdown data derived from live listings. |
| GET | `/api/meta/stats` | - | Counts per category for the home page. |
| GET | `/api/localities` | - | 8 locality cards with a live property count each. |
| GET | `/api/developers` | - | Developer list with inline SVG logos and websites. |
| GET | `/api/testimonials` | - | Client testimonials. |
| POST | `/api/enquiries` | - | Submit an enquiry. **Rate limited: 5 per 10 minutes per IP.** |
| GET | `/api/enquiries?status,page,limit,search` | admin | Enquiry inbox with per-status counts. |
| PATCH | `/api/enquiries/:id` | admin | `{ status: 'new'\|'contacted'\|'closed', note }`. |
| DELETE | `/api/enquiries/:id` | admin | Delete an enquiry. |
| GET | `/api/blogs?page,limit,tag,search` | - | Published posts (content omitted from the list). |
| GET | `/api/blogs/:slug` | - | One post + 3 related. Increments `views`. |
| POST | `/api/blogs` | admin | Create a post. |
| PUT | `/api/blogs/:id` | admin | Update a post. |
| DELETE | `/api/blogs/:id` | admin | Delete a post. |
| GET | `/api/settings` | - | The single site settings document (created on first read if absent). |
| PUT | `/api/settings` | admin | Update site settings. |
| POST | `/api/auth/login` | - | `{ email, password }` -> `{ success, token, user }`. Rate limited: 10 per 15 min. |
| GET | `/api/auth/me` | admin | The signed-in admin. |

### `GET /api/properties` query parameters

| Param | Example | Behaviour |
| --- | --- | --- |
| `search` | `nehar` | Case-insensitive partial match across title, developer, locality, sector and property type. |
| `category` | `residential` | `residential` \| `commercial` \| `plots` \| `rent` \| `office-space`. Comma list allowed. |
| `listingType` | `rent` | `sale` \| `rent`. |
| `propertyType` | `3 BHK Apartment` | Exact value from `/api/meta/filters`. Comma list allowed. |
| `status` | `ready-to-move` | `new-launch` \| `under-construction` \| `ready-to-move` \| `resale` \| `sold-out`. |
| `city` | `Faridabad` | Loose match on `location.city`. |
| `locality` | `sector-88` or `Sector 86` | Matches a seeded locality slug/name (expanded to its aliases) **or** a raw sector name. Checks both `location.locality` and `location.sector`. |
| `minPrice` / `maxPrice` | `9000000` | Rupees. Listings spanning `price..maxPrice` are matched on overlap. Applying either one hides `priceOnRequest` listings. |
| `minArea` / `maxArea` | `1400` | Same overlap logic across `areaMin..areaMax`. |
| `bedrooms` | `3` | Minimum, not exact (`>= 3`). |
| `featured` / `trending` | `true` | Boolean flags. |
| `sort` | `price-asc` | `newest` \| `price-asc` \| `price-desc` \| `popular`. Default is curated `order`. |
| `page` / `limit` | `2` / `24` | Default limit 12, maximum 60. |
| `isActive` | `all` | Admin only convenience: `all` returns inactive listings too. Public calls always get active only. |

Response shape:

```json
{ "success": true, "data": [ ... ], "page": 1, "pages": 3, "total": 26, "limit": 12 }
```

### Error shape

```json
{ "success": false, "message": "Please correct the highlighted fields.", "errors": { "phone": "Please enter a valid 10 digit mobile number" } }
```

`400` validation / cast / duplicate key, `401` bad or missing token, `403` not an admin,
`404` unknown route or record, `429` rate limited, `503` database unavailable.

---

## 4. Seed data

`npm run seed` clears and reloads everything except **enquiries**, which are real leads and are
never wiped. It inserts:

- **26 properties** - residential 11, commercial 4, plots 6, rent 3, office-space 2. Real Faridabad
  addresses across Neharpar (Sectors 76 to 89), Old Faridabad, Ballabgarh, Tigaon Road, Sohna Road,
  Mathura Road, Sector 21C and Bypass Road. Every listing carries a 190-215 word description,
  6-10 amenities, 3-6 highlights, 4-5 nearby distances, 1-3 configurations, coordinates, badges
  and an SEO block.
- **8 localities** with images and `aliases` (the sector names each card covers).
- **12 developers** with inline SVG wordmark logos, so the marquee never depends on an external file.
- **6 testimonials**, **6 blog posts** (590-635 words each), **1 settings document**, **1 admin user**.

Login after seeding: `admin@ramakripaestate.com` / `RamaKripa@2026` (from `.env`).

### Notes for the frontend

- `Blog.content` is **HTML** (`<h2>`, `<p>`, `<ul>`) - render it with `dangerouslySetInnerHTML`.
- `Setting.heroSlides` is an array of objects: `{ image, alt, eyebrow, title, subtitle }`.
- `Developer.logo` is an inline `data:image/svg+xml` URI - usable directly as an `<img src>`.
- Plots quote `price` **per square yard** (`priceUnit: 'per-sqyd'`) and rentals **per month**
  (`per-month`). Format using `priceUnit`, not the raw number.
- `meta.priceRange` is computed over sale listings priced as a total, so the budget dropdown is
  not skewed by per-sq-yd plot rates or monthly rents.
- `meta.filters.localities` merges distinct localities **and** sectors, because `?locality=`
  matches either field.
- `brochureUrl` and `videoUrl` are intentionally empty in the seed - hide those buttons when blank.

---

## 5. Project layout

```
backend/
  .env  .env.example  .gitignore  package.json  README.md
  src/
    server.js                 express app, CORS, JSON, morgan, 404 + error handler
    config/db.js              mongo connection + isDbConnected()
    models/                   Property Enquiry Blog Developer Testimonial Locality User Setting
    controllers/              property enquiry blog meta auth setting
    routes/                   property enquiry blog meta auth setting index
    middleware/               auth.js (protect, adminOnly) errorHandler.js asyncHandler.js
    utils/                    slugify.js  apiFeatures.js (filter/sort/pagination builders)
    seed/seed.js              the Faridabad data set
```

Reads use `.lean()`. Controllers are wrapped in `asyncHandler`, so every rejection reaches the
central `errorHandler` in `middleware/errorHandler.js`.
