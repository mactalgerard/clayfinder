import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🏺</span>
          <span className="font-bold text-stone-900 text-lg">ClayFinder</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-stone-600">
          <Link href="/" className="hover:text-stone-900 transition-colors">Find Studios</Link>
        </nav>
      </div>
    </header>
  )
}
