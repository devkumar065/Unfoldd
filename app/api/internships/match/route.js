import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('target_role').eq('id', user.id).single()
  const { data: skills } = await supabase.from('skills').select('skill_name, is_verified').eq('user_id', user.id)
  const { data: internships } = await supabase.from('internships').select('*').eq('is_active', true).gt('deadline', new Date().toISOString()).order('created_at', { ascending: false })

  const matched = (internships || []).map(internship => {
    const required = internship.required_skills || []
    if (required.length === 0) return { ...internship, match_percentage: 50 }

    const skillNames = (skills || []).map(s => s.skill_name.toLowerCase())
    const verifiedNames = (skills || []).filter(s => s.is_verified).map(s => s.skill_name.toLowerCase())

    let matchCount = 0
    let verifiedMatch = 0

    required.forEach(req => {
      const reqLower = req.toLowerCase()
      if (skillNames.some(s => s.includes(reqLower) || reqLower.includes(s))) matchCount++
      if (verifiedNames.some(s => s.includes(reqLower))) verifiedMatch++
    })

    const base = (matchCount / required.length) * 70
    const bonus = (verifiedMatch / required.length) * 30
    return { ...internship, match_percentage: Math.min(100, Math.round(base + bonus)) }
  })

  matched.sort((a, b) => b.match_percentage - a.match_percentage)
  return NextResponse.json({ internships: matched })
}
