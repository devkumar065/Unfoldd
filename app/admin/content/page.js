import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ContentOverviewClient from '@/components/admin/content/ContentOverview'

export const dynamic = 'force-dynamic'

export default async function ContentPage() {
  const supabase = createServerComponentClient({ cookies })

  const [
    { count: totalVideos },
    { count: totalQuestions },
    { data: questionsSource },
    { count: activeInternships },
    { data: expiringInternships }
  ] = await Promise.all([
    supabase.from('topic_videos').select('*', { count: 'exact', head: true }),
    supabase.from('test_questions').select('*', { count: 'exact', head: true }),
    supabase.from('test_questions').select('created_by'),
    supabase.from('internships').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('internships').select('id').lt('deadline', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()).gt('deadline', new Date().toISOString())
  ])

  const adminQuestions = questionsSource?.filter(q => q.created_by === 'admin').length || 0
  const aiQuestions = questionsSource?.filter(q => q.created_by === 'ai').length || 0

  // Count videos per role to check coverage
  const { data: roleCounts } = await supabase.from('topic_videos').select('role')
  const roles = ['sde', 'fullstack', 'cybersecurity', 'data_science', 'devops', 'uiux']
  const coverage = roles.reduce((acc, role) => {
    acc[role] = roleCounts?.filter(v => v.role === role).length || 0
    return acc
  }, {})

  const stats = {
    videos: { total: totalVideos || 0, missing: 0 }, // missing logic could be more complex
    questions: { total: totalQuestions || 0, admin: adminQuestions, ai: aiQuestions },
    internships: { active: activeInternships || 0, expiring: expiringInternships?.length || 0 },
    rolesCovered: roles.filter(r => coverage[r] >= 90).length,
    coverage
  }

  return <ContentOverviewClient stats={stats} />
}
