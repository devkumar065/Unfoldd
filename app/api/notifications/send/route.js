import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendPushNotification, sendPushToMultiple } from '@/lib/firebase/messaging'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })

  const authHeader = request.headers.get('authorization')
  const isInternal = authHeader === `Bearer ${process.env.CRON_SECRET}`
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!isInternal && !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, userIds, broadcast, title, body, type, actionUrl, sendPush } = await request.json()

  const notifications = []

  if (broadcast) {
    notifications.push({ user_id: null, title, body, type, action_url: actionUrl, sent_via: ['inapp'] })
    
    if (sendPush) {
      const { data: profiles } = await supabase.from('profiles').select('notification_token').not('notification_token', 'is', null)
      const tokens = profiles.map(p => p.notification_token).filter(Boolean)
      await sendPushToMultiple({ tokens, title, body, data: { url: actionUrl } })
    }
  } else {
    const targets = userIds || (userId ? [userId] : [])
    for (const uid of targets) {
      notifications.push({ user_id: uid, title, body, type, action_url: actionUrl, sent_via: ['inapp'] })
    }
    
    if (sendPush && targets.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, notification_token').in('id', targets).not('notification_token', 'is', null)
      for (const profile of profiles) {
        if (profile.notification_token) {
          await sendPushNotification({ token: profile.notification_token, title, body, data: { url: actionUrl || '/dashboard' } })
        }
      }
    }
  }

  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications)
  }

  return NextResponse.json({ success: true, sent: notifications.length })
}
