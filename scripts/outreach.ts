/**
 * Studio outreach script — notifies listed studios that they appear on ClayFinder.
 *
 * Prerequisites:
 *   1. hello@clayfinder.com forwarding set up in Porkbun
 *   2. hello@clayfinder.com added as a sender in Resend dashboard
 *
 * Usage:
 *   npx tsx scripts/outreach.ts --dry-run   # preview count + sample email
 *   npx tsx scripts/outreach.ts             # send first batch of 90
 */

import * as fs from 'fs'
import * as path from 'path'

// Manually load .env.local since this runs outside Next.js
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const resendKey = process.env.RESEND_API_KEY

if (!supabaseUrl || !supabaseKey || !resendKey) {
  console.error('Missing env vars. Check .env.local has NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, RESEND_API_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const resend = new Resend(resendKey)

const isDryRun = process.argv.includes('--dry-run')
const BATCH_SIZE = 90

const offsetArg = process.argv.find(a => a.startsWith('--offset='))
const OFFSET = offsetArg ? parseInt(offsetArg.split('=')[1], 10) : 0

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildListingUrl(name: string, city: string, state: string, country: string): string {
  const slug = slugify(name)
  const citySlug = slugify(city)
  const stateSlug = slugify(state)

  if (country === 'AU') {
    return `https://clayfinder.com/pottery-classes/au/${stateSlug}/${citySlug}/${slug}`
  } else if (country === 'CA') {
    return `https://clayfinder.com/pottery-classes/ca/${stateSlug}/${citySlug}/${slug}`
  } else {
    return `https://clayfinder.com/pottery-classes/${stateSlug}/${citySlug}/${slug}`
  }
}

function buildEmailText(studioName: string, listingUrl: string): string {
  return `Hi ${studioName} team,

We've added your studio to ClayFinder (clayfinder.com) — a dedicated directory for pottery and ceramics studios across the US, Canada, and Australia. Unlike a general search engine, ClayFinder helps people find exactly what they're looking for: whether that's beginner wheel-throwing classes, open studio access, kids workshops, or drop-in sessions near them.

Your listing is live here:
${listingUrl}

If anything looks off, just reply and we'll sort it out.

And if you find it useful — a mention or link on your website would help more people in your area discover studios like yours.

Thanks,
ClayFinder team`
}

async function main() {
  console.log(`\nMode: ${isDryRun ? 'DRY RUN (no emails sent)' : 'LIVE SEND'}`)
  console.log('Fetching studios with emails from Supabase...\n')

  const { data, error } = await supabase
    .from('listings')
    .select('name, email, city, state, country')
    .not('email', 'is', null)
    .neq('email', '')

  if (error) {
    console.error('Supabase error:', error)
    process.exit(1)
  }

  const studios = data ?? []

  // Country breakdown
  const byCountry = studios.reduce((acc: Record<string, number>, s) => {
    acc[s.country] = (acc[s.country] || 0) + 1
    return acc
  }, {})

  console.log(`Total studios with emails: ${studios.length}`)
  console.log('Breakdown:', byCountry)

  if (isDryRun) {
    const sample = studios[OFFSET] ?? studios[0]
    if (sample) {
      const url = buildListingUrl(sample.name, sample.city, sample.state, sample.country)
      console.log('\n--- SAMPLE EMAIL ---')
      console.log(`To:      ${sample.email}`)
      console.log(`From:    ClayFinder <hello@clayfinder.com>`)
      console.log(`Subject: Your studio is listed on ClayFinder`)
      console.log(`\n${buildEmailText(sample.name, url)}`)
      console.log('--- END SAMPLE ---')
    }
    console.log(`\nWould send to studios ${OFFSET + 1}–${Math.min(studios.length, OFFSET + BATCH_SIZE)} of ${studios.length}.`)
    console.log('Run without --dry-run to send.')
    return
  }

  const batch = studios.slice(OFFSET, OFFSET + BATCH_SIZE)
  console.log(`\nSending to ${batch.length} studios...`)

  let sent = 0
  let failed = 0

  for (const studio of batch) {
    const url = buildListingUrl(studio.name, studio.city, studio.state, studio.country)
    try {
      await resend.emails.send({
        from: 'ClayFinder <hello@clayfinder.com>',
        replyTo: 'hello@clayfinder.com',
        to: studio.email,
        subject: 'Your studio is listed on ClayFinder',
        text: buildEmailText(studio.name, url),
      })
      console.log(`  ✓  ${studio.name} <${studio.email}>`)
      sent++
    } catch (err: any) {
      console.error(`  ✗  ${studio.name} <${studio.email}> — ${err?.message ?? err}`)
      failed++
    }
  }

  console.log(`\nDone. Sent: ${sent} | Failed: ${failed}`)
  const remaining = studios.length - (OFFSET + batch.length)
  if (remaining > 0) {
    console.log(`Remaining: ${remaining} studios — run tomorrow with --offset=${OFFSET + BATCH_SIZE}`)
  } else {
    console.log('All studios have been contacted.')
  }
}

main()
