import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { slugify, deslugify } from '@/lib/slugify'
import { Listing } from '@/lib/types'

export const revalidate = 86400

interface Props {
  params: Promise<{ state: string; city: string }>
}

async function getListings(state: string, city: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .ilike('state', deslugify(state))
    .ilike('city', deslugify(city))
    .eq('country', 'AU')
    .order('name')

  if (error || !data) return []
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, city } = await params
  const cityLabel = deslugify(city)
  const stateLabel = deslugify(state)

  return {
    title: `Pottery Classes in ${cityLabel}, ${stateLabel} | ClayFinder`,
    description: `Find pottery and ceramics classes in ${cityLabel}, ${stateLabel}. Browse local studios offering wheel throwing, hand building, open studio access, and more.`,
  }
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('listings')
    .select('city, state')
    .eq('country', 'AU')

  const seen = new Set<string>()
  const params: { state: string; city: string }[] = []

  for (const l of data ?? []) {
    if (!l.city || !l.state) continue
    const key = `${l.state}|${l.city}`
    if (seen.has(key)) continue
    seen.add(key)
    params.push({ state: slugify(l.state), city: slugify(l.city) })
  }

  return params
}

function PriceRange({ value }: { value: string | null }) {
  if (!value) return null
  return <span className="text-stone-500 text-sm">{'$'.repeat(value.length)}</span>
}

export default async function AuCityPage({ params }: Props) {
  const { state, city } = await params
  const listings = await getListings(state, city)

  if (listings.length === 0) notFound()

  const cityLabel = deslugify(city)
  const stateLabel = deslugify(state)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-stone-800">Home</Link>
        <span>/</span>
        <Link href="/pottery-classes/au" className="hover:text-stone-800">Australia</Link>
        <span>/</span>
        <Link href={`/pottery-classes/au/${state}`} className="hover:text-stone-800">{stateLabel}</Link>
        <span>/</span>
        <span className="text-stone-800">{cityLabel}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900">
          Pottery Classes in {cityLabel}, {stateLabel}
        </h1>
        <p className="text-stone-500 mt-2 text-sm">
          {listings.length} studio{listings.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Intro */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl px-5 py-4 mb-8 text-stone-600 text-sm leading-relaxed">
        <p>
          Browse pottery and ceramics studios in {cityLabel}, {stateLabel}. Whether you&apos;re a complete
          beginner or an experienced ceramicist looking for open studio access, the studios below offer a range
          of options — from wheel throwing classes and hand building workshops to BYOB pottery nights, kids
          classes, and private event bookings. Click any studio to see hours, contact details, and to send an enquiry.
        </p>
      </div>

      {/* Listings grid */}
      <div className="space-y-4">
        {listings.map((listing) => (
          <Link
            key={listing.name}
            href={`/pottery-classes/au/${state}/${city}/${slugify(listing.name)}`}
            className="block border border-stone-200 rounded-xl p-5 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {listing.studio_type && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                      {listing.studio_type}
                    </span>
                  )}
                  {listing.business_status === 'OPERATIONAL' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Open</span>
                  )}
                </div>
                <h3 className="font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
                  {listing.name}
                </h3>
                {listing.full_address && (
                  <p className="text-stone-500 text-sm mt-0.5 truncate">{listing.full_address}</p>
                )}
                {listing.description && (
                  <p className="text-stone-600 text-sm mt-2 line-clamp-2">{listing.description}</p>
                )}
                {/* Feature pills */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {listing.class_types?.slice(0, 3).map(t => (
                    <span key={t} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                  {listing.kids_classes && (
                    <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">Kids Classes</span>
                  )}
                  {listing.byob_events && (
                    <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">BYOB</span>
                  )}
                  {listing.date_night && (
                    <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">Date Night</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <PriceRange value={listing.price_range} />
                {listing.reviews_count != null && listing.reviews_count > 0 && (
                  <p className="text-xs text-stone-400 mt-1">{listing.reviews_count} reviews</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Back to state */}
      <div className="border-t border-stone-200 pt-6 mt-10">
        <Link href={`/pottery-classes/au/${state}`} className="text-amber-700 hover:underline text-sm">
          ← All pottery studios in {stateLabel}
        </Link>
      </div>
    </main>
  )
}
