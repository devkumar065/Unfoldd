import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FlaggedExamsClient from '@/components/admin/FlaggedExamsClient'

export const dynamic = 'force-dynamic'

export default async function FlaggedExamsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role, permissions')
    .eq('id', session.user.id)
    .single()

  if (!adminUser) redirect('/dashboard')

  // Fetch flagged exams
  // Usually this means `proctoring_flag_count > 0` and `status = 'flagged'` or similar.
  // Using exams table
  const { data: flaggedExams } = await supabase
    .from('exams')
    .select('*, skills(*), profile:profiles(full_name, avatar_url)')
    .gt('proctoring_flag_count', 0)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <FlaggedExamsClient initialExams={flaggedExams || []} adminId={session.user.id} />
    </div>
  )
}
