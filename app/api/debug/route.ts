import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

export async function GET() {
  const { data, error } = await supabase
    .from('listings')
    .select('name, city, state, country')
    .ilike('state', 'California')
    .ilike('city', 'Los Angeles')
    .eq('country', 'US')

  const match = data?.find(l => slugify(l.name) === 'throw-clay-la')

  return NextResponse.json({
    total_results: data?.length ?? 0,
    slug_match: match ?? null,
    error,
    all_names_and_slugs: data?.map(l => ({ name: l.name, slug: slugify(l.name) })),
  })
}
