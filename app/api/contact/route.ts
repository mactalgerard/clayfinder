import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

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
  }

  // Send lead notification email
  await resend.emails.send({
    from: 'ClayFinder Leads <leads@clayfinder.com>',
    to: 'gerardmactal@germacdirectories.com',
    subject: `New lead for ${studio}`,
    text: [
      `New lead submitted on ClayFinder`,
      ``,
      `Studio: ${studio}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'Not provided'}`,
      ``,
      `Message:`,
      message,
    ].join('\n'),
  })

  return NextResponse.json({ success: true })
}
