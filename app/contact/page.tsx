import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact ClayFinder | Pottery & Ceramics Directory',
  description: 'Get in touch with ClayFinder. Report an inaccurate listing, suggest a studio, or ask a general question.',
  alternates: { canonical: 'https://www.clayfinder.com/contact' },
}

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-stone-800">Home</Link>
        <span>/</span>
        <span className="text-stone-800">Contact</span>
      </nav>

      <h1 className="text-3xl font-bold text-stone-900 mb-4">Contact Us</h1>

      <div className="space-y-5 text-stone-600 leading-relaxed">
        <p>
          Have a question about a listing? Want to report inaccurate information or suggest a studio we&apos;re
          missing? We&apos;d love to hear from you.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5">
          <p className="font-semibold text-stone-800 mb-1">Email us</p>
          <a
            href="mailto:hello@clayfinder.com"
            className="text-amber-700 hover:underline font-medium"
          >
            hello@clayfinder.com
          </a>
        </div>

        <h2 className="text-xl font-semibold text-stone-800 mt-8 mb-2">Looking to contact a studio?</h2>
        <p>
          If you want to reach a specific pottery studio, the best way is to go directly to their listing page —
          each listing includes the studio&apos;s phone number, website, and a contact form to request more
          information.
        </p>
        <p>
          <Link href="/" className="text-amber-700 hover:underline">Search for a studio →</Link>
        </p>

        <h2 className="text-xl font-semibold text-stone-800 mt-8 mb-2">Response time</h2>
        <p>
          We typically respond within 1–3 business days.
        </p>
      </div>
    </main>
  )
}
