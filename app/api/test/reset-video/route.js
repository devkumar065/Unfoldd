export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { videoId, missionId, attemptId } = await request.json()

  try {
     await supabase.rpc('increment_watch_attempts', { vid_id: videoId, uid: user.id })
  } catch(e){}

  await supabase.from('video_progress')
    .update({
      completed: false,
      watched_seconds: 0,
      completion_percentage: 0,
      completed_at: null
    })
    .eq('user_id', user.id)
    .eq('video_id', videoId)

  await supabase.from('daily_missions')
    .update({
      video_completed: false,
      status: 'video_watching'
    })
    .eq('id', missionId)

  if (attemptId) {
    const { data: currentAttempt } = await supabase
      .from('test_attempts')
      .select('attempt_number, test_id')
      .eq('id', attemptId)
      .single()

    if (currentAttempt) {
      await supabase.from('test_attempts')
        .insert({
          user_id: user.id,
          test_id: currentAttempt.test_id,
          video_id: videoId,
          mission_id: missionId,
          attempt_number: (currentAttempt.attempt_number || 1) + 1,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
    }
  }

  return NextResponse.json({ success: true, message: 'Video reset. Please rewatch to retry.' })
}
