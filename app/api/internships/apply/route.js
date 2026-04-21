import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { internshipId, matchPercentage, coverNote } = await request.json()

  const { data: existing } = await supabase
    .from('internship_applications')
    .select('id')
    .eq('user_id', user.id)
    .eq('internship_id', internshipId)
    .single()

  if (existing) return NextResponse.json({ error: 'Already applied' }, { status: 409 })

  const { data: internship } = await supabase
    .from('internships')
    .select('company_name, role, application_count')
    .eq('id', internshipId)
    .single()

  const { data: application, error } = await supabase
    .from('internship_applications')
    .insert({
      user_id: user.id,
      internship_id: internshipId,
      match_percentage: matchPercentage,
      status: 'applied',
      applied_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('internships').update({ application_count: (internship.application_count || 0) + 1 }).eq('id', internshipId)
  await supabase.from('notifications').insert({ user_id: user.id, title: 'Application Sent! 📩', body: `Your application to ${internship.company_name} for ${internship.role} has been submitted.`, type: 'application', action_url: '/internships' })
  await supabase.from('analytics_events').insert({ user_id: user.id, event_type: 'internship_apply', event_data: { internship_id: internshipId, company: internship.company_name, match_percentage: matchPercentage } })
  try { await supabase.rpc('increment', { x: 25, row_id: user.id }) } catch(e){}

  return NextResponse.json({ success: true, application })
}
