import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

const BASE_URL = 'https://www.clayfinder.com'

export const revalidate = 86400

function buildPages(listings: { name: string; city: string; state: string }[], prefix: string): MetadataRoute.Sitemap {
  const states = [...new Set(listings.map(l => l.state).filter(Boolean))]

  const cityMap = new Map<string, { city: string; state: string }>()
  for (const l of listings) {
    if (!l.city || !l.state) continue
    const key = `${l.state}|${l.city}`
    if (!cityMap.has(key)) cityMap.set(key, { city: l.city, state: l.state })
  }

  const statePages: MetadataRoute.Sitemap = states.map(state => ({
    url: `${BASE_URL}${prefix}/${slugify(state)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const cityPages: MetadataRoute.Sitemap = [...cityMap.values()].map(({ city, state }) => ({
    url: `${BASE_URL}${prefix}/${slugify(state)}/${slugify(city)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const listingPages: MetadataRoute.Sitemap = listings
    .filter(l => l.name && l.city && l.state)
    .map(l => ({
      url: `${BASE_URL}${prefix}/${slugify(l.state)}/${slugify(l.city)}/${slugify(l.name)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  return [...statePages, ...cityPages, ...listingPages]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: usData }, { data: auData }, { data: caData }] = await Promise.all([
    supabase.from('listings').select('name, city, state').eq('country', 'US'),
    supabase.from('listings').select('name, city, state').eq('country', 'AU'),
    supabase.from('listings').select('name, city, state').eq('country', 'CA'),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/pottery-classes/us`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/pottery-classes/au`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/pottery-classes/ca`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ]

  return [
    ...staticPages,
    ...buildPages(usData ?? [], '/pottery-classes'),
    ...buildPages(auData ?? [], '/pottery-classes/au'),
    ...buildPages(caData ?? [], '/pottery-classes/ca'),
  ]
}
