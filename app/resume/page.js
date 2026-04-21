import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ResumeBuilderClient } from '@/components/resume/ResumeBuilderClient'

export const dynamic = 'force-dynamic'

export default async function ResumePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')
  const userId = session.user.id

  const [
    { data: profile },
    { data: portfolio },
    { data: skills },
    { data: internships },
    { data: existingResume }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('portfolios').select('*').eq('user_id', userId).single(),
    supabase.from('skills').select('*').eq('user_id', userId),
    supabase.from('internship_applications').select('*, internships(*)').eq('user_id', userId).in('status', ['hired', 'shortlisted']),
    supabase.from('resumes').select('*').eq('user_id', userId).single()
  ])

  return (
    <div className="h-[calc(100vh-80px)]">
      <ResumeBuilderClient 
        profile={profile} 
        portfolio={portfolio || {}} 
        skills={skills || []} 
        internships={internships || []}
        existingResume={existingResume}
      />
    </div>
  )
}
