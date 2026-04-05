import Link from 'next/link'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'
import SearchBar from './components/SearchBar'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Find Pottery and Ceramics Classes Near Me | ClayFinder',
  description: 'Find pottery and ceramics classes near you. Browse local studios offering wheel throwing, hand building, open studio access, BYOB events, and more across the US.',
}

interface StateGroup {
  state: string
  count: number
}

async function getStates(): Promise<StateGroup[]> {
  const { data } = await supabase
    .from('listings')
    .select('state')
    .eq('country', 'US')
    .not('state', 'is', null)

  if (!data) return []

  const counts: Record<string, number> = {}
  for (const row of data) {
    if (!row.state) continue
    counts[row.state] = (counts[row.state] ?? 0) + 1
  }

  return Object.entries(counts)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count || a.state.localeCompare(b.state))
}

export default async function HomePage() {
  const states = await getStates()
  const totalStudios = states.reduce((sum, s) => sum + s.count, 0)

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
          {totalStudios.toLocaleString()} studios across {states.length} states
        </p>
      </section>

      {/* Country selector */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Browse by Country</h2>
        <p className="text-stone-500 mb-6">Select your country to find pottery and ceramics classes near you.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="#states"
            className="flex items-center gap-4 border border-stone-200 rounded-xl px-5 py-4 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <span className="text-3xl">🇺🇸</span>
            <div>
              <p className="font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">United States</p>
              <p className="text-xs text-stone-400 mt-0.5">{totalStudios.toLocaleString()} studios · {states.length} states</p>
            </div>
          </a>
          {[
            { flag: '🇨🇦', name: 'Canada' },
            { flag: '🇦🇺', name: 'Australia' },
          ].map(({ flag, name }) => (
            <div
              key={name}
              className="flex items-center gap-4 border border-stone-200 border-dashed rounded-xl px-5 py-4 opacity-50 cursor-not-allowed"
            >
              <span className="text-3xl">{flag}</span>
              <div>
                <p className="font-semibold text-stone-600">{name}</p>
                <p className="text-xs text-stone-400 mt-0.5">Coming soon</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* States grid */}
      <section id="states" className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">
          Find Pottery Classes Near You
        </h2>
        <p className="text-stone-500 mb-6">Browse ceramics studios and pottery classes by state.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {states.map(({ state, count }) => (
            <Link
              key={state}
              href={`/pottery-classes/${slugify(state)}`}
              className="flex items-center justify-between border border-stone-200 rounded-xl px-4 py-3 hover:border-amber-400 hover:shadow-sm transition-all group"
            >
              <span className="font-medium text-stone-800 group-hover:text-amber-700 transition-colors text-sm">
                {state}
              </span>
              <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                {count}
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
