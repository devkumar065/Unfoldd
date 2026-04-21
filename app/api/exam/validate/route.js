export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await request.json()

  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('exam_link_token', token)
    .eq('user_id', user.id)
    .single()

  if (!exam) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })

  if (new Date() > new Date(exam.expires_at)) {
    await supabase.from('exams').update({ status: 'expired' }).eq('id', exam.id)
    return NextResponse.json({ error: 'Exam expired' }, { status: 410 })
  }

  if (exam.status === 'completed') {
    return NextResponse.json({ error: 'Already completed' }, { status: 409 })
  }

  await supabase.from('exams').update({ status: 'active', opened_at: new Date().toISOString() }).eq('id', exam.id)

  return NextResponse.json({ success: true, examId: exam.id })
}
