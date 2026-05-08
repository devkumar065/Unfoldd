import { createServerComponentClient }
  from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'

export default async function DashboardLayout({ 
  children 
}) {
  const supabase = createServerComponentClient(
    { cookies })

  const { data: { user } } = 
    await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch minimal profile for layout
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      id, full_name, avatar_url, target_role,
      streak_count, xp_points, level,
      is_premium, premium_plan,
      onboarding_completed
    `)
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')
  
  if (!profile.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="flex h-screen bg-[#0A0A0F] 
      overflow-hidden">
      
      {/* Sidebar with profile data */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar profile={profile} />
      </div>

      <div className="flex-1 flex flex-col 
        overflow-hidden min-w-0">
        <Navbar profile={profile} />
        
        <main className="flex-1 overflow-y-auto
          overflow-x-hidden pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile nav — only in dashboard */}
      <MobileNav />
    </div>
  )
}
