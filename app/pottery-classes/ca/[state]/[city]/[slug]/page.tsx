import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { slugify, deslugify } from '@/lib/slugify'
import { Listing } from '@/lib/types'
import LeadForm from '@/app/pottery-classes/[state]/[city]/[slug]/LeadForm'

export const revalidate = 86400

interface Props {
  params: Promise<{ state: string; city: string; slug: string }>
}

async function getListing(state: string, city: string, slug: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .ilike('state', deslugify(state))
    .ilike('city', deslugify(city))
    .eq('country', 'CA')

  if (error || !data) return null

  return data.find((l: Listing) => slugify(l.name) === slug) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, city, slug } = await params
  const listing = await getListing(state, city, slug)
  if (!listing) return {}

  return {
    title: `${listing.name} — Pottery Classes in ${listing.city}, ${listing.state} | ClayFinder`,
    description: listing.description
      ? listing.description.slice(0, 160)
      : `Find pottery and ceramics classes at ${listing.name} in ${listing.city}, ${listing.state}.`,
  }
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('listings')
    .select('name, city, state')
    .eq('country', 'CA')

  return (data ?? [])
    .filter((l) => l.name && l.city && l.state)
    .map((l) => ({
      state: slugify(l.state),
      city: slugify(l.city),
      slug: slugify(l.name),
    }))
}

function buildJsonLd(listing: Listing) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    ...(listing.description && { description: listing.description }),
    ...(listing.phone && { telephone: listing.phone }),
    ...(listing.website && { url: listing.website }),
    ...(listing.price_range && { priceRange: listing.price_range }),
    address: {
      '@type': 'PostalAddress',
      ...(listing.full_address && { streetAddress: listing.full_address }),
      ...(listing.city && { addressLocality: listing.city }),
      ...(listing.state && { addressRegion: listing.state }),
      ...(listing.postal_code && { postalCode: listing.postal_code }),
      addressCountry: 'CA',
    },
    ...(listing.latitude && listing.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: listing.latitude,
        longitude: listing.longitude,
      },
    }),
  }
}

function PriceRange({ value }: { value: string | null }) {
  if (!value) return null
  const filled = value.length
  const empty = 3 - filled
  return (
    <span className="font-medium">
      <span className="text-stone-800">{'$'.repeat(filled)}</span>
      <span className="text-stone-300">{'$'.repeat(empty)}</span>
    </span>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
      {children}
    </span>
  )
}

function FeaturePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-700 text-sm px-3 py-1.5 rounded-full">
      <span className="text-green-500">✓</span> {label}
    </span>
  )
}

function parseHours(raw: string | null): Record<string, string> | null {
  if (!raw) return null
  try {
    const json = raw
      .replace(/'/g, '"')
      .replace(/\[([^\]]*)\]/g, (_, v: string) => {
        const values = v.match(/"([^"]*)"/g)?.map(s => s.slice(1, -1))
        if (values && values.length > 0) return `"${values.join(' / ')}"`
        return `"${v.trim()}"`
      })
    return JSON.parse(json)
  } catch {
    return null
  }
}

