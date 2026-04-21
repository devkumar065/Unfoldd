import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UserDetailClient from '@/components/admin/UserDetailClient'

export const dynamic = 'force-dynamic'

export default async function UserDetailPage({ params }) {
  const { id } = params
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role, permissions')
    .eq('id', session.user.id)
    .single()

  if (!adminUser || !adminUser.permissions?.can_manage_users) {
    redirect('/admin')
  }

  // Parallel fetch user details
  const [
    { data: profile },
    { data: missions },
    { data: skills },
    { data: exams },
    { data: applications },
    { data: payments },
    { data: activity }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('daily_missions').select('*, video_id(*)').eq('user_id', id).order('day_number', { ascending: true }),
    supabase.from('skills').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('exams').select('*, skills(*)').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('internship_applications').select('*, internships(*)').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('payment_transactions').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('analytics_events').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(100)
  ])

  if (!profile) {
    return <div className="p-10 text-white text-center">User not found.</div>
  }

  return (
    <UserDetailClient 
      profile={profile}
      missions={missions || []}
      skills={skills || []}
      exams={exams || []}
      applications={applications || []}
      payments={payments || []}
      activity={activity || []}
    />
  )
}
