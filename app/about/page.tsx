import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About ClayFinder | Pottery & Ceramics Class Directory',
  description: 'ClayFinder is a directory of pottery and ceramics studios across the US, Canada, and Australia. Find local classes, workshops, and open studio memberships near you.',
  alternates: { canonical: 'https://www.clayfinder.com/about' },
}

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-stone-800">Home</Link>
        <span>/</span>
        <span className="text-stone-800">About</span>
      </nav>

      <h1 className="text-3xl font-bold text-stone-900 mb-4">About ClayFinder</h1>

      <div className="prose prose-stone max-w-none space-y-5 text-stone-600 leading-relaxed">
        <p>
          ClayFinder is a directory of pottery and ceramics studios across the United States, Canada, and Australia.
          We exist to make it easy for anyone — beginner or experienced — to find a local studio offering the classes,
          workshops, or open studio time that fits their schedule and skill level.
        </p>

        <p>
          Finding a good pottery class used to mean scrolling through Yelp, scanning neighbourhood Facebook groups,
          or just asking around. ClayFinder pulls together verified studio listings in one place so you can quickly
          compare what&apos;s available near you — wheel throwing, hand building, BYOB nights, kids classes, firing
          services, and more.
        </p>

        <h2 className="text-xl font-semibold text-stone-800 mt-8 mb-2">What we list</h2>
        <p>
          Every listing on ClayFinder is a dedicated pottery or ceramics studio. We don&apos;t include paint-your-own
          pottery cafes or general craft supply stores. Our focus is studios where you can take a real class, work
          on a wheel, or get hands-on with clay under guidance from an experienced instructor.
        </p>

        <h2 className="text-xl font-semibold text-stone-800 mt-8 mb-2">Coverage</h2>
        <p>
          We currently list studios across all 50 US states, all Canadian provinces, and all Australian states and
          territories. Listings are sourced from publicly available business data and regularly refreshed.
        </p>

        <h2 className="text-xl font-semibold text-stone-800 mt-8 mb-2">Get in touch</h2>
        <p>
          If you have a question, want to update a listing, or just want to say hello, visit our{' '}
          <Link href="/contact" className="text-amber-700 hover:underline">contact page</Link>.
        </p>
      </div>
    </main>
  )
}
