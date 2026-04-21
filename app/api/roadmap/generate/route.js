export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const payload = await request.json()
  const { 
    target_role, year, branch, college,
    daily_time_minutes, class_timings, exam_dates 
  } = payload

  // 1. Update profile with onboarding data
  await supabase.from('profiles').update({
    target_role,
    year: parseInt(year) || null,
    branch,
    college,
    daily_time_minutes: parseInt(daily_time_minutes) || 60,
    class_timings: class_timings || [],
    exam_dates: exam_dates || [],
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
    level: 'Beginner'
  }).eq('id', user.id)

  // 2. Create roadmap record (lightweight)
  const { data: roadmap, error: roadmapError } = await supabase
    .from('roadmaps')
    .insert({
      user_id: user.id,
      target_role,
      total_days: 90,
      current_day: 0, // starts at 0, Day 1 not yet generated
      roadmap_data: {
        role: target_role,
        created_at: new Date().toISOString(),
        generation_mode: 'dynamic'
      },
      is_active: true
    })
    .select()
    .single()

  if (roadmapError) {
    console.error('Roadmap creation error:', roadmapError)
    return NextResponse.json({ error: roadmapError.message }, { status: 500 })
  }

  // 3. Now generate Day 1 mission dynamically
  // Call our new mission generation endpoint
  try {
    const missionResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/mission/generate-next`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        }
      }
    )

    const missionData = await missionResponse.json()

    if (!missionData.success) {
      console.error('Day 1 mission generation failed:', missionData.error)
    }

    return NextResponse.json({
      success: true,
      roadmap_id: roadmap.id,
      day1_mission: missionData.mission || null,
      message: 'Your journey begins! Day 1 is ready.'
    })
  } catch (error) {
    console.error('Background mission generation error:', error)
    return NextResponse.json({
      success: true,
      roadmap_id: roadmap.id,
      message: 'Profile setup complete. Your first mission will be ready in a moment.'
    })
  }
}