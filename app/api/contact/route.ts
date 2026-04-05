import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, message, studio } = body

  if (!name || !email || !message || !studio) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Store lead in Supabase leads table
  const { error } = await supabase.from('leads').insert({
    name,
    email,
    phone: phone || null,
    message,
    studio_name: studio,
    submitted_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Lead insert error:', error)
    // Don't fail the request — email delivery will be added later
  }

  // TODO: wire up Resend email delivery here

  return NextResponse.json({ success: true })
}
