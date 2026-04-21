export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { videoId, missionId, watchedSeconds, totalSeconds, completionPercentage, completed } = await request.json()

  const { error } = await supabase
    .from('video_progress')
    .upsert({
      user_id: user.id,
      video_id: videoId,
      mission_id: missionId,
      watched_seconds: watchedSeconds,
      total_seconds: totalSeconds,
      completion_percentage: completionPercentage,
      completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
      last_watched_at: new Date().toISOString()
    }, { 
      onConflict: 'user_id,video_id',
      ignoreDuplicates: false 
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (completed) {
    await supabase.from('daily_missions')
      .update({ video_completed: true, status: 'video_done' })
      .eq('id', missionId)
      .eq('user_id', user.id)

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'video_complete',
      event_data: { video_id: videoId, mission_id: missionId }
    })

    try {
      await supabase.rpc('increment_video_views', { vid_id: videoId })
    } catch(e) {}
  }

  return NextResponse.json({ success: true })
}
