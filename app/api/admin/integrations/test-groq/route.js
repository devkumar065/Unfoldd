import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify admin status
  const { data: admin } = await supabase.from('admin_users').select('role').eq('id', user.id).single()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { apiKey } = await request.json()
  if (!apiKey) return NextResponse.json({ error: 'API Key is required' }, { status: 400 })

  try {
    const groq = new Groq({ apiKey })
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say {"status": "ok"}' }],
      model: 'llama-3.1-8b-instant',
      max_tokens: 20,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
    const result = JSON.parse(content)

    if (result.status === 'ok') {
      return NextResponse.json({ success: true })
    } else {
      throw new Error('Unexpected response format')
    }
  } catch (error) {
    console.error('Groq test error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
