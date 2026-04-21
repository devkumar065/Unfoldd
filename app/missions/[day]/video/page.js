import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { VideoLearningClient } from '@/components/video/VideoLearningClient'

export const dynamic = 'force-dynamic'

export default async function VideoPage({ params }) {
  const dayNumber = parseInt(params.day, 10)
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const { data: roadmap } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .single()

  if (roadmap && dayNumber > roadmap.current_day) {
    redirect('/dashboard?error=Complete+previous+days+first')
  }

  const { data: mission } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('day_number', dayNumber)
    .single()

  let video = null
  let progress = null

  if (mission) {
    const { data: videoData } = await supabase
      .from('topic_videos')
      .select('*')
      .eq('role', profile?.target_role || '')
      .eq('day_number', dayNumber)
      .single()
      
    video = videoData || null

    if (video) {
      const { data: progressData } = await supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('video_id', video.id)
        .single()
      progress = progressData || null
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 pb-24">
      <VideoLearningClient 
        mission={mission} 
        video={video} 
        existingProgress={progress} 
        dayNumber={dayNumber} 
      />
    </div>
  )
}