export default async function CaListingPage({ params }: Props) {
  const { state, city, slug } = await params
  const listing = await getListing(state, city, slug)

  if (!listing) notFound()

  const hours = parseHours(listing.working_hours)
  const cityLabel = deslugify(city)
  const stateLabel = deslugify(state)

  const features: string[] = [
    listing.drop_in_available && 'Drop-in Available',
    listing.open_studio_access && 'Open Studio Access',
    listing.kids_classes && 'Kids Classes',
    listing.private_events && 'Private Events',
    listing.byob_events && 'BYOB / Sip & Spin',
    listing.date_night && 'Date Night',
    listing.firing_services && 'Firing Services',
    listing.sells_supplies && 'Supplies Available',
    listing.booking_required && 'Booking Required',
  ].filter(Boolean) as string[]

  const BASE_URL = 'https://www.clayfinder.com'

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(listing)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
              { '@type': 'ListItem', position: 2, name: 'Canada', item: `${BASE_URL}/pottery-classes/ca` },
              { '@type': 'ListItem', position: 3, name: stateLabel, item: `${BASE_URL}/pottery-classes/ca/${state}` },
              { '@type': 'ListItem', position: 4, name: cityLabel, item: `${BASE_URL}/pottery-classes/ca/${state}/${city}` },
              { '@type': 'ListItem', position: 5, name: listing.name },
            ],
          }),
        }}
      />
      {/* Breadcrumbs */}
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-stone-800">Home</Link>
        <span>/</span>
        <Link href="/pottery-classes/ca" className="hover:text-stone-800">Canada</Link>
        <span>/</span>
        <Link href={`/pottery-classes/ca/${state}`} className="hover:text-stone-800">{stateLabel}</Link>
        <span>/</span>
        <Link href={`/pottery-classes/ca/${state}/${city}`} className="hover:text-stone-800">{cityLabel}</Link>
        <span>/</span>
        <span className="text-stone-800">{listing.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {listing.studio_type && <Badge>{listing.studio_type}</Badge>}
          {listing.business_status === 'OPERATIONAL' && (
            <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">Open</span>
          )}
          {listing.price_range && <PriceRange value={listing.price_range} />}
        </div>
        <h1 className="text-3xl font-bold text-stone-900">{listing.name}</h1>
        {listing.reviews_count != null && listing.reviews_count > 0 && (
          <p className="text-stone-500 mt-1">{listing.reviews_count.toLocaleString()} Google reviews</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Left: Info */}
        <div className="space-y-4">
          {listing.full_address && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">Address</p>
              <p className="text-stone-700">{listing.full_address}</p>
            </div>
          )}
          {listing.phone && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">Phone</p>
              <a href={`tel:${listing.phone}`} className="text-amber-700 hover:underline">{listing.phone}</a>
            </div>
          )}
          {listing.website && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">Website</p>
              <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline break-all">
                {listing.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {listing.email && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">Email</p>
              <a href={`mailto:${listing.email}`} className="text-amber-700 hover:underline">{listing.email}</a>
            </div>
          )}
          {hours && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Hours</p>
              <div className="space-y-1">
                {(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] as const)
                  .filter(day => day in hours)
                  .map(day => (
                    <div key={day} className="flex justify-between text-sm text-stone-700">
                      <span className="font-medium w-28">{day}</span>
                      <span>{hours[day]}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {!hours && listing.working_hours && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">Hours</p>
              <p className="text-stone-700 text-sm">{listing.working_hours}</p>
            </div>
          )}
        </div>

        {/* Right: Map */}
        {listing.latitude && listing.longitude && (
          <div className="rounded-xl overflow-hidden border border-stone-200 h-64 md:h-auto">
            <iframe
              src={`https://maps.google.com/maps?q=${listing.latitude},${listing.longitude}&z=15&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '256px' }}
              allowFullScreen
              loading="lazy"
              title={`Map of ${listing.name}`}
            />
          </div>
        )}
      </div>

      {/* Description */}
      {listing.description && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-stone-800 mb-2">About</h2>
          <p className="text-stone-600 leading-relaxed">{listing.description}</p>
        </div>
      )}

      {/* Class Types & Skill Levels */}
      {(listing.class_types?.length || listing.skill_levels?.length) && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-stone-800 mb-3">Classes Offered</h2>
          <div className="flex flex-wrap gap-2">
            {listing.class_types?.map(t => <Badge key={t}>{t}</Badge>)}
            {listing.skill_levels?.map(l => (
              <span key={l} className="inline-block bg-stone-100 text-stone-700 text-xs font-medium px-2.5 py-1 rounded-full">{l}</span>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      {features.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-stone-800 mb-3">Features</h2>
          <div className="flex flex-wrap gap-2">
            {features.map(f => <FeaturePill key={f} label={f} />)}
          </div>
        </div>
      )}

      {/* Membership Model */}
      {listing.membership_model && (
        <div className="mb-10 p-4 bg-stone-50 rounded-xl border border-stone-200">
          <h2 className="text-lg font-semibold text-stone-800 mb-1">Membership</h2>
          <p className="text-stone-600 text-sm">{listing.membership_model}</p>
        </div>
      )}

      {/* Lead Capture Form */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-stone-800 mb-1">Interested in this studio?</h2>
        <p className="text-stone-500 text-sm mb-4">Send a message and we'll forward it to {listing.name}.</p>
        <LeadForm studioName={listing.name} />
      </div>

      {/* Back links */}
      <div className="border-t border-stone-200 pt-6 flex gap-4 text-sm">
        <Link href={`/pottery-classes/ca/${state}/${city}`} className="text-amber-700 hover:underline">
          ← All studios in {cityLabel}
        </Link>
        <Link href={`/pottery-classes/ca/${state}`} className="text-amber-700 hover:underline">
          ← All studios in {stateLabel}
        </Link>
      </div>
    </main>
  )
}
