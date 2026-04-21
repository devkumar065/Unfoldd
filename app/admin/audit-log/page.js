import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AuditLogClient from './AuditLogClient'

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  // Verify admin and permissions
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!adminUser) {
    redirect('/dashboard')
  }

  // Server-side fetch initial 100 logs
  // Since audit logs are mixed in analytics_events with `admin_%` types
  const { data: initialLogs } = await supabase
    .from('analytics_events')
    .select('*, profile:profiles(full_name, email)') // assuming profiles can be joined to get admin name
    .like('event_type', 'admin_%')
    .order('created_at', { ascending: false })
    .limit(100)

  return <AuditLogClient initialLogs={initialLogs || []} />
}
