import Link from 'next/link'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Pottery Classes in Canada | ClayFinder',
  description: 'Find pottery and ceramics classes across Canada. Browse local studios offering wheel throwing, hand building, open studio memberships, and more.',
}

interface StateGroup {
  state: string
  count: number
}

async function getProvinces(): Promise<StateGroup[]> {
  const { data } = await supabase
    .from('listings')
    .select('state')
    .eq('country', 'CA')
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

export default async function CanadaPage() {
  const provinces = await getProvinces()
  const totalStudios = provinces.reduce((sum, s) => sum + s.count, 0)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-stone-800">Home</Link>
        <span>/</span>
        <span className="text-stone-800">Canada</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">
          Pottery Classes in Canada
        </h1>
        <p className="text-stone-600 mt-2 text-base">
          Find ceramics classes and pottery studios across Canada — {totalStudios.toLocaleString()} studio{totalStudios !== 1 ? 's' : ''} across {provinces.length} province{provinces.length !== 1 ? 's' : ''} and territories.
        </p>
      </div>

      {/* Provinces grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {provinces.map(({ state, count }) => (
          <Link
            key={state}
            href={`/pottery-classes/ca/${slugify(state)}`}
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
          Frequently Asked Questions — Pottery Classes in Canada
        </h2>
        <div className="space-y-5">
          {[
            {
              q: 'What types of pottery classes can I find in Canada?',
              a: 'Canadian pottery studios offer wheel throwing, hand building, sculpting, and glazing classes. Many studios also run open studio sessions, beginner courses, BYOB pottery nights, date nights, kids classes, and private group bookings across provinces from BC to Ontario and beyond.',
            },
            {
              q: 'Do I need experience to take a pottery class in Canada?',
              a: 'No prior experience is required. Most Canadian pottery studios welcome absolute beginners and provide all the tools, clay, and instruction needed. Many offer beginner-focused courses or drop-in sessions where you can try wheel throwing or hand building for the first time.',
            },
            {
              q: 'How much do pottery and ceramics classes cost in Canada?',
              a: 'Pricing varies by studio and format. Introductory or drop-in sessions typically cost CAD $35–$80. Multi-week beginner courses often run CAD $150–$450. Open studio monthly memberships typically range from CAD $100–$220 per month. Clay and firing are usually included.',
            },
            {
              q: 'What are BYOB pottery nights?',
              a: 'BYOB pottery nights are social studio events where you bring your own drinks and enjoy a guided pottery session — usually wheel throwing or hand building — in a relaxed, group setting. They\'re popular for birthday parties, date nights, and group outings. Many Canadian studios host these evenings on a regular basis.',
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
                name: 'What types of pottery classes can I find in Canada?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Canadian pottery studios offer wheel throwing, hand building, sculpting, and glazing classes. Many studios also run open studio sessions, beginner courses, BYOB pottery nights, date nights, kids classes, and private group bookings.',
                },
              },
              {
                '@type': 'Question',
                name: 'Do I need experience to take a pottery class in Canada?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No prior experience is required. Most Canadian pottery studios welcome absolute beginners and provide all tools, clay, and instruction needed. Many offer beginner-focused courses or drop-in sessions for first-timers.',
                },
              },
              {
                '@type': 'Question',
                name: 'How much do pottery and ceramics classes cost in Canada?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Drop-in sessions typically cost CAD $35–$80. Multi-week beginner courses often run CAD $150–$450. Open studio monthly memberships typically range from CAD $100–$220 per month. Clay and firing are usually included.',
                },
              },
              {
                '@type': 'Question',
                name: 'What are BYOB pottery nights?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'BYOB pottery nights are social studio events where you bring your own drinks and enjoy a guided pottery session in a relaxed group setting. They\'re popular for birthday parties, date nights, and group outings, and are offered at many Canadian studios.',
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
