import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CompanyDashboardClient } from '@/components/company/CompanyDashboard'

export const dynamic = 'force-dynamic'

export default async function CompanyPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!company) {
    redirect('/company/register')
  }

  // Initial talent fetch (limit by plan)
  const { data: talent } = await supabase
    .from('profiles')
    .select('*, skills(*)')
    .eq('onboarding_completed', true)
    .limit(20)

  const { data: postings } = await supabase
    .from('internships')
    .select('*')
    .eq('posted_by_admin', session.user.id)

  const { data: applications } = await supabase
    .from('internship_applications')
    .select('*, profiles(*), internships(*)')
    .in('internship_id', postings?.map(p => p.id) || [])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <CompanyDashboardClient 
        company={company} 
        talent={talent || []} 
        postings={postings || []}
        applications={applications || []}
      />
    </div>
  )
}
