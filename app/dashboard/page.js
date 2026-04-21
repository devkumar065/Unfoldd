import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { getDashboardData } from '@/lib/data/fetchDashboard'

export const dynamic = 'force-dynamic'

async function DashboardContent() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) return null

  // Fetch everything in parallel with caching
  const data = await getDashboardData(userId)

  return (
    <DashboardClient 
      initialMission={data.mission}
      profile={data.profile}
      roadmap={data.roadmap}
      skills={data.skills}
      internships={data.internships || []}
      badges={data.badges}
      activities={data.notifications} // Reusing notifications as activities for now as per schema
      applicationsCount={0} // TODO: Add to fetchDashboard if needed
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
