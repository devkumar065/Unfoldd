import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SettingsClient from '@/components/settings/SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const [
    { data: profile },
    { data: portfolio }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', session.user.id).single(),
    supabase.from('portfolios').select('*').eq('user_id', session.user.id).single()
  ])

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24">
      <SettingsClient user={session.user} profile={profile} portfolio={portfolio} />
    </div>
  )
}
