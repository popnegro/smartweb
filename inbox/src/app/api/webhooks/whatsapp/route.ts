import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]

    if (!message) {
      return NextResponse.json({ ok: true })
    }

    const phone = message.from
    const text = message.text?.body

    await supabase
      .from('conversations')
      .insert({
        source: 'whatsapp',
        source_user_id: phone,
        customer_name: phone,
        last_message: text
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: true }, { status: 500 })
  }
}