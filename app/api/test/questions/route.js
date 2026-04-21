export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { groqComplete, GROQ_MODELS } from '@/lib/groq/client'
import { getGroqConfig } from '@/lib/config/getConfig'

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const testId = searchParams.get('testId')
  const difficulty = searchParams.get('difficulty')

  if (!testId || !difficulty) {
    return NextResponse.json({ error: 'testId and difficulty required' }, { status: 400 })
  }

  // ── FETCH CONFIG ──────────────────────────
  const { apiKey, models } = await getGroqConfig()

  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
  }

  // 1. Check for existing questions in DB
  const { data: existing } = await supabase
    .from('test_questions')
    .select('*')
    .eq('test_id', testId)
    .eq('difficulty', difficulty)
    .eq('is_active', true)

  if (existing && existing.length >= 5) {
    // Shuffle and return 5
    const shuffled = existing.sort(() => Math.random() - 0.5).slice(0, 5)
    return NextResponse.json({ 
      questions: shuffled,
      source: 'database'
    })
  }

  // 2. Not enough questions — generate with Groq
  const needed = 5 - (existing?.length || 0)
  
  const { data: test } = await supabase
    .from('topic_tests')
    .select('topic_title, role')
    .eq('id', testId)
    .single()

  if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 })

  const prompt = `
Generate exactly ${needed} MCQ questions for "${test.topic_title}" at ${difficulty} difficulty for ${test.role} students.

Difficulty: ${difficulty}
- easy: Basic recall and definitions
- medium: Understanding and application  
- hard: Code analysis and complex scenarios

Return EXACT JSON (no other text):
{
  "questions": [
    {
      "question_text": "Question text here?",
      "options": [
        "A. Option 1",
        "B. Option 2",
        "C. Option 3",
        "D. Option 4"
      ],
      "correct_answer": "A. Option 1",
      "explanation": "Brief explanation",
      "difficulty": "${difficulty}"
    }
  ]
}`

  try {
    const result = await groqComplete({
      prompt,
      modelType: 'fast',
      maxTokens: 2000,
      temperature: 0.5
    })

    if (result.questions?.length > 0) {
      // Save to DB
      const { data: saved, error: insertError } = await supabase
        .from('test_questions')
        .insert(result.questions.map(q => ({
          test_id: testId,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation || '',
          difficulty: difficulty,
          created_by: 'ai',
          is_active: true
        })))
        .select()

      if (insertError) {
        console.error('Error saving generated questions:', insertError)
      }

      // Combine with any existing and return
      const allQuestions = [
        ...(existing || []),
        ...(saved || [])
      ].slice(0, 5)

      return NextResponse.json({
        questions: allQuestions,
        source: 'ai_generated'
      })
    }
  } catch(error) {
    console.error('Question generation failed:', error)
  }

  // Last resort: return whatever exists
  return NextResponse.json({
    questions: existing || [],
    source: 'partial',
    warning: 'Could not generate enough questions'
  })
}