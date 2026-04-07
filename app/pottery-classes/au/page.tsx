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

      {/* FAQs */}
      <section className="mt-12 border-t border-stone-200 pt-10">
        <h2 className="text-xl font-bold text-stone-900 mb-6">
          Frequently Asked Questions — Pottery Classes in Australia
        </h2>
        <div className="space-y-5">
          {[
            {
              q: 'What types of pottery classes can I find in Australia?',
              a: 'Australian pottery studios offer wheel throwing, hand building, sculpting, and glazing classes. Many studios also run open studio sessions, beginner courses, BYOB pottery nights, date nights, kids classes, and private group events.',
            },
            {
              q: 'Do I need experience to take a ceramics class in Australia?',
              a: 'No prior experience is required for most ceramics classes in Australia. Studios listed on ClayFinder are generally beginner-friendly and provide all the tools, clay, and tuition you need to get started. Look for studios that specifically advertise beginner or drop-in classes.',
            },
            {
              q: 'How much do pottery classes cost in Australia?',
              a: 'Pricing varies by studio and class format. Introductory or drop-in sessions typically range from AUD $40–$90. Term-based courses often run AUD $200–$500. Open studio memberships are typically AUD $100–$250 per month. Most studios include clay and firing costs in their fees.',
            },
            {
              q: 'What is open studio access at a pottery studio?',
              a: 'Open studio access is a membership or pass that lets you use the studio\'s equipment — wheels, kilns, and tools — to work on your own projects outside of structured classes. It\'s ideal for people with some experience who want to practise at their own pace. Many Australian studios offer monthly open studio memberships.',
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
                name: 'What types of pottery classes can I find in Australia?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Australian pottery studios offer wheel throwing, hand building, sculpting, and glazing classes. Many studios also run open studio sessions, beginner courses, BYOB pottery nights, date nights, kids classes, and private group events.',
                },
              },
              {
                '@type': 'Question',
                name: 'Do I need experience to take a ceramics class in Australia?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No prior experience is required for most ceramics classes in Australia. Studios are generally beginner-friendly and provide all tools, clay, and tuition needed to get started.',
                },
              },
              {
                '@type': 'Question',
                name: 'How much do pottery classes cost in Australia?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Drop-in sessions typically range from AUD $40–$90. Term-based courses often run AUD $200–$500. Open studio memberships are typically AUD $100–$250 per month. Most studios include clay and firing costs in their fees.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is open studio access at a pottery studio?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Open studio access is a membership or pass that lets you use the studio\'s equipment — wheels, kilns, and tools — to work on your own projects outside of structured classes. Many Australian studios offer monthly open studio memberships.',
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
