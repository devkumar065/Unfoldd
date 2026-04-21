import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SkillsPageClient from '@/components/skills/SkillsPageClient'

export const dynamic = 'force-dynamic'

export default async function SkillsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const [
    { data: profile },
    { data: skills },
    { data: roadmap }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', session.user.id).single(),
    supabase.from('skills').select('*').eq('user_id', session.user.id).order('is_verified', { ascending: false }).order('is_learned', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('roadmaps').select('*').eq('user_id', session.user.id).eq('is_active', true).single()
  ])

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24">
      <SkillsPageClient profile={profile} initialSkills={skills || []} roadmap={roadmap} />
    </div>
  )
}
