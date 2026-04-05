# ClayFinder — Claude Code Context

## What This Project Is

ClayFinder (clayfinder.com) is a niche directory website for pottery and ceramics studios
across the US (Canada and Australia to follow). It surfaces enriched studio listings from
a Supabase database populated by the `pottery-directory` data pipeline.

The goal: rank for "pottery classes near me" and related keywords, generate leads for studios,
and monetize via display ads and featured listings.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + shadcn/ui (Nova/Radix preset) |
| Database | Supabase (shared with pottery-directory pipeline) |
| Hosting | Vercel |
| Email (leads) | Resend (TODO — not yet wired up) |
| Maps | Google Maps iframe embed |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Set these in `.env.local` for local dev and in Vercel dashboard for production.

---

## Repo Structure

```
app/
  page.tsx                                    ← Homepage (hero + search + state grid)
  layout.tsx                                  ← Root layout with Navbar
  sitemap.ts                                  ← Auto-generated sitemap.xml from Supabase
  robots.ts                                   ← robots.txt (allows all, blocks /api/)
  components/
    Navbar.tsx                                ← Sticky top nav with ClayFinder logo
    SearchBar.tsx                             ← Client-side city autocomplete search
  pottery-classes/
    [state]/
      page.tsx                                ← State page — city grid
      [city]/
        page.tsx                              ← City page — listing cards
        [slug]/
          page.tsx                            ← Listing page (main page type)
          LeadForm.tsx                        ← Client-side lead capture form
  api/
    contact/route.ts                          ← Lead form handler — stores to Supabase leads table
    debug/route.ts                            ← Debug endpoint (remove before launch)
lib/
  supabase.ts                                 ← Supabase client (anon key)
  types.ts                                    ← Listing TypeScript interface
  slugify.ts                                  ← slugify() and deslugify() utilities
```

---

## URL Structure

```
/                                             ← Homepage
/pottery-classes/[state]/                     ← State page (e.g. /pottery-classes/california)
/pottery-classes/[state]/[city]/              ← City page (e.g. /pottery-classes/california/los-angeles)
/pottery-classes/[state]/[city]/[slug]/       ← Listing page (e.g. /pottery-classes/california/los-angeles/the-house-of-clay-la)
```

Slugs are generated with `slugify()` — lowercase, hyphens, alphanumeric only.
Lookups use Supabase `ilike` on state + city, then JS `.find()` by slug match on name.

---

## Data Source

All listing data comes from the `listings` table in Supabase, populated by the
`pottery-directory` pipeline. The table has a composite PK: `(name, postal_code, country)`.

**Current data:** 1,993 US listings as of 2026-04-05, 67.5% enriched.

Key fields used by the website:

| Field | Used on |
|---|---|
| `name` | All pages |
| `city`, `state`, `country` | Routing + page headers |
| `full_address`, `phone`, `email`, `website` | Listing page |
| `latitude`, `longitude` | Google Maps embed |
| `working_hours` | Listing page (parsed from Python dict string) |
| `business_status` | Open badge |
| `reviews_count` | Review count display |
| `description` | Listing page + city page cards |
| `class_types`, `skill_levels` | Badges on listing + city pages |
| `price_range` | `$` / `$$` / `$$$` display |
| `studio_type` | Badge |
| `drop_in_available`, `open_studio_access`, `kids_classes`, `private_events`, `byob_events`, `date_night`, `firing_services`, `sells_supplies`, `booking_required` | Feature pills |
| `membership_model` | Membership section |

---

## Supabase Tables

### `listings` (read-only from website)
Source: pottery-directory pipeline. RLS enabled with public SELECT policy.

### `leads` (write from website)
Stores lead form submissions from listing pages.

```sql
create table leads (
  id           bigserial primary key,
  name         text not null,
  email        text not null,
  phone        text,
  message      text not null,
  studio_name  text not null,
  submitted_at timestamptz not null
);
```

RLS enabled with public INSERT policy.

---

## Key Implementation Details

### Rendering Strategy
- All pages use `export const revalidate = 86400` (ISR, 24h)
- `generateStaticParams` on all dynamic routes — pre-generates state, city, and listing pages at build time
- `dynamicParams = true` (default) — unknown slugs rendered on demand

### Hours Parsing
OutScraper stores hours as a Python dict string with list values:
`{'Monday': ['9a.m.-5p.m.'], 'Tuesday': ['Closed']}`

The `parseHours()` function in the listing page converts single quotes to double quotes
and unwraps list values before `JSON.parse`. Days are then sorted Monday → Sunday.

### Slug Lookup
The listing page queries all listings for a city/state, then finds by slug:
```typescript
data.find(l => slugify(l.name) === params.slug)
```
No slug column in Supabase — computed at runtime. Works fine for city-level result sets.

### Lead Form
- Client component (`LeadForm.tsx`) — POSTs to `/api/contact`
- API route stores to Supabase `leads` table
- Email delivery via Resend — **not yet implemented** (TODO)

---

## SEO Foundations

### Keyword Cluster
- Primary: `pottery classes near me` (KD 4, 110k SV/mo)
- Co-primary: `ceramics classes near me` (KD 3, 110k SV/mo)
- Total cluster SV: ~260k+/month
- Full cluster details: see `context/keyword_cluster.md` in the pottery-directory repo

### On-Page SEO Applied
- One H1 per page, always keyword-containing
- `generateMetadata()` on every page type with keyword-rich titles + descriptions
- Breadcrumbs on all listing and city pages with internal links up the hierarchy
- `sitemap.xml` auto-generated from Supabase data (`app/sitemap.ts`)
- `robots.txt` allows full crawl, blocks `/api/` (`app/robots.ts`)

### Meta Title Patterns
| Page | Pattern |
|---|---|
| Homepage | `Find Pottery and Ceramics Classes Near Me \| ClayFinder` |
| State | `Pottery Classes in [State] \| ClayFinder` |
| City | `Pottery Classes in [City], [State] \| ClayFinder` |
| Listing | `[Business Name] — Pottery Classes in [City], [State] \| ClayFinder` |

---

## TODO Before / After Launch

### Before launch
- [ ] Delete or gate `app/api/debug/route.ts`
- [ ] Wire up Resend for lead email delivery
- [ ] Deploy to Vercel + connect clayfinder.com domain (via Porkbun DNS)
- [ ] Add Google Analytics
- [ ] Submit sitemap to Google Search Console

### After launch
- [ ] Google Search Console: verify domain + submit sitemap
- [ ] Run Ahrefs Webmaster Tools audit
- [ ] Add LocalBusiness JSON-LD schema to listing pages
- [ ] Design polish pass
- [ ] User auth + business dashboard (claimed listings)
- [ ] CA and AU data pipeline runs + import

---

## Competitors to Monitor

| Competitor | Type | Threat level |
|---|---|---|
| ClassBento (classbento.com) | Paid booking marketplace | Medium — different model, strong in major metros |
| KilnFire.com | Thin directory | Low — beatable on content depth |
| Yelp | General directory | Low — not niche-focused |
