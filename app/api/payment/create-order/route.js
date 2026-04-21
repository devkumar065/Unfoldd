import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { getRazorpayConfig } from '@/lib/config/getConfig'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { plan } = await request.json()
    const config = await getRazorpayConfig()

    if (!config.keyId || !config.keySecret) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 })
    }

    const amount = plan === 'premium' ? config.premiumPrice : config.proPrice
    
    const instance = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    })

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    }

    const order = await instance.orders.create(options)

    // Log the transaction attempt
    await supabase.from('payment_transactions').insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      amount: amount * 100,
      plan: plan,
      status: 'created'
    })

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      key_id: config.keyId
    })

  } catch (error) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
