import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import IntegrationsPanel from '@/components/admin/IntegrationsPanel'

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (adminUser?.role !== 'superadmin') {
    redirect('/admin')
  }

  // Check if platform_settings table exists by querying it
  let settings = []
  try {
    const { data } = await supabase.from('platform_settings').select('*')
    settings = data || []
  } catch (e) {}

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
      <IntegrationsPanel initialSettings={settings} />
    </div>
  )
}
