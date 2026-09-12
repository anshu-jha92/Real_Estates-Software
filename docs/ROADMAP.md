# Rama Kripa Estates — Roadmap & Work Flow

Yeh document batata hai ki **kya ban chuka hai**, **kaise chalana hai**, aur **aage kya-kya karna hai**.

---

## Phase 0 — Foundation (DONE)

| # | Kya bana | Kahan |
|---|---|---|
| 1 | Dono reference sites (Gaurav Properties, Anupam Properties) ka poora structure analyse | — |
| 2 | Binding build spec — colours, fonts, file tree, API contract, sab kuch | `docs/BUILD_SPEC.md` |
| 3 | Brand identity — naam, tagline, palette, logo design brief | `docs/BUILD_SPEC.md` §2, §12 |

**Brand decisions (locked):**

- Naam: **Rama Kripa Estates** · Tagline: *"Blessings in Every Address"*
- Colours: Deep Green `#0F3D2E` (trust, growth) + Champagne Gold `#C9A227` (premium, prosperity) on Cream `#FAF7F1`
  → Gaurav ka gold/black aur Anupam ka yellow/black dono se alag, lekin usi "premium property consultant" family me.
- Fonts: **Playfair Display** (headings — serif, luxury) + **Plus Jakarta Sans** (body — clean, readable)
- Logo: inline SVG monogram — mandir-arch + diya flame + interlocking **R**/**K**, gold on green.

---

## Phase 1 — Build (DONE)

### Backend — `backend/`

Node + Express + Mongoose, MongoDB Atlas ready.

```
src/
  models/     Property, Enquiry, Blog, Developer, Testimonial, Locality, User, Setting
  controllers/ property, enquiry, blog, meta, auth, setting
  routes/     /api/properties /api/enquiries /api/blogs /api/meta /api/auth /api/settings
  middleware/ auth (JWT), errorHandler, asyncHandler
  seed/       24+ real Faridabad properties + localities + developers + testimonials + blogs
```

Key endpoints:

| Method | Path | Kaam |
|---|---|---|
| GET | `/api/properties` | Search + 12 filters + sort + pagination |
| GET | `/api/properties/:slug` | Detail + 4 similar properties |
| GET | `/api/meta/filters` | Dropdown options — **database se aate hain**, hardcoded nahi |
| GET | `/api/meta/stats` | Category-wise counts (home page cards) |
| POST | `/api/enquiries` | Lead capture (rate-limited, spam-protected) |
| POST | `/api/auth/login` | Admin login → JWT |
| CRUD | `/api/properties`, `/api/blogs`, `/api/settings` | Admin-only, token required |

### Frontend — `frontend/`

React 18 + Vite (client-side rendering, jaisa aapne kaha) + React Router v6. Koi Tailwind nahi — pura custom
design system taki look 100% apna rahe.

**Home page sections (upar se neeche):**

1. Top bar — address, hours, "Call to Expert" gold pill, social icons
2. Sticky header — logo, dropdown nav, "Enquire Now" button, mobile drawer
3. **Hero** — Faridabad/NCR skyline ki 4 images ka Ken-Burns moving slideshow + rotating word (Homes/Plots/Offices/Shops)
4. **Search bar** — Buy/Rent/Plots/Commercial tabs + keyword + type + location + min/max price → `/properties?...`
5. Category strip — 5 cards with **live counts** database se
6. Featured Properties — tab filter + card grid
7. Stats band — count-up animation
8. Why Choose Us — 6 cards
9. Locality showcase — Faridabad sectors ka mosaic grid
10. Trending split · Developer marquee · Testimonials · Blog teaser
11. CTA enquiry form + **working Faridabad Google Map**
12. Footer + floating WhatsApp/Call buttons

**Pages:** Home · Properties (filters) · Property Detail · Localities · About · Contact · Enquiry · Blog · Blog Detail · Privacy · Terms · 404
**Admin:** Login · Dashboard · Properties (add/edit/delete) · Enquiries (+CSV export) · Blogs · Site Settings

Filters URL query string me hain — matlab link share kar sakte ho, back button chalta hai, page refresh pe filter zinda rehta hai.

---

## Kaise chalayein (local)

**0. Database — MongoDB Atlas (ab yahi use ho raha hai)**

`backend/.env` mein `MONGO_URI` Atlas cluster `cluster0.wis3ujq` pe set hai, database `ramakripa`.

> ⚠️ **Zaroori:** SRV string mein database ka naam `?` se pehle hona chahiye:
> `...mongodb.net/ramakripa?retryWrites=true&w=majority`
> Naam chhoot gaya to Mongoose chupchaap `test` database se connect ho jata hai — koi error nahi aata, bas site khali dikhti hai. Ye galti pakadne ke liye ab backend startup pe warning deta hai.

**1. Backend**

```bash
cd backend && npm install && npm run seed && npm run dev
```

**2. Frontend** (naya terminal)

```bash
cd frontend && npm install && npm run dev
```

Site: `http://localhost:5173` · API: `http://localhost:5000/api` · Admin: `http://localhost:5173/admin/login`

**MongoDB Atlas jodne ke liye:** `backend/.env` me `MONGO_URI` ko apne Atlas connection string se badal dein, phir `npm run seed` dobara chalayein.

---

## Phase 2 — Aage ka kaam (aapke confirm karne ke baad)

| # | Task | Kyun zaroori | Effort |
|---|---|---|---|
| 1 | **Real content** — asli properties, photos, brochures, office address, phone numbers | Abhi seed data demo hai | Aapka input chahiye |
| 2 | ~~**Image upload** — Cloudinary~~ ✅ **HO GAYA** — admin panel mein har image field pe file upload + URL dono. Auto resize (max 2000px) + WebP/AVIF conversion. | Client khud photo daal sake | done |
| 3 | **WhatsApp + Email notification** on new enquiry (Nodemailer + WhatsApp Business API) | Lead miss na ho | 1 din |
| 4 | **SEO** — react-helmet, sitemap.xml, robots.txt, JSON-LD schema (RealEstateListing, LocalBusiness), pretty URLs | Google me Faridabad property searches pe rank | 2 din |
| 5 | **Performance** — image CDN + WebP, route preloading, Lighthouse 90+ | Fast & furious jaisa aapne kaha | 1 din |
| 6 | **Deployment** — frontend Vercel/Netlify, backend Render/Railway, MongoDB Atlas, custom domain + SSL | Live jaana | 1 din |
| 7 | **Analytics** — Google Analytics 4 + Search Console + Meta Pixel | Lead tracking | Half day |
| 8 | Optional: property comparison, EMI calculator, saved/shortlist page, site-visit scheduler with calendar | Conversion badhane ke liye | 2-3 din |

---

## Decisions jo aapko lene hain

1. **Domain naam** — `ramakripaestate.com` available hai? Alternative sochein.
2. **Asli contact details** — office address, phone numbers, email, WhatsApp number, business hours.
3. **Logo** — abhi maine SVG me design kiya hai. Chahiye to colour/shape change kar dunga, ya aapka existing logo lagana ho to bhejein.
4. **Properties ka data** — Excel/sheet me de dein to main bulk import script bana dunga.
5. **Enquiry kahan jaaye** — email pe, WhatsApp pe, ya dono?
