import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { slugify, deslugify } from '@/lib/slugify'

export const revalidate = 86400

interface Props {
  params: Promise<{ state: string }>
}

interface CityGroup {
  city: string
  count: number
}

async function getCities(state: string): Promise<CityGroup[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('city')
    .ilike('state', deslugify(state))
    .eq('country', 'CA')
    .not('city', 'is', null)

  if (error || !data) return []

  const counts: Record<string, number> = {}
  for (const row of data) {
    if (!row.city) continue
    counts[row.city] = (counts[row.city] ?? 0) + 1
  }

  return Object.entries(counts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params
  const stateLabel = deslugify(state)

  return {
    title: `Pottery Classes in ${stateLabel} | ClayFinder`,
    description: `Find pottery and ceramics classes across ${stateLabel}, Canada. Browse studios by city offering wheel throwing, hand building, open studio memberships, and more.`,
    alternates: { canonical: `https://www.clayfinder.com/pottery-classes/ca/${state}` },
  }
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('listings')
    .select('state')
    .eq('country', 'CA')

  const seen = new Set<string>()
  for (const l of data ?? []) {
    if (l.state) seen.add(slugify(l.state))
  }

  return [...seen].map(state => ({ state }))
}

export default async function CaStatePage({ params }: Props) {
  const { state } = await params
  const cities = await getCities(state)

  if (cities.length === 0) notFound()

  const stateLabel = deslugify(state)
  const totalListings = cities.reduce((sum, c) => sum + c.count, 0)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-stone-800">Home</Link>
        <span>/</span>
        <Link href="/pottery-classes/ca" className="hover:text-stone-800">Canada</Link>
        <span>/</span>
        <span className="text-stone-800">{stateLabel}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900">
          Pottery Classes in {stateLabel}
        </h1>
        <p className="text-stone-500 mt-2 text-sm">
          {totalListings} studio{totalListings !== 1 ? 's' : ''} across {cities.length} cit{cities.length !== 1 ? 'ies' : 'y'}
        </p>
      </div>

      {/* Intro */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl px-5 py-4 mb-8 text-stone-600 text-sm leading-relaxed">
        <p>
          Looking for pottery and ceramics classes in {stateLabel}, Canada? This page lists every studio
          we track across the province or territory — from beginner wheel throwing classes to open studio
          memberships, hand building workshops, and BYOB pottery nights. Select a city below to find ceramics
          studios near you.
        </p>
      </div>

      {/* Cities grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {cities.map(({ city, count }) => (
          <Link
            key={city}
            href={`/pottery-classes/ca/${state}/${slugify(city)}`}
            className="flex items-center justify-between border border-stone-200 rounded-xl px-4 py-3 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <span className="font-medium text-stone-800 group-hover:text-amber-700 transition-colors">
              {city}
            </span>
            <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
              {count}
            </span>
          </Link>
        ))}
      </div>

      {/* Back to Canada */}
      <div className="border-t border-stone-200 pt-6 mt-10">
        <Link href="/pottery-classes/ca" className="text-amber-700 hover:underline text-sm">
          ← All Canadian provinces & territories
        </Link>
      </div>
    </main>
  )
}
