import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { groqComplete, GROQ_MODELS } from '@/lib/groq/client'
import { SYSTEM_PROMPTS } from '@/lib/groq/prompts'
import { getGroqConfig } from '@/lib/config/getConfig'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(
    { error: 'Unauthorized' }, { status: 401 })

  const { videoId, missionId, dayNumber } = await request.json()

  // 1. Mark video complete
  await supabase.from('video_progress')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      completion_percentage: 100
    })
    .eq('user_id', user.id)
    .eq('video_id', videoId)

  await supabase.from('daily_missions')
    .update({
      video_completed: true,
      status: 'video_done'
    })
    .eq('id', missionId)
    .eq('user_id', user.id)

  // 2. ── GET VIDEO DETAILS ─────────────────────
  const { data: video } = await supabase
    .from('topic_videos')
    .select('topic_title, role, difficulty')
    .eq('id', videoId)
    .single()

  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  // 3. ── CHECK IF TEST EXISTS ──────────────────
  let { data: test } = await supabase
    .from('topic_tests')
    .select('id')
    .eq('video_id', videoId)
    .single()

  if (!test) {
    // Create test record
    const { data: newTest, error: testError } = await supabase
      .from('topic_tests')
      .insert({
        video_id: videoId,
        topic_title: video.topic_title,
        role: video.role,
        day_number: dayNumber,
        total_questions: 15,
        passing_score: 80
      })
      .select()
      .single()
    
    if (testError) {
      console.error('Test creation error:', testError)
      return NextResponse.json({ error: 'Failed to create test' }, { status: 500 })
    }
    test = newTest
  }

  // 4. ── CHECK IF QUESTIONS EXIST ──────────────
  const { count: questionCount } = await supabase
    .from('test_questions')
    .select('*', { count: 'exact', head: true })
    .eq('test_id', test.id)

  // Generate questions if none exist
  if (questionCount === 0) {
    // Generate in background — don't block
    generateQuestionsForTest({
      testId: test.id,
      topicTitle: video.topic_title,
      role: video.role,
      difficulty: video.difficulty
    }).catch(e => console.error('Question generation failed:', e))
  }

  // 5. Send notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    title: 'Video Complete! Test Unlocked 🎉',
    body: `You finished "${video.topic_title}". Take the test to verify your skill.`,
    type: 'mission',
    action_url: `/missions/${dayNumber}/test`
  })

  return NextResponse.json({
    success: true,
    testId: test.id,
    testUnlocked: true,
    questionsReady: (questionCount || 0) > 0
  })
}

// ── QUESTION GENERATION FUNCTION ─────────────
async function generateQuestionsForTest({
  testId, topicTitle, role, difficulty
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { apiKey, models } = await getGroqConfig()
  if (!apiKey) {
    console.error('Groq API key not configured for background question generation')
    return
  }

  const difficulties = ['easy', 'medium', 'hard']
  
  for (const diff of difficulties) {
    const prompt = `
Generate exactly 5 MCQ questions to test understanding of "${topicTitle}" for ${role} students.

Difficulty: ${diff}
Guidelines:
- easy: Basic definitions, what/who/when
- medium: How it works, why we use it, comparisons  
- hard: Application, debugging, code analysis, edge cases

IMPORTANT: Questions must be:
1. Specific to "${topicTitle}" 
2. Based on real interview patterns
3. Have exactly one clearly correct answer
4. Other options must be plausible (no obvious wrong answers)

Return this EXACT JSON (no other text):
{
  "questions": [
    {
      "question_text": "Clear question text here?",
      "options": [
        "A. First option",
        "B. Second option",
        "C. Third option",
        "D. Fourth option"
      ],
      "correct_answer": "A. First option",
      "explanation": "Why this is correct in 1 sentence",
      "difficulty": "${diff}"
    }
  ]
}`

    try {
      const result = await groqComplete({
        prompt,
        model: models.fast,
        maxTokens: 2000,
        temperature: 0.5,
        systemPrompt: SYSTEM_PROMPTS.QUESTION_GENERATOR.replace('${topic}', topicTitle)
      })

      if (result.questions?.length > 0) {
        // Save to database
        await supabase.from('test_questions').insert(
          result.questions.map(q => ({
            test_id: testId,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation || '',
            difficulty: diff,
            created_by: 'ai',
            is_active: true
          }))
        )
      }

      // Small delay between API calls
      await new Promise(r => setTimeout(r, 500))
      
    } catch(error) {
      console.error(`Failed to generate ${diff} questions:`, error)
    }
  }
}
