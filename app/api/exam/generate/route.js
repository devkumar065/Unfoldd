export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getGroqConfig, getPlatformLimits } from '@/lib/config/getConfig'
import { groqComplete } from '@/lib/groq/client'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { skillId, skillName } = await request.json()

  // 1. Fetch dynamic config and limits
  const { apiKey, models } = await getGroqConfig()
  const limits = await getPlatformLimits()

  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
  }

  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('exams')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('skill_id', skillId)
    .gte('created_at', today)

  if (count >= limits.maxExamAttempts) {
    return NextResponse.json({ error: `Max ${limits.maxExamAttempts} exam attempts per day` }, { status: 429 })
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + limits.examExpiryHours * 60 * 60 * 1000).toISOString()

  const questionsPrompt = `
Generate exactly 10 exam questions to verify proficiency in "${skillName}".
Mix: 7 MCQ + 3 coding challenges.

Return ONLY valid JSON array:
[
  {
    "question_type": "mcq",
    "question_text": "Question here?",
    "options": ["A. opt1","B. opt2","C. opt3","D. opt4"],
    "correct_answer": "A. opt1",
    "marks": 10
  },
  {
    "question_type": "coding",
    "question_text": "Write a function that...",
    "options": null,
    "correct_answer": "Expected output/approach",
    "marks": 15
  }
]`

  let questions = []
  try {
    const result = await groqComplete({
      prompt: questionsPrompt,
      model: models.smart,
      maxTokens: 3000,
      temperature: 0.7
    })
    
    if (Array.isArray(result)) {
      questions = result
    } else if (result.questions && Array.isArray(result.questions)) {
      questions = result.questions
    }
  } catch(e) {
    console.error("AI question generation failed:", e)
    questions = []
  }

  const { data: exam, error: examError } = await supabase
    .from('exams')
    .insert({
      user_id: user.id,
      skill_id: skillId,
      exam_link_token: token,
      expires_at: expiresAt,
      status: 'pending',
      total_marks: questions.reduce((sum, q) => sum + (q.marks || 10), 0)
    })
    .select()
    .single()

  if (examError) return NextResponse.json({ error: examError.message }, { status: 500 })

  if (questions.length > 0) {
    const insertData = questions.map((q, i) => ({
      exam_id: exam.id,
      question_type: q.question_type || 'mcq',
      question_text: q.question_text || 'Fallback question',
      options: q.options || [],
      correct_answer: q.correct_answer || '',
      marks: q.marks || 10,
      order_index: i + 1
    }))
    
    await supabase.from('exam_questions').insert(insertData)
  }

  const examLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/exam/${token}`

  return NextResponse.json({
    success: true,
    examLink,
    expiresAt,
    token
  })
}