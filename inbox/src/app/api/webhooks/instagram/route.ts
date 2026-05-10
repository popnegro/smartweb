import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')

  if (token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge)
  }

  return new Response('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {

        if (change.field === 'comments') {
          const value = change.value

          await supabase.from('instagram_comments').insert({
            comment_id: value.id,
            post_id: value.media?.id,
            username: value.from?.username,
            message: value.text
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: true }, { status: 500 })
  }
}