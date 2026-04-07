# ClayFinder

A niche directory of pottery and ceramics studios across the US, Canada, and Australia. Built to rank for "pottery classes near me" and related keywords, generate leads for studios, and monetize via display ads and featured listings.

**Live site:** [clayfinder.com](https://www.clayfinder.com)

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase |
| Hosting | Vercel |
| Email | Resend |
| Maps | Google Maps iframe embed |

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
```

---

## Project Structure

```
app/
  page.tsx                          ← Homepage
  layout.tsx                        ← Root layout (Navbar + Footer + GA4)
  sitemap.ts                        ← Auto-generated sitemap (US + AU + CA)
  robots.ts                         ← robots.txt
  about/page.tsx                    ← About page
  contact/page.tsx                  ← Contact page
  privacy/page.tsx                  ← Privacy policy
  terms/page.tsx                    ← Terms of service
  components/
    Navbar.tsx
    Footer.tsx
    SearchBar.tsx
  pottery-classes/
    us/page.tsx                     ← US landing (states grid + FAQs)
    [state]/page.tsx                ← US state page (cities grid)
    [state]/[city]/page.tsx         ← US city page (listings)
    [state]/[city]/[slug]/page.tsx  ← US listing page
    [state]/[city]/[slug]/LeadForm.tsx
    au/                             ← Australia (mirrors US structure)
    ca/                             ← Canada (mirrors US structure)
  api/
    contact/route.ts                ← Lead form handler (Supabase + Resend)
lib/
  supabase.ts
  types.ts
  slugify.ts
scripts/
  seo_audit.py                      ← DataForSEO on-page audit script
```

---

## URL Structure

```
/                                         ← Homepage
/pottery-classes/us/                      ← US landing
/pottery-classes/[state]/                 ← US state
/pottery-classes/[state]/[city]/          ← US city
/pottery-classes/[state]/[city]/[slug]/   ← US listing
/pottery-classes/au/                      ← Australia landing
/pottery-classes/au/[state]/[city]/[slug]/
/pottery-classes/ca/                      ← Canada landing
/pottery-classes/ca/[state]/[city]/[slug]/
```

---

## SEO Implementation

- `generateMetadata()` with keyword-rich titles + descriptions on every page type
- `alternates.canonical` set on every page (prevents www vs non-www duplication)
- `LocalBusiness` JSON-LD schema on all listing pages
- `BreadcrumbList` JSON-LD schema on all listing pages
- `FAQPage` JSON-LD schema on US, AU, and CA landing pages
- Breadcrumb navigation with full country → state → city → listing hierarchy
- Intro copy on all state and city hub pages (thin content prevention)
- Fallback description on listing pages without database descriptions
- `sitemap.xml` auto-generated from Supabase (all US + AU + CA pages)
- `robots.txt` allows full crawl, blocks `/api/`

---

## DataForSEO Audit Script

```bash
# One-time setup
pip install requests python-dotenv
cp scripts/.env.example scripts/.env   # fill in credentials

# Run
python scripts/seo_audit.py
```

Crawls clayfinder.com via DataForSEO On-Page API (~$0.75–$1.50/run) and writes `scripts/seo_audit_report.txt`.

---

## Deployment

Push to `main` → Vercel auto-deploys. All pages use ISR (`revalidate = 86400`).
