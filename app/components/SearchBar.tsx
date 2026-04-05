'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

interface Suggestion {
  city: string
  state: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('listings')
        .select('city, state')
        .ilike('city', `%${query}%`)
        .eq('country', 'US')
        .limit(50)

      if (!data) return

      // Deduplicate city+state pairs
      const seen = new Set<string>()
      const unique: Suggestion[] = []
      for (const row of data) {
        if (!row.city || !row.state) continue
        const key = `${row.city}|${row.state}`
        if (seen.has(key)) continue
        seen.add(key)
        unique.push({ city: row.city, state: row.state })
      }

      setSuggestions(unique.slice(0, 8))
      setOpen(unique.length > 0)
    }, 200)

    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(suggestion: Suggestion) {
    setOpen(false)
    setQuery(`${suggestion.city}, ${suggestion.state}`)
    router.push(`/pottery-classes/${slugify(suggestion.state)}/${slugify(suggestion.city)}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (suggestions.length > 0) handleSelect(suggestions[0])
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Enter a city (e.g. Austin, Denver, Seattle...)"
          className="flex-1 rounded-xl border border-stone-300 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          autoComplete="off"
        />
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-5 py-3 rounded-xl text-sm transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute top-full mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg z-10 overflow-hidden">
          {suggestions.map(s => (
            <li key={`${s.city}|${s.state}`}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 text-stone-700"
              >
                {s.city}, <span className="text-stone-400">{s.state}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
