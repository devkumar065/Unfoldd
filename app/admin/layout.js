import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  // Double check admin status (middleware already does this, but good for server components)
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!adminUser) {
    redirect('/dashboard')
  }

  // Get some notification counts for the sidebar
  const { count: flaggedCount } = await supabase
    .from('exams')
    .select('*', { count: 'exact', head: true })
    .gt('proctoring_flag_count', 0)
    .eq('reviewed_by_admin', false) 

  return (
    <div className="flex h-screen bg-[#050508] overflow-hidden text-white/90 font-sans selection:bg-purple-500/30">
      <AdminSidebar 
        adminUser={adminUser} 
        flaggedCount={flaggedCount || 0} 
        unreadMessagesCount={0} 
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Admin Bar */}
        <header className="h-20 border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
              Command Center
            </h1>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Live</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest hidden sm:block">
               Role: <span className="text-purple-400">{adminUser.role}</span>
             </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 bg-[#050508]">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
