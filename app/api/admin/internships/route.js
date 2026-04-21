export const dynamic = 'force-dynamic'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logAdminAction } from '@/lib/admin/auditLog'

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'all'
  const search = searchParams.get('search')

  let query = supabase
    .from('internships')
    .select(`
      *,
      internship_applications(count)
    `)
    .order('created_at', { ascending: false })

  if (status === 'active') {
    query = query.eq('is_active', true)
  } else if (status === 'expired') {
    query = query.lt('deadline', new Date().toISOString())
  }

  if (search) {
    query = query.or(`company_name.ilike.%${search}%,role.ilike.%${search}%`)
  }

  const { data: internships, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ internships })
}

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const internshipData = await request.json()

  const { data: internship, error } = await supabase
    .from('internships')
    .insert({
      ...internshipData,
      posted_by_admin: user.id
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    adminId: user.id,
    action: 'internship_create',
    targetType: 'internship',
    targetId: internship.id,
    details: { company: internshipData.company_name, role: internshipData.role }
  })

  return NextResponse.json({ success: true, internship })
}

export async function PUT(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const { internshipId, updates } = await request.json()
  
  const { error } = await supabase.from('internships')
    .update(updates)
    .eq('id', internshipId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    adminId: user.id,
    action: 'internship_update',
    targetType: 'internship',
    targetId: internshipId,
    details: updates
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const { internshipId } = await request.json()
  
  // Check applications exist
  const { count } = await supabase
    .from('internship_applications')
    .select('*', { count: 'exact', head: true })
    .eq('internship_id', internshipId)

  if (count > 0) {
    // Soft delete — just deactivate
    await supabase.from('internships')
      .update({ is_active: false })
      .eq('id', internshipId)
      
    await logAdminAction({ adminId: user.id, action: 'internship_deactivate', targetType: 'internship', targetId: internshipId, details: { count } })
  } else {
    // Hard delete
    await supabase.from('internships').delete().eq('id', internshipId)
    await logAdminAction({ adminId: user.id, action: 'internship_delete', targetType: 'internship', targetId: internshipId, details: {} })
  }

  return NextResponse.json({ success: true })
}
