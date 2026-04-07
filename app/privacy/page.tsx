import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | ClayFinder',
  description: 'Privacy policy for ClayFinder — how we collect, use, and protect your information.',
  alternates: { canonical: 'https://www.clayfinder.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-stone-800">Home</Link>
        <span>/</span>
        <span className="text-stone-800">Privacy Policy</span>
      </nav>

      <h1 className="text-3xl font-bold text-stone-900 mb-2">Privacy Policy</h1>
      <p className="text-stone-400 text-sm mb-8">Last updated: April 2025</p>

      <div className="space-y-6 text-stone-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">1. What we collect</h2>
          <p>
            ClayFinder collects information in two situations:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Lead form submissions</strong> — When you submit a contact form on a studio listing page,
              we collect your name, email address, phone number (optional), and message. This information is
              forwarded to the studio you contacted and stored securely.
            </li>
            <li>
              <strong>Analytics data</strong> — We use Google Analytics 4 (GA4) to understand how visitors
              use our site. GA4 collects anonymised data including page views, device type, and approximate
              location. No personally identifiable information is collected through analytics.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">2. How we use your information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Lead form data is used solely to connect you with the studio you contacted.</li>
            <li>Analytics data is used to improve the site and understand user behaviour.</li>
            <li>We do not sell your personal information to third parties.</li>
            <li>We do not use your data for advertising targeting.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">3. Cookies</h2>
          <p>
            ClayFinder uses cookies placed by Google Analytics to track aggregate site usage. You can opt out
            of Google Analytics tracking by installing the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 hover:underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">4. Data retention</h2>
          <p>
            Lead form submissions are retained for up to 12 months, after which they are deleted from our
            database. Analytics data is retained per Google&apos;s standard GA4 data retention settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">5. Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of any personal data we hold about you.
            To make a request, email us at{' '}
            <a href="mailto:hello@clayfinder.com" className="text-amber-700 hover:underline">
              hello@clayfinder.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">6. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Changes will be posted on this page with an updated
            date. Continued use of ClayFinder after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">7. Contact</h2>
          <p>
            Questions about this policy?{' '}
            <Link href="/contact" className="text-amber-700 hover:underline">Contact us</Link>.
          </p>
        </section>
      </div>
    </main>
  )
}
