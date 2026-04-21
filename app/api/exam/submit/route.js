export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { examId, answers, autoSubmitted } = await request.json()

  const { data: exam } = await supabase
    .from('exams')
    .select('*, exam_questions(*)')
    .eq('id', examId)
    .eq('user_id', user.id)
    .single()

  if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  if (exam.status !== 'active') return NextResponse.json({ error: 'Exam not active' }, { status: 400 })

  let totalMarks = 0
  let earnedMarks = 0

  for (const question of exam.exam_questions) {
    totalMarks += question.marks
    const studentAnswer = answers.find(a => a.questionId === question.id)
    
    if (studentAnswer) {
      const isCorrect = studentAnswer.answer === question.correct_answer
      await supabase.from('exam_questions')
        .update({ student_answer: studentAnswer.answer, is_correct: isCorrect })
        .eq('id', question.id)
      
      if (isCorrect) earnedMarks += question.marks
    }
  }

  const percentage = Math.round((earnedMarks / totalMarks) * 100)
  const passed = percentage >= 70

  const { count: flagCount } = await supabase
    .from('proctoring_logs')
    .select('*', { count: 'exact' })
    .eq('exam_id', examId)
    .eq('flagged', true)

  const isFlagged = flagCount >= 3
  const finalStatus = isFlagged ? 'flagged' : 'completed'

  await supabase.from('exams').update({
    status: finalStatus, score: earnedMarks, total_marks: totalMarks,
    passed: passed && !isFlagged, proctoring_flag_count: flagCount,
    auto_submitted: autoSubmitted || false, submitted_at: new Date().toISOString()
  }).eq('id', examId)

  if (passed && !isFlagged) {
    await supabase.from('skills').update({
      is_verified: true, verified_at: new Date().toISOString(), exam_id: examId
    }).eq('id', exam.skill_id)

    await supabase.from('portfolios').update({ last_updated: new Date().toISOString() }).eq('user_id', user.id)

    try { await supabase.rpc('increment', { x: 250, row_id: user.id }) } catch(e){}

    const { count: verifiedCount } = await supabase
      .from('skills').select('*', { count: 'exact' }).eq('user_id', user.id).eq('is_verified', true)

    if (verifiedCount === 1) {
      await supabase.from('badges').insert({ user_id: user.id, badge_type: 'first_verified' }).select().single().catch(() => {})
    }

    await supabase.from('notifications').insert({
      user_id: user.id, title: 'Skill Verified! 🏆', body: 'Your skill has been officially verified. Visible to companies now!',
      type: 'skill', action_url: '/portfolio/edit'
    })

    await supabase.from('analytics_events').insert({
      user_id: user.id, event_type: 'exam_complete', event_data: { exam_id: examId, score: percentage, passed: true }
    })
  }

  if (isFlagged) {
    await supabase.from('notifications').insert({
      user_id: null, title: 'Exam Flagged for Review', body: `Exam ${examId} has ${flagCount} proctoring violations`,
      type: 'system', action_url: `/admin/exams/${examId}`
    })
  }

  return NextResponse.json({ success: true, score: earnedMarks, totalMarks, percentage, passed: passed && !isFlagged, flagged: isFlagged, flagCount })
}
