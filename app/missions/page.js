import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MissionList } from '@/components/missions/MissionList'

export const dynamic = 'force-dynamic'

export default async function MissionsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  const { data: roadmap } = await supabase.from('roadmaps').select('*').eq('user_id', session.user.id).eq('is_active', true).single()
  const { data: missionsData } = await supabase.from('daily_missions').select('*, video_id(*)').eq('user_id', session.user.id).order('day_number', { ascending: true })
  const missions = missionsData || []

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6 pt-6 px-4 sm:px-6">
      <div className="glass p-8 rounded-3xl border border-border bg-card">
        <h1 className="text-3xl font-display font-bold text-white mb-2">My Journey 🗺️</h1>
        <p className="text-text-secondary">Track your 90-day progress and access past missions.</p>
        
        <div className="flex gap-4 mt-6">
          <div className="bg-background px-4 py-2 rounded-xl border border-border flex items-center gap-2">
            <span className="text-purple font-bold">{missions?.filter(m => m.status==='completed').length || 0} / {roadmap?.total_days || 90}</span>
            <span className="text-xs text-text-muted uppercase">Complete</span>
          </div>
          <div className="bg-background px-4 py-2 rounded-xl border border-border flex items-center gap-2">
            <span className="text-orange-500 font-bold">{profile?.streak_count || 0} 🔥</span>
            <span className="text-xs text-text-muted uppercase">Streak</span>
          </div>
        </div>
      </div>
      <MissionList missions={missions} roadmap={roadmap} />
    </div>
  )
}
