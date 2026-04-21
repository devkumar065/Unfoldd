export const dynamic = 'force-dynamic'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logAdminAction } from '@/lib/admin/auditLog'

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminUser } = await supabase
    .from('admin_users').select('id')
    .eq('id', user?.id).single()
    
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 25

  let query = supabase
    .from('topic_videos')
    .select(`
      *,
      topic_tests (
        id,
        test_questions (difficulty, created_by)
      )
    `)
    .order('role')
    .order('day_number')

  if (role && role !== 'all') {
    query = query.eq('role', role)
  }
  if (search) {
    query = query.ilike('topic_title', `%${search}%`)
  }

  const from = (page - 1) * limit
  const { data: videos, count } = await query.range(from, from + limit - 1)

  return NextResponse.json({ videos, count })
}

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminUser } = await supabase
    .from('admin_users').select('id, permissions')
    .eq('id', user?.id).single()
  
  if (!adminUser?.permissions?.can_edit_videos) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const videoData = await request.json()
  
  // Extract video ID from URL
  const { extractVideoId } = await import('@/lib/youtube/utils')
  const videoId = extractVideoId(videoData.youtube_url)
  
  if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })

  // Insert video
  const { data: video, error } = await supabase
    .from('topic_videos')
    .insert({
      topic_title: videoData.topic_title,
      topic_description: videoData.topic_description,
      role: videoData.role,
      day_number: videoData.day_number,
      difficulty: videoData.difficulty || 'beginner',
      what_you_will_learn: videoData.what_you_will_learn || [],
      youtube_video_id: videoId,
      created_by: user.id
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-create topic_test for this video
  await supabase.from('topic_tests').insert({
    video_id: video.id,
    topic_title: videoData.topic_title,
    role: videoData.role,
    day_number: videoData.day_number,
    total_questions: 15,
    passing_score: 80
  })

  // Log admin action
  await logAdminAction({
    adminId: user.id,
    action: 'video_add',
    targetType: 'video',
    targetId: video.id,
    details: { topic: videoData.topic_title, role: videoData.role, day: videoData.day_number }
  })

  return NextResponse.json({ success: true, video })
}

export async function PUT(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  const { videoId, updates } = await request.json()
  
  // If URL changed, re-extract video ID
  if (updates.youtube_url) {
    const { extractVideoId } = await import('@/lib/youtube/utils')
    updates.youtube_video_id = extractVideoId(updates.youtube_url)
    delete updates.youtube_url
  }

  const { data: video, error } = await supabase
    .from('topic_videos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', videoId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    adminId: user.id,
    action: 'video_update',
    targetType: 'video',
    targetId: videoId,
    details: updates
  })

  return NextResponse.json({ success: true, video })
}

export async function DELETE(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { videoId } = await request.json()
  
  // Check if students have progress on this video
  const { count } = await supabase
    .from('video_progress')
    .select('*', { count: 'exact', head: true })
    .eq('video_id', videoId)
    .gt('watched_seconds', 0)

  if (count > 0) {
    return NextResponse.json({
      error: `Cannot delete: ${count} students have progress on this video. Consider replacing the URL instead.`
    }, { status: 409 })
  }

  await supabase.from('topic_videos').delete().eq('id', videoId)

  return NextResponse.json({ success: true })
}
