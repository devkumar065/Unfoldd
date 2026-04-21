export const dynamic = 'force-dynamic'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logAdminAction } from '@/lib/admin/auditLog'

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role, permissions')
    .eq('id', user?.id)
    .single()
  
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const filter = searchParams.get('filter') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page')) || 1
  const limit = 50

  // We fetch profiles and join with skills/daily_missions counts using exact count if possible.
  // Since supabase-js doesn't easily do relation counts in select string simply without view/rpc,
  // we will just select the profiles and manually handle or use basic info.
  // Or we can just use the provided code:

  let query = supabase
    .from('profiles')
    .select(`
      *,
      skills(count),
      daily_missions(count)
    `, { count: 'exact' })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (filter === 'premium') {
    query = query.eq('is_premium', true)
  } else if (filter === 'active') {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    query = query.gte('last_active_at', yesterday.toISOString())
  } else if (filter === 'banned') {
    // Assuming there's a status field or similar, for now we will filter if we add a 'status' field.
    // Unfoldd profiles table doesn't have status by default, let's assume 'status' exists or 'is_banned'.
    // If not, we'll skip or use a boolean. Let's assume we have a `status` column that can be 'active' or 'banned'.
    // Or we handle it via auth layer.
  }

  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else if (sort === 'oldest') {
    query = query.order('created_at', { ascending: true })
  } else if (sort === 'most_active') {
    query = query.order('streak_count', { ascending: false })
  } else if (sort === 'highest_xp') {
    query = query.order('xp_points', { ascending: false })
  }

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data: users, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users, count, page })
}

export async function PATCH(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role, permissions')
    .eq('id', user?.id)
    .single()
  
  if (!adminUser || !adminUser.permissions?.can_manage_users) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { userId, updates } = body
  
  const allowedUpdates = {}
  if (updates.is_premium !== undefined) allowedUpdates.is_premium = updates.is_premium
  if (updates.premium_plan !== undefined) allowedUpdates.premium_plan = updates.premium_plan
  if (updates.premium_expires_at !== undefined) allowedUpdates.premium_expires_at = updates.premium_expires_at
  if (updates.xp_points !== undefined) allowedUpdates.xp_points = updates.xp_points
  if (updates.streak_count !== undefined) allowedUpdates.streak_count = updates.streak_count
  if (updates.status !== undefined) allowedUpdates.status = updates.status // Banned or Active

  const { error } = await supabase.from('profiles')
    .update(allowedUpdates)
    .eq('id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log admin action
  await logAdminAction({
    adminId: user.id,
    action: updates.status === 'banned' ? 'user_ban' : 'user_update',
    targetType: 'user',
    targetId: userId,
    details: allowedUpdates,
    ipAddress: request.headers.get('x-forwarded-for')
  })

  return NextResponse.json({ success: true })
}
