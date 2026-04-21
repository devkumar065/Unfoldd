import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PortfolioEditor } from '@/components/portfolio/PortfolioEditor'
import { ensureUniqueSlug } from '@/lib/utils/slugGenerator'

export const dynamic = 'force-dynamic'

export default async function EditPortfolioPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()

  let { data: portfolio } = await supabase.from('portfolios').select('*').eq('user_id', session.user.id).single()

  if (!portfolio) {
    const newSlug = await ensureUniqueSlug(supabase, profile.full_name || 'user', session.user.id)
    const { data: newPort } = await supabase.from('portfolios').insert({
      user_id: session.user.id,
      template_id: 'minimal',
      public_slug: newSlug,
      is_public: true,
      bio: '',
      tagline: '',
      projects: []
    }).select().single()
    portfolio = newPort
  }

  const { data: skills } = await supabase.from('skills').select('*').eq('user_id', session.user.id)
  const { data: badges } = await supabase.from('badges').select('*').eq('user_id', session.user.id)
  const { data: roadmap } = await supabase.from('roadmaps').select('*').eq('user_id', session.user.id).eq('is_active', true).single()

  return (
    <div className="h-[calc(100vh-80px)]">
      <PortfolioEditor 
        initialPortfolio={portfolio} 
        profile={profile} 
        skills={skills || []} 
        badges={badges || []} 
        roadmap={roadmap} 
      />
    </div>
  )
}
