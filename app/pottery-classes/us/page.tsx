import Link from 'next/link'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Pottery Classes in the United States | ClayFinder',
  description: 'Find pottery and ceramics classes across the United States. Browse local studios offering wheel throwing, hand building, open studio memberships, and more.',
  alternates: { canonical: 'https://www.clayfinder.com/pottery-classes/us' },
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

export default async function UsaPage() {
  const states = await getStates()
  const totalStudios = states.reduce((sum, s) => sum + s.count, 0)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-stone-800">Home</Link>
        <span>/</span>
        <span className="text-stone-800">United States</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">
          Pottery Classes in the United States
        </h1>
        <p className="text-stone-600 mt-2 text-base">
          Find ceramics classes and pottery studios across the US — {totalStudios.toLocaleString()} studio{totalStudios !== 1 ? 's' : ''} across {states.length} state{states.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* States grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {states.map(({ state, count }) => (
          <Link
            key={state}
            href={`/pottery-classes/${slugify(state)}`}
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

      {/* FAQs */}
      <section className="mt-12 border-t border-stone-200 pt-10">
        <h2 className="text-xl font-bold text-stone-900 mb-6">
          Frequently Asked Questions — Pottery Classes in the US
        </h2>
        <div className="space-y-5">
          {[
            {
              q: 'What types of pottery classes can I find in the United States?',
              a: 'US pottery studios offer a wide range of classes including wheel throwing, hand building, sculpting, and glazing. Many studios also offer open studio memberships for self-directed work, beginner-friendly drop-in sessions, BYOB pottery nights, date night events, kids classes, and private group bookings.',
            },
            {
              q: 'Do I need experience to take a pottery class?',
              a: 'No experience is needed for most pottery classes. The majority of studios listed on ClayFinder are beginner-friendly and provide all the tools, clay, and instruction you need to get started. Many offer dedicated beginner courses or drop-in wheel throwing sessions designed for first-timers.',
            },
            {
              q: 'How much do pottery classes cost in the US?',
              a: 'Pricing varies by studio and class type. Drop-in wheel throwing sessions typically cost $25–$60. Multi-week beginner courses usually run $150–$400. Open studio monthly memberships range from $80–$200/month. Many studios include clay, tools, and glazing in their pricing.',
            },
            {
              q: 'What is the difference between wheel throwing and hand building?',
              a: 'Wheel throwing uses a spinning pottery wheel to shape clay — you centre the clay and pull it up into forms like bowls, mugs, and vases. Hand building refers to techniques that don\'t use a wheel, such as pinching, coiling, and slab construction. Both are widely taught at pottery studios across the US.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="border border-stone-200 rounded-xl px-5 py-4">
              <h3 className="font-semibold text-stone-800 mb-2">{q}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What types of pottery classes can I find in the United States?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'US pottery studios offer wheel throwing, hand building, sculpting, and glazing classes. Many also offer open studio memberships, beginner drop-in sessions, BYOB pottery nights, date night events, kids classes, and private group bookings.',
                },
              },
              {
                '@type': 'Question',
                name: 'Do I need experience to take a pottery class?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No experience is needed for most pottery classes. The majority of studios are beginner-friendly and provide all tools, clay, and instruction needed. Many offer dedicated beginner courses or drop-in sessions designed for first-timers.',
                },
              },
              {
                '@type': 'Question',
                name: 'How much do pottery classes cost in the US?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Drop-in wheel throwing sessions typically cost $25–$60. Multi-week beginner courses usually run $150–$400. Open studio monthly memberships range from $80–$200/month. Many studios include clay, tools, and glazing in their pricing.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is the difference between wheel throwing and hand building?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Wheel throwing uses a spinning pottery wheel to shape clay into forms like bowls, mugs, and vases. Hand building uses techniques like pinching, coiling, and slab construction without a wheel. Both are widely taught at pottery studios across the US.',
                },
              },
            ],
          }),
        }}
      />

      {/* Back to home */}
      <div className="border-t border-stone-200 pt-6 mt-10">
        <Link href="/" className="text-amber-700 hover:underline text-sm">
          ← Browse all countries
        </Link>
      </div>
    </main>
  )
}
