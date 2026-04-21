export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'


export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ resume })
}

export async function PUT(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { resumeData, atsScore, templateId } = await request.json()

  const { data: resume, error } = await supabase
    .from('resumes')
    .upsert({
      user_id: user.id,
      resume_data: resumeData,
      ats_score: atsScore,
      template_id: templateId || 'classic',
      last_updated: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, resume })
}
