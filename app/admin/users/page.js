import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UserManagementClient from '@/components/admin/UserManagement'

export const dynamic = 'force-dynamic'

export default async function UsersPage({ searchParams }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role, permissions')
    .eq('id', session.user.id)
    .single()

  if (!adminUser || !adminUser.permissions?.can_manage_users) {
    redirect('/admin')
  }

  // Note: we can do the initial fetch here or let the client fetch from /api/admin/users
  // Doing it here provides better initial load.

  const search = searchParams.search || ''
  const filter = searchParams.filter || 'all'
  const sort = searchParams.sort || 'newest'
  const page = parseInt(searchParams.page) || 1
  const limit = 50

  let query = supabase
    .from('profiles')
    .select('*, skills(count), daily_missions(count)', { count: 'exact' })

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
    // If you have a status or is_banned column
    // query = query.eq('status', 'banned') 
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

  const { data: users, count } = await query

  return (
    <UserManagementClient 
      initialUsers={users || []} 
      totalCount={count || 0} 
      currentPage={page} 
      currentSearch={search}
      currentFilter={filter}
      currentSort={sort}
    />
  )
}
