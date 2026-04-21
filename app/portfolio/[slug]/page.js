import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { PortfolioViewer } from '@/components/portfolio/PortfolioViewer'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*, profiles(full_name, avatar_url)')
    .eq('public_slug', params.slug)
    .eq('is_public', true)
    .single()

  if (!portfolio) return { title: 'Portfolio Not Found | Unfoldd' }

  return {
    title: `${portfolio.profiles.full_name} — Unfoldd Portfolio`,
    description: portfolio.bio || `${portfolio.profiles.full_name}'s verified skill portfolio`,
    openGraph: {
      title: `${portfolio.profiles.full_name} | Unfoldd`,
      description: portfolio.bio,
      type: 'profile',
      images: [{
        url: portfolio.profiles.avatar_url || '/logo.png',
        width: 1200,
        height: 630
      }]
    }
  }
}

export default async function PublicPortfolioPage({ params }) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*, profiles(*)')
    .eq('public_slug', params.slug)
    .eq('is_public', true)
    .single()

  if (!portfolio) {
    notFound()
  }

  await supabase.rpc('increment_portfolio_views', { port_id: portfolio.id })

  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', portfolio.user_id)
    .order('is_verified', { ascending: false })
    .order('learned_at', { ascending: false })

  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', portfolio.user_id)

  const { data: roadmap } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('user_id', portfolio.user_id)
    .eq('is_active', true)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <PortfolioViewer 
        portfolio={portfolio} 
        profile={portfolio.profiles} 
        skills={skills || []} 
        badges={badges || []}
        roadmap={roadmap}
      />
    </div>
  )
}
