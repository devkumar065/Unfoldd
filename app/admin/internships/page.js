import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import InternshipsManagementClient from './InternshipsManagementClient'

export const dynamic = 'force-dynamic'

export default async function InternshipsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: internships } = await supabase
    .from('internships')
    .select('*, companies(company_name, logo_url)')
    .order('created_at', { ascending: false })

  return <InternshipsManagementClient initialInternships={internships || []} />
}
