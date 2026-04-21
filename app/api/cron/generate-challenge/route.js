import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const roles = ['fullstack', 'sde', 'cybersecurity', 'data_science', 'devops', 'uiux']

  for (const role of roles) {
    try {
      const prompt = `Generate one coding challenge for a ${role} developer. Return JSON only: { "title": "string", "description": "string", "examples": [{"input":"string","output":"string"}], "difficulty": "medium", "xp_reward": 150, "time_limit_minutes": 30, "hints": ["string"] }`

      const response = await fetch(`${process.env.GROQ_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'groq-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000
        })
      })

      if (response.ok) {
        const aiData = await response.json()
        const challenge = JSON.parse(aiData.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim())

        await supabase.from('analytics_events').insert({
          user_id: null,
          event_type: 'daily_challenge_generated',
          event_data: { ...challenge, role, date: new Date().toISOString().split('T')[0] }
        })
      }
    } catch(e) { console.error(e) }
  }

  return NextResponse.json({ success: true, generated: roles.length })
}
