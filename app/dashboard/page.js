import { createServerComponentClient }
  from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from 
  '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = createServerComponentClient(
    { cookies })

  // Get user
  const { data: { user }, error: authError } = 
    await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  // Fetch all dashboard data in parallel
  // Use Promise.allSettled so one failure 
  // doesn't break everything
  const [
    profileResult,
    roadmapResult,
    missionResult,
    skillsResult,
    notificationsResult,
    badgesResult,
    applicationsResult
  ] = await Promise.allSettled([
    
    // Profile
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),

    // Active roadmap
    supabase
      .from('roadmaps')
      .select('id, current_day, total_days, target_role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle(), // Use maybeSingle — won't error if missing

    // Current mission (pending/in_progress)
    supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', [
        'pending', 'in_progress', 
        'video_watching', 'video_done',
        'test_in_progress'
      ])
      .order('day_number', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Skills
    supabase
      .from('skills')
      .select('id, skill_name, category, is_verified, is_learned, verified_at, created_at')
      .eq('user_id', user.id)
      .order('is_verified', { ascending: false })
      .limit(20),

    // Unread notifications
    supabase
      .from('notifications')
      .select('id, title, body, type, is_read, created_at, action_url')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(8),

    // Badges
    supabase
      .from('badges')
      .select('badge_type, earned_at')
      .eq('user_id', user.id),

    // Applications count
    supabase
      .from('internship_applications')
      .select('id, status')
      .eq('user_id', user.id)
      .limit(50),
  ])

  // Extract data safely with fallbacks
  const profile = profileResult.status === 'fulfilled'
    ? profileResult.value.data : null
  
  const roadmap = roadmapResult.status === 'fulfilled'
    ? roadmapResult.value.data : null

  const currentMission = missionResult.status === 'fulfilled'
    ? missionResult.value.data : null

  const skills = skillsResult.status === 'fulfilled'
    ? skillsResult.value.data || [] : []

  const notifications = notificationsResult.status === 'fulfilled'
    ? notificationsResult.value.data || [] : []

  const badges = badgesResult.status === 'fulfilled'
    ? badgesResult.value.data || [] : []

  const applications = applicationsResult.status === 'fulfilled'
    ? applicationsResult.value.data || [] : []

  // Check if user needs onboarding
  if (profile && !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  // If no profile at all — redirect to onboarding
  if (!profile) {
    redirect('/onboarding')
  }

  // Calculate stats
  const stats = {
    streak: profile.streak_count || 0,
    longestStreak: profile.longest_streak || 0,
    xp: profile.xp_points || 0,
    level: profile.level || 'Beginner',
    skillsLearned: skills.filter(s => s.is_learned).length,
    skillsVerified: skills.filter(s => s.is_verified).length,
    applicationsCount: applications.length,
    shortlisted: applications.filter(
      a => a.status === 'shortlisted').length,
    currentDay: roadmap?.current_day || 1,
    totalDays: roadmap?.total_days || 90,
  }

  // Check if Day 1 mission needs to be generated
  // (new user who completed onboarding but no mission yet)
  const needsMissionGeneration = 
    !currentMission && 
    profile.onboarding_completed && 
    roadmap !== null

  return (
    <DashboardClient
      initialProfile={profile}
      initialRoadmap={roadmap}
      initialMission={currentMission}
      initialSkills={skills}
      initialNotifications={notifications}
      initialBadges={badges}
      initialStats={stats}
      userId={user.id}
      needsMissionGeneration={needsMissionGeneration}
    />
  )
}
