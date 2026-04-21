import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export const dynamic = 'force-dynamic'

async function DashboardContent() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) return null

  // 1. Get user profile and active roadmap
  const [
    { data: profile },
    { data: roadmap }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('roadmaps').select('*').eq('user_id', userId).eq('is_active', true).single()
  ])

  // 2. Get current mission (pending, in_progress, etc.)
  const { data: currentMission } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'in_progress', 'video_watching', 'video_done', 'test_in_progress'])
    .order('day_number', { ascending: false })
    .limit(1)
    .single()

  // 3. Fetch other data in parallel
  const [
    { data: skills },
    { data: internships },
    { data: badges },
    { data: activities },
    { count: applicationsCount }
  ] = await Promise.all([
    supabase.from('skills').select('*').eq('user_id', userId),
    supabase.from('internships').select('*').eq('is_active', true).limit(3),
    supabase.from('badges').select('*').eq('user_id', userId),
    supabase.from('analytics_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(15),
    supabase.from('internship_applications').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  ])

  return (
    <DashboardClient 
      initialMission={currentMission}
      profile={profile}
      roadmap={roadmap}
      skills={skills || []}
      internships={internships || []}
      badges={badges || []}
      activities={activities || []}
      applicationsCount={applicationsCount || 0}
    />
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}