import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏺</span>
              <span className="font-bold text-stone-900">ClayFinder</span>
            </Link>
            <p className="text-stone-500 text-sm leading-relaxed">
              The directory for pottery and ceramics classes across the US, Canada, and Australia.
            </p>
          </div>

          {/* Browse */}
          <div>
            <p className="font-semibold text-stone-800 text-sm mb-3">Browse Studios</p>
            <ul className="space-y-2 text-sm text-stone-500">
              <li><Link href="/pottery-classes/us" className="hover:text-stone-800 transition-colors">United States</Link></li>
              <li><Link href="/pottery-classes/ca" className="hover:text-stone-800 transition-colors">Canada</Link></li>
              <li><Link href="/pottery-classes/au" className="hover:text-stone-800 transition-colors">Australia</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="font-semibold text-stone-800 text-sm mb-3">Company</p>
            <ul className="space-y-2 text-sm text-stone-500">
              <li><Link href="/about" className="hover:text-stone-800 transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-stone-800 transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-stone-800 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-stone-800 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-100 mt-8 pt-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} ClayFinder. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
