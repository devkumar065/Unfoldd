import { cache } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// All dashboard data in ONE parallel fetch
export const getDashboardData = cache(
  async (userId) => {
    const supabase = createServerComponentClient({ cookies })

    // ALL fetches run simultaneously
    const [
      profileResult,
      missionResult,
      skillsResult,
      roadmapResult,
      notificationsResult,
      badgesResult
    ] = await Promise.allSettled([
      
      supabase.from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      
      supabase.from('daily_missions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['pending', 'in_progress', 'video_watching', 'video_done'])
        .order('day_number', { ascending: false })
        .limit(1)
        .single(),
      
      supabase.from('skills')
        .select('id, skill_name, category, is_verified, is_learned, verified_at')
        .eq('user_id', userId)
        .order('is_verified', { ascending: false })
        .limit(20),
      
      supabase.from('roadmaps')
        .select('id, current_day, total_days, target_role, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single(),
      
      supabase.from('notifications')
        .select('id, title, body, type, is_read, created_at, action_url')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5),
      
      supabase.from('badges')
        .select('badge_type, earned_at')
        .eq('user_id', userId)
    ])

    // Extract data safely
    return {
      profile: profileResult.status === 'fulfilled' 
        ? profileResult.value.data : null,
      mission: missionResult.status === 'fulfilled'
        ? missionResult.value.data : null,
      skills: skillsResult.status === 'fulfilled'
        ? skillsResult.value.data || [] : [],
      roadmap: roadmapResult.status === 'fulfilled'
        ? roadmapResult.value.data : null,
      notifications: notificationsResult.status === 'fulfilled'
        ? notificationsResult.value.data || [] : [],
      badges: badgesResult.status === 'fulfilled'
        ? badgesResult.value.data || [] : []
    }
  }
)
