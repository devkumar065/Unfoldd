export const dynamic = 'force-dynamic'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminUser } = await supabase
    .from('admin_users').select('id')
    .eq('id', user?.id).single()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { testId, topicTitle, difficulty, count } = await request.json()

  const difficultyGuide = {
    easy: 'basic recall, definitions, what/who/when questions',
    medium: 'concept understanding, how/why questions, use cases',
    hard: 'application, debugging, scenario-based, code snippets'
  }

  const prompt = `
Generate exactly ${count} MCQ questions for "${topicTitle}" at ${difficulty} difficulty.

Difficulty guide: ${difficultyGuide[difficulty]}

Rules:
- Questions must be specific to ${topicTitle}
- All 4 options must be plausible
- Only one correct answer
- Include code snippets in hard questions wrapped in backticks

Return ONLY valid JSON array:
[
  {
    "question_text": "Question here?",
    "options": [
      "A. First option",
      "B. Second option",
      "C. Third option",
      "D. Fourth option"
    ],
    "correct_answer": "A. First option",
    "explanation": "Why A is correct",
    "difficulty": "${difficulty}"
  }
]`

  try {
    const response = await fetch(`${process.env.GROQ_BASE_URL || 'https://api.groq.com/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'groq-chat',
        messages: [{ role: 'system', content: 'You return only valid JSON.' }, { role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) throw new Error('Failed to generate questions via API')

    const aiData = await response.json()
    const content = aiData.choices[0].message.content
    const questions = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim())

    return NextResponse.json({ success: true, questions })
  } catch(e) {
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 })
  }
}
