import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | ClayFinder',
  description: 'Terms of service for ClayFinder — the pottery and ceramics class directory.',
  alternates: { canonical: 'https://www.clayfinder.com/terms' },
}

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-stone-800">Home</Link>
        <span>/</span>
        <span className="text-stone-800">Terms of Service</span>
      </nav>

      <h1 className="text-3xl font-bold text-stone-900 mb-2">Terms of Service</h1>
      <p className="text-stone-400 text-sm mb-8">Last updated: April 2025</p>

      <div className="space-y-6 text-stone-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">1. Use of the directory</h2>
          <p>
            ClayFinder provides a directory of pottery and ceramics studios as an informational resource.
            By using this site you agree to these terms. If you do not agree, please do not use ClayFinder.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">2. Listing accuracy</h2>
          <p>
            Listing information — including business hours, addresses, phone numbers, and services — is sourced
            from publicly available data. ClayFinder does not guarantee the accuracy, completeness, or
            timeliness of any listing. Always confirm details directly with a studio before visiting.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">3. Lead form submissions</h2>
          <p>
            When you submit a contact form on a studio listing page, your details are shared with that studio
            and with ClayFinder. By submitting the form you consent to this. ClayFinder is not responsible for
            any follow-up, or lack thereof, from a studio in response to your enquiry.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">4. Intellectual property</h2>
          <p>
            All content on ClayFinder — including text, design, and code — is owned by ClayFinder unless
            otherwise noted. You may not reproduce, distribute, or commercially exploit any content without
            prior written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">5. Disclaimer of warranties</h2>
          <p>
            ClayFinder is provided &ldquo;as is&rdquo; without warranties of any kind. We do not warrant that the site
            will be uninterrupted, error-free, or that listings are accurate or up to date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">6. Limitation of liability</h2>
          <p>
            ClayFinder shall not be liable for any indirect, incidental, or consequential damages arising from
            your use of this site or reliance on any listing information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">7. Changes to these terms</h2>
          <p>
            We may update these terms at any time. Changes will be posted on this page. Continued use of
            ClayFinder after changes constitutes your acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">8. Contact</h2>
          <p>
            Questions about these terms?{' '}
            <Link href="/contact" className="text-amber-700 hover:underline">Contact us</Link>.
          </p>
        </section>
      </div>
    </main>
  )
}
