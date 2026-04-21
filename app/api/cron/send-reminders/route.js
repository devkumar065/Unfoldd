import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendPushNotification } from '@/lib/firebase/messaging'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const timeSlot = searchParams.get('slot') // morning | afternoon | evening

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: incomplete } = await supabase
    .from('profiles')
    .select('id, full_name, streak_count, notification_token, daily_missions!inner(status, created_at)')
    .eq('daily_missions.status', 'pending')
    .gte('daily_missions.created_at', today.toISOString())
    .eq('onboarding_completed', true)

  const messages = {
    morning: { title: 'Your Daily Mission Awaits! 🎯', body: "Start today's mission and keep your streak alive!" },
    afternoon: { title: "Don't forget your mission! ⚡", body: "You still have time to complete today's mission." },
    evening: { title: "Last chance today! 🔥", body: "Complete your mission before midnight to keep your streak!" }
  }

  const message = messages[timeSlot] || messages.morning
  let sent = 0

  for (const profile of incomplete || []) {
    await supabase.from('notifications').insert({ user_id: profile.id, title: message.title, body: profile.streak_count > 0 ? `${message.body} (🔥 ${profile.streak_count} day streak at risk!)` : message.body, type: 'mission', action_url: '/dashboard' })
    if (profile.notification_token) {
      await sendPushNotification({ token: profile.notification_token, title: message.title, body: profile.streak_count > 0 ? `🔥 ${profile.streak_count} day streak at risk! Complete your mission now.` : message.body, data: { url: '/dashboard' } })
      sent++
    }
  }

  return NextResponse.json({ success: true, slot: timeSlot, usersNotified: sent })
}
