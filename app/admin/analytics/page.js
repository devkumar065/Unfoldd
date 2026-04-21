import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AnalyticsDashboardClient from './AnalyticsDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('permissions')
    .eq('id', session.user.id)
    .single()

  if (!adminUser?.permissions?.can_view_analytics) {
    redirect('/admin')
  }

  return <AnalyticsDashboardClient />
}
