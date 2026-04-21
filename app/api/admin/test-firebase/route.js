import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { testFCMConnection } from '@/lib/firebase/messaging'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  // Verify admin
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user?.id)
    .single()

  if (!adminUser) return NextResponse.json(
    { error: 'Unauthorized' }, { status: 401 })

  const result = await testFCMConnection()
  return NextResponse.json(result)
}
