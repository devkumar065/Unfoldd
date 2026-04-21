import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSettingsClient from './AdminSettingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (adminUser?.role !== 'superadmin') {
    redirect('/admin')
  }

  const { data: allAdmins } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminSettingsClient currentAdmin={adminUser} allAdmins={allAdmins || []} />
}
