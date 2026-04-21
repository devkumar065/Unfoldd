import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendPushNotification } from '@/lib/firebase/messaging'
import { sendEmail } from '@/lib/email/mailer'
import { streakLostTemplate } from '@/lib/email/templates'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const { data: profiles } = await supabase.from('profiles').select('id, email, full_name, streak_count, last_mission_completed_at, notification_token').gt('streak_count', 0)

  let streaksReset = 0

  for (const profile of profiles || []) {
    const lastCompleted = profile.last_mission_completed_at ? new Date(profile.last_mission_completed_at) : null
    if (!lastCompleted) continue

    const lastDate = new Date(lastCompleted)
    lastDate.setHours(0, 0, 0, 0)

    if (lastDate < yesterday) {
      await supabase.from('profiles').update({ streak_count: 0 }).eq('id', profile.id)
      await supabase.from('notifications').insert({ user_id: profile.id, title: 'Your Unfoldd Streak has Ended 😢', body: `Your ${profile.streak_count}-day streak has ended. Start a new one today!`, type: 'streak', action_url: '/dashboard' })

      if (profile.notification_token) {
        await sendPushNotification({ token: profile.notification_token, title: 'Your Unfoldd Streak has Ended 😢', body: `Your ${profile.streak_count}-day streak ended. Jump back in today!` })
      }
      
      if(profile.email) {
        await sendEmail({
          to: profile.email,
          subject: `Your Unfoldd ${profile.streak_count}-day streak ended 😢`,
          html: streakLostTemplate(profile.full_name, profile.streak_count)
        })
      }

      streaksReset++
    }
  }

  return NextResponse.json({ success: true, streaksReset, timestamp: new Date().toISOString() })
}
