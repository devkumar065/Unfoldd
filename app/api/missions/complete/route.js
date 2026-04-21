import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(
    { error: 'Unauthorized' }, { status: 401 })

  const { missionId, completedTasks } = await request.json()

  // 1. Mark mission complete
  const { data: completedMission, error: updateError } = await supabase
    .from('daily_missions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', missionId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: 'Failed to complete mission' }, { status: 500 })
  }

  // 2. Add XP and update streak
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp_points, streak_count, last_mission_completed_at, longest_streak')
    .eq('id', user.id)
    .single()

  await supabase.from('profiles')
    .update({
      xp_points: (profile.xp_points || 0) + 100
    })
    .eq('id', user.id)

  // 3. Track analytics
  await supabase.from('analytics_events').insert({
    user_id: user.id,
    event_type: 'mission_complete',
    event_data: { mission_id: missionId, day_number: completedMission.day_number }
  })

  // 4. Check first mission badge
  const { count } = await supabase
    .from('daily_missions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  if (count === 1) {
    await supabase.from('badges')
      .upsert({ 
        user_id: user.id, 
        badge_type: 'first_mission' 
      }, { onConflict: 'user_id,badge_type' })
  }

  // 5. ── GENERATE NEXT MISSION ─────────────────
  // Do this async — don't block the response
  const generateNextMission = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/mission/generate-next`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          }
        }
      )
    } catch(e) {
      console.error('Background mission generation failed:', e)
      // Will retry when student visits dashboard next time
    }
  }

  // Fire and forget (non-blocking)
  generateNextMission()

  return NextResponse.json({
    success: true,
    xp_earned: 100,
    missions_completed: count
  })
}