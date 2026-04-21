export const dynamic = 'force-dynamic'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  // Verify admin
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('permissions')
    .eq('id', user?.id)
    .single()
  
  if (!adminUser?.permissions?.can_view_analytics) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (type === 'overview') {
    const today = new Date()
    today.setHours(0,0,0,0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const [
      { count: totalUsers },
      { count: activeToday },
      { count: signupsToday },
      { count: missionsToday },
      { count: verifiedToday },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active_at', today.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'mission_complete').gte('created_at', today.toISOString()),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'exam_complete').gte('created_at', today.toISOString()),
    ])

    return NextResponse.json({
      totalUsers,
      activeToday,
      signupsToday,
      missionsToday,
      verifiedToday,
    })
  }

  if (type === 'daily_active') {
    // Last 30 days DAU
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('analytics_events')
      .select('created_at, user_id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by date, count unique users
    const grouped = {}
    data?.forEach(event => {
      const date = event.created_at.split('T')[0]
      if (!grouped[date]) grouped[date] = new Set()
      grouped[date].add(event.user_id)
    })

    const chartData = Object.entries(grouped)
      .map(([date, users]) => ({
        date,
        users: users.size
      }))

    return NextResponse.json({ chartData })
  }

  if (type === 'revenue') {
    const { data: transactions, error } = await supabase
      .from('payment_transactions')
      .select('amount, created_at, plan, status')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount / 100), 0) || 0

    return NextResponse.json({ transactions, totalRevenue })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
