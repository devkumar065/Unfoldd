import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Sidebar from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'
import Prefetcher from '@/components/layout/Prefetcher'

// Cache user profile for entire request
const getCachedUser = cache(async () => {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, target_role, is_premium, streak_count, xp_points, level, onboarding_completed, notification_token')
    .eq('id', session.user.id)
    .single()

  return { user: session.user, profile }
})

export default async function DashboardLayout({ children }) {
  const userData = await getCachedUser()

  if (!userData) {
    redirect('/auth/login')
  }

  if (!userData.profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="flex h-screen bg-[#0A0A0F] overflow-hidden">
      <Prefetcher />
      {/* Sidebar — static, no re-render */}
      <Sidebar profile={userData.profile} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar />
        
        {/* Page content with scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          {/* Instant page transition container */}
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}