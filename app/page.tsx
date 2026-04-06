import Link from 'next/link'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import SearchBar from './components/SearchBar'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Find Pottery and Ceramics Classes Near Me | ClayFinder',
  description: 'Find pottery and ceramics classes near you. Browse local studios offering wheel throwing, hand building, open studio access, BYOB events, and more across the US, Canada, and Australia.',
}

interface CountryStats {
  studios: number
  regions: number
}

async function getCountryStats(country: string): Promise<CountryStats> {
  const { data } = await supabase
    .from('listings')
    .select('state')
    .eq('country', country)
    .not('state', 'is', null)

  if (!data) return { studios: 0, regions: 0 }
  const uniqueRegions = new Set(data.map(r => r.state).filter(Boolean))
  return { studios: data.length, regions: uniqueRegions.size }
}

interface PopularCity {
  label: string
  href: string
}

const POPULAR_CITIES: PopularCity[] = [
  { label: 'Los Angeles, CA', href: '/pottery-classes/california/los-angeles' },
  { label: 'New York, NY', href: '/pottery-classes/new-york/new-york' },
  { label: 'Chicago, IL', href: '/pottery-classes/illinois/chicago' },
  { label: 'Houston, TX', href: '/pottery-classes/texas/houston' },
  { label: 'Seattle, WA', href: '/pottery-classes/washington/seattle' },
  { label: 'Denver, CO', href: '/pottery-classes/colorado/denver' },
  { label: 'Portland, OR', href: '/pottery-classes/oregon/portland' },
  { label: 'Austin, TX', href: '/pottery-classes/texas/austin' },
  { label: 'Sydney, NSW', href: '/pottery-classes/au/new-south-wales/sydney' },
  { label: 'Melbourne, VIC', href: '/pottery-classes/au/victoria/melbourne' },
  { label: 'Toronto, ON', href: '/pottery-classes/ca/ontario/toronto' },
  { label: 'Vancouver, BC', href: '/pottery-classes/ca/british-columbia/vancouver' },
]

export default async function HomePage() {
  const [us, au, ca] = await Promise.all([
    getCountryStats('US'),
    getCountryStats('AU'),
    getCountryStats('CA'),
  ])

  const totalStudios = us.studios + au.studios + ca.studios

  return (
    <main>
      {/* Hero */}
      <section className="bg-amber-50 border-b border-amber-100 px-4 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-3">
          Find Pottery and Ceramics Classes Near Me
        </h1>
        <p className="text-stone-600 text-lg mb-8 max-w-xl mx-auto">
          Discover local studios offering wheel throwing, hand building, open studio memberships, and more.
        </p>
        <div className="flex justify-center">
          <SearchBar />
        </div>
        <p className="text-stone-400 text-sm mt-4">
          {totalStudios.toLocaleString()} studios across the US, Canada, and Australia
        </p>
      </section>

      {/* Country selector */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Browse by Country</h2>
        <p className="text-stone-500 mb-6">Select your country to find pottery and ceramics classes near you.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/pottery-classes/us"
            className="flex items-center gap-4 border border-stone-200 rounded-xl px-5 py-4 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <span className="text-3xl">🇺🇸</span>
            <div>
              <p className="font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">United States</p>
              <p className="text-xs text-stone-400 mt-0.5">{us.studios.toLocaleString()} studios · {us.regions} states</p>
            </div>
          </a>
          <a
            href="/pottery-classes/ca"
            className="flex items-center gap-4 border border-stone-200 rounded-xl px-5 py-4 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <span className="text-3xl">🇨🇦</span>
            <div>
              <p className="font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">Canada</p>
              <p className="text-xs text-stone-400 mt-0.5">{ca.studios.toLocaleString()} studios · {ca.regions} provinces</p>
            </div>
          </a>
          <a
            href="/pottery-classes/au"
            className="flex items-center gap-4 border border-stone-200 rounded-xl px-5 py-4 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <span className="text-3xl">🇦🇺</span>
            <div>
              <p className="font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">Australia</p>
              <p className="text-xs text-stone-400 mt-0.5">{au.studios.toLocaleString()} studios · {au.regions} states</p>
            </div>
          </a>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Popular Cities</h2>
        <p className="text-stone-500 mb-6">Jump straight to pottery studios in a major city.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {POPULAR_CITIES.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="border border-stone-200 rounded-xl px-4 py-3 hover:border-amber-400 hover:shadow-sm transition-all group"
            >
              <span className="font-medium text-stone-800 group-hover:text-amber-700 transition-colors text-sm">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why ClayFinder */}
      <section className="bg-stone-50 border-t border-stone-200 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-900 mb-8 text-center">
            Find the Right Ceramics Studio Near You
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-stone-800 mb-1">Filter by what matters</h3>
              <p className="text-stone-500 text-sm">Beginner-friendly, BYOB, date night, kids classes, open studio — find exactly what you need.</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📍</div>
              <h3 className="font-semibold text-stone-800 mb-1">Local studios, curated</h3>
              <p className="text-stone-500 text-sm">Every listing is a verified pottery or ceramics studio — no paint-your-own pottery or supply stores.</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🏺</div>
              <h3 className="font-semibold text-stone-800 mb-1">Wheel throwing to hand building</h3>
              <p className="text-stone-500 text-sm">Browse studios by class type, skill level, and price range to find your perfect fit.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
