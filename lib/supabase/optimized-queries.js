import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Lightweight profile (for navbar/sidebar)
export async function getMinimalProfile(userId) {
  const supabase = createClientComponentClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, streak_count, xp_points, is_premium, target_role, onboarding_completed')
    .eq('id', userId)
    .single()
  return data
}

// Current mission only
export async function getCurrentMission(userId) {
  const supabase = createClientComponentClient()
  const { data } = await supabase
    .from('daily_missions')
    .select('id, day_number, topic_title, learn_task, build_task, apply_task, status, task_completion, video_id, video_completed, test_completed')
    .eq('user_id', userId)
    .in('status', ['pending', 'in_progress', 'video_watching', 'video_done'])
    .order('day_number', { ascending: false })
    .limit(1)
    .single()
  return data
}

// Verified skills only (for portfolio)
export async function getVerifiedSkills(userId) {
  const supabase = createClientComponentClient()
  const { data } = await supabase
    .from('skills')
    .select('id, skill_name, category, verified_at, proficiency_level')
    .eq('user_id', userId)
    .eq('is_verified', true)
    .order('verified_at', { ascending: false })
  return data || []
}

// Top matched internships (limit 6)
export async function getTopInternships(userId, role) {
  const supabase = createClientComponentClient()
  const { data } = await supabase
    .from('internships')
    .select('id, company_name, role, location, is_remote, stipend_min, stipend_max, required_skills, deadline')
    .eq('is_active', true)
    .gt('deadline', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(6)
  return data || []
}

// Notifications (unread only, limit 10)
export async function getUnreadNotifications(userId) {
  const supabase = createClientComponentClient()
  const { data } = await supabase
    .from('notifications')
    .select('id, title, body, type, created_at, action_url')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(10)
  return data || []
}
