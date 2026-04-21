export const dynamic = 'force-dynamic'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  // Verify admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, permissions, full_name')
    .eq('id', user?.id)
    .single()
  
  if (!adminUser?.permissions?.can_send_messages) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { recipientType, recipientIds, subject, messageBody, sendVia, scheduledFor } = await request.json()

  // Determine target users
  let targetUsers = []

  let query = supabase.from('profiles').select('id, full_name, email, notification_token, streak_count, target_role')

  if (recipientType === 'specific') {
    query = query.or(`email.eq.${recipientIds[0]},id.eq.${recipientIds[0]}`)
  } else if (recipientType === 'role') {
    query = query.eq('target_role', recipientIds[0])
  } else if (recipientType === 'activity') {
    const filter = recipientIds[0]
    if (filter === 'active_streak') query = query.gt('streak_count', 7)
    else if (filter === 'inactive') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      query = query.lt('last_active_at', sevenDaysAgo.toISOString())
    }
    else if (filter === 'premium') query = query.eq('is_premium', true)
    else if (filter === 'free') query = query.eq('is_premium', false)
  }

  const { data } = await query
  targetUsers = data || []

  function personalizeMessage(body, u) {
    return body
      .replace(/{{name}}/g, u.full_name?.split(' ')[0] || 'Student')
      .replace(/{{streak}}/g, u.streak_count || '0')
      .replace(/{{target_role}}/g, u.target_role || 'your career')
  }

  let sentCount = 0
  let failedCount = 0

  // For demonstration, we'll process instantly, skipping real SMTP/Push limits unless implemented.
  const notificationInserts = []

  for (const u of targetUsers) {
    try {
      const personalizedBody = personalizeMessage(messageBody, u)

      if (sendVia.includes('inapp')) {
        notificationInserts.push({
          user_id: u.id,
          title: subject,
          body: personalizedBody,
          type: 'admin_message',
          action_url: '/dashboard'
        })
      }

      // Email and Push logic would go here if configured
      // Example: await sendEmail({...})
      // Example: await sendPushNotification({...})

      sentCount++
    } catch(err) {
      failedCount++
      console.error(`Failed to send to ${u.id}:`, err)
    }
  }

  if (notificationInserts.length > 0) {
    await supabase.from('notifications').insert(notificationInserts)
  }

  // Save message record
  // Assuming table `admin_messages` exists, or we skip if not.
  let messageId = null
  try {
    const { data: message } = await supabase
      .from('admin_messages')
      .insert({
        sent_by: user.id,
        recipient_type: recipientType,
        subject,
        message_body: messageBody,
        send_via: sendVia,
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipient_count: sentCount
      })
      .select()
      .single()
    messageId = message?.id
  } catch(e) {}

  // Log admin action
  const { logAdminAction } = await import('@/lib/admin/auditLog')
  await logAdminAction({
    adminId: user.id,
    action: 'message_sent',
    targetType: 'users',
    targetId: messageId,
    details: { subject, recipientType, sentCount, channels: sendVia }
  })

  return NextResponse.json({ success: true, sentCount, failedCount, messageId })
}
