import Link from 'next/link'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Pottery Classes in Australia | ClayFinder',
  description: 'Find pottery and ceramics classes across Australia. Browse local studios offering wheel throwing, hand building, open studio memberships, and more.',
}

interface StateGroup {
  state: string
  count: number
}

async function getStates(): Promise<StateGroup[]> {
  const { data } = await supabase
    .from('listings')
    .select('state')
    .eq('country', 'AU')
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

export default async function AustraliaPage() {
  const states = await getStates()
  const totalStudios = states.reduce((sum, s) => sum + s.count, 0)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-stone-800">Home</Link>
        <span>/</span>
        <span className="text-stone-800">Australia</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">
          Pottery Classes in Australia
        </h1>
        <p className="text-stone-600 mt-2 text-base">
          Find ceramics classes and pottery studios across Australia — {totalStudios.toLocaleString()} studio{totalStudios !== 1 ? 's' : ''} across {states.length} state{states.length !== 1 ? 's' : ''} and territories.
        </p>
      </div>

      {/* States grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {states.map(({ state, count }) => (
          <Link
            key={state}
            href={`/pottery-classes/au/${slugify(state)}`}
            className="flex items-center justify-between border border-stone-200 rounded-xl px-4 py-3 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <span className="font-medium text-stone-800 group-hover:text-amber-700 transition-colors">
              {state}
            </span>
            <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
              {count}
            </span>
          </Link>
        ))}
      </div>

      {/* Back to home */}
      <div className="border-t border-stone-200 pt-6 mt-10">
        <Link href="/" className="text-amber-700 hover:underline text-sm">
          ← Browse all countries
        </Link>
      </div>
    </main>
  )
}
