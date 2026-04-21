export const dynamic = 'force-dynamic'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logAdminAction } from '@/lib/admin/auditLog'

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  if (adminUser?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Superadmin only' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  let query = supabase.from('platform_settings').select('id, key, value, category, is_encrypted').order('category')

  if (category) query = query.eq('category', category)

  const { data: settings } = await query

  const masked = settings?.map(s => ({
    ...s,
    value: s.is_encrypted ? maskValue(s.value) : s.value
  }))

  return NextResponse.json({ settings: masked })
}

export async function PUT(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  if (adminUser?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Superadmin only' }, { status: 403 })
  }

  const { settings } = await request.json()

  try {
    for (const setting of settings) {
      await supabase
        .from('platform_settings')
        .upsert({
          key: setting.key,
          value: setting.value,
          category: setting.category,
          is_encrypted: setting.is_encrypted || false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }

  await logAdminAction({
    adminId: user.id,
    action: 'settings_update',
    targetType: 'setting',
    targetId: null,
    details: { keys: settings.map(s => s.key) },
    ipAddress: request.headers.get('x-forwarded-for')
  })

  return NextResponse.json({ success: true })
}

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  if (adminUser?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Superadmin only' }, { status: 403 })
  }

  const { action, service } = await request.json()

  if (action === 'test') {
    if (service === 'groq') {
      try {
        const { groqComplete, GROQ_MODELS } = await import('@/lib/groq/client')
        const start = Date.now()
        await groqComplete({
          prompt: 'Return {"status": "ok", "message": "Groq connected"}',
          modelType: 'fast',
          maxTokens: 20
        })
        const ms = Date.now() - start
        return NextResponse.json({
          success: true,
          message: `Groq connected! Response in ${ms}ms`,
          model: GROQ_MODELS.FAST
        })
      } catch(e) {
        return NextResponse.json({ success: false, message: e.message || 'Groq connection failed' })
      }
    }

    if (service === 'firebase') {
      try {
        const { testFCMConnection } = await import('@/lib/firebase/messaging')
        const result = await testFCMConnection()
        return NextResponse.json({
          success: result.connected,
          message: result.connected 
            ? 'Firebase Admin connected via service account!'
            : result.error || 'Firebase not initialized'
        })
      } catch (e) {
        return NextResponse.json({ success: false, message: e.message })
      }
    }

    if (service === 'email') {
      try {
        const { getSMTPConfig } = await import('@/lib/config/getConfig')
        const config = await getSMTPConfig()
        
        if (!config.user || !config.password) {
          return NextResponse.json({ success: false, message: 'SMTP credentials not configured' })
        }

        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.default.createTransport({
          host: config.host,
          port: config.port,
          secure: config.port === 465,
          auth: { user: config.user, pass: config.password }
        })

        await transporter.verify()
        return NextResponse.json({ success: true, message: 'SMTP connection verified!' })
      } catch(e) {
        return NextResponse.json({ success: false, message: e.message || 'SMTP test failed' })
      }
    }

    if (service === 'razorpay') {
      try {
        const { getRazorpayConfig } = await import('@/lib/config/getConfig')
        const config = await getRazorpayConfig()
        
        if (!config.keyId || !config.keySecret) {
          return NextResponse.json({ success: false, message: 'Razorpay keys not configured' })
        }

        const Razorpay = (await import('razorpay')).default
        const razorpay = new Razorpay({ key_id: config.keyId, key_secret: config.keySecret })
        await razorpay.orders.all({ count: 1 })
        return NextResponse.json({ success: true, message: 'Razorpay connected!' })
      } catch(e) {
        return NextResponse.json({ success: false, message: 'Invalid Razorpay credentials' })
      }
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

function maskValue(value) {
  if (!value || value.length < 8) return '****'
  return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4)
}