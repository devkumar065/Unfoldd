export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { examId, eventType, severity, timestamp } = await request.json()

  await supabase.from('proctoring_logs').insert({
    exam_id: examId, user_id: user.id, event_type: eventType,
    severity: severity, timestamp: timestamp || new Date().toISOString(), flagged: true
  })

  try { await supabase.rpc('increment_exam_flags', { exam_uuid: examId }) } catch(e){}

  return NextResponse.json({ logged: true })
}
