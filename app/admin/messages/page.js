import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MessagesCenter from '@/components/admin/MessagesCenter'

export const dynamic = 'force-dynamic'

export default async function AdminMessagesPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('permissions')
    .eq('id', session.user.id)
    .single()

  if (!adminUser?.permissions?.can_send_messages) {
    redirect('/admin')
  }

  // Fetch sent messages
  const { data: messages } = await supabase
    .from('admin_messages')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(50)

  // Fetch quick stats for targeting
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
      <MessagesCenter 
        initialMessages={messages || []} 
        stats={{ totalUsers: totalUsers || 0 }} 
      />
    </div>
  )
}
