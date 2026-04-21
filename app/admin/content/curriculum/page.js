import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CurriculumBuilderClient from '@/components/admin/content/CurriculumBuilderClient'

export const dynamic = 'force-dynamic'

export default async function CurriculumPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!adminUser) redirect('/dashboard')

  // Fetch unique roadmaps (one template per role)
  // Usually this would come from a `curriculum_templates` table, 
  // but we can query `roadmaps` or `topic_videos` to reconstruct the structure
  
  // Fetch all videos to see coverage
  const { data: videos } = await supabase
    .from('topic_videos')
    .select('id, role, day_number, topic_title, youtube_video_id, topic_tests(id, test_questions(count))')
    .order('role')
    .order('day_number')

  // Group by role to build the curriculum view
  const curriculumByRole = videos?.reduce((acc, video) => {
    if (!acc[video.role]) acc[video.role] = []
    acc[video.role].push(video)
    return acc
  }, {}) || {}

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
      <CurriculumBuilderClient initialData={curriculumByRole} />
    </div>
  )
}
