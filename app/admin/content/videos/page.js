import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import VideoLibraryClient from '@/components/admin/content/VideoLibrary'

export const dynamic = 'force-dynamic'

export default async function VideosPage({ searchParams }) {
  const supabase = createServerComponentClient({ cookies })
  
  const role = searchParams.role || 'all'
  const page = parseInt(searchParams.page) || 1
  const limit = 25
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('topic_videos')
    .select(`
      *,
      topic_tests (
        id,
        test_questions (count)
      )
    `, { count: 'exact' })
    .order('role', { ascending: true })
    .order('day_number', { ascending: true })

  if (role !== 'all') {
    query = query.eq('role', role)
  }

  const { data: videos, count } = await query.range(from, to)

  // Get coverage stats for badges
  const { data: statsData } = await supabase.from('topic_videos').select('role')
  const roles = ['fullstack', 'sde', 'cybersecurity', 'data_science', 'devops', 'uiux']
  const coverage = roles.reduce((acc, r) => {
    acc[r] = statsData?.filter(v => v.role === r).length || 0
    return acc
  }, {})

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
      <VideoLibraryClient 
        initialVideos={videos || []} 
        totalCount={count || 0} 
        coverage={coverage}
        currentPage={page}
        currentRole={role}
      />
    </div>
  )
}