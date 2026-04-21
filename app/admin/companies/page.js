import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CompaniesManagementClient from './CompaniesManagementClient'

export const dynamic = 'force-dynamic'

export default async function CompaniesPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: companies } = await supabase
    .from('companies')
    .select(`
      *,
      internships(count)
    `)
    .order('created_at', { ascending: false })

  return <CompaniesManagementClient initialCompanies={companies || []} />
}
