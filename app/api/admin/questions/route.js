export const dynamic = 'force-dynamic'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const testId = searchParams.get('testId')
  const difficulty = searchParams.get('difficulty')

  let query = supabase
    .from('test_questions')
    .select('*')
    .eq('test_id', testId)
    .order('difficulty')
    .order('created_at')

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  const { data: questions, error } = await query
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ questions })
}

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { testId, questionData } = await request.json()

  const { data: question, error } = await supabase
    .from('test_questions')
    .insert({
      test_id: testId,
      ...questionData,
      created_by: 'admin',
      is_active: true
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, question })
}

export async function PUT(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { questionId, updates } = await request.json()
  
  const { error } = await supabase.from('test_questions')
    .update(updates)
    .eq('id', questionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { questionId } = await request.json()
  
  const { error } = await supabase.from('test_questions')
    .delete().eq('id', questionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
