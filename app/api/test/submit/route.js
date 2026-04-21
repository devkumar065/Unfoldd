export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { testId, videoId, missionId, difficulty, answers, attemptId } = await request.json()

  const questionIds = answers.map(a => a.questionId)
  const { data: questions } = await supabase
    .from('test_questions')
    .select('id, correct_answer')
    .in('id', questionIds)

  let correct = 0
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId)
    if (question && answer.selectedAnswer === question.correct_answer) {
      correct++
    }
  })

  const score = correct
  const passed = score >= 4
  const xpEarned = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 75 : 100

  let updatedAttempt
  let isAllPassed = false

  if (attemptId) {
    const updateData = {
      [`${difficulty}_score`]: score,
      [`${difficulty}_passed`]: passed,
      [`${difficulty}_completed_at`]: new Date().toISOString()
    }

    const { data: currentAttempt } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('id', attemptId)
      .single()

    const allPassed = 
      (difficulty === 'hard' && passed) ||
      (difficulty === 'medium' && passed && currentAttempt.hard_passed) ||
      (currentAttempt.easy_passed && currentAttempt.medium_passed && passed)

    if (allPassed) {
      updateData.all_passed = true
      updateData.status = 'passed'
      updateData.completed_at = new Date().toISOString()
      updateData.xp_earned = 225
      isAllPassed = true
    }

    if (!passed) {
      updateData.status = 'failed'
    }

    const { data } = await supabase
      .from('test_attempts')
      .update(updateData)
      .eq('id', attemptId)
      .select()
      .single()

    updatedAttempt = data
  } else {
    isAllPassed = difficulty === 'hard' && passed // Rare case if starting at hard
    
    const insertData = {
        user_id: user.id,
        test_id: testId,
        video_id: videoId,
        mission_id: missionId,
        attempt_number: 1,
        [`${difficulty}_score`]: score,
        [`${difficulty}_passed`]: passed,
        [`${difficulty}_completed_at`]: new Date().toISOString(),
        status: passed ? 'in_progress' : 'failed',
        started_at: new Date().toISOString()
    }

    if (isAllPassed) {
       insertData.all_passed = true
       insertData.status = 'passed'
       insertData.completed_at = new Date().toISOString()
       insertData.xp_earned = 225
    }

    const { data } = await supabase
      .from('test_attempts')
      .insert(insertData)
      .select()
      .single()

    updatedAttempt = data
  }

  if (isAllPassed) {
    const { data: test } = await supabase
      .from('topic_tests')
      .select('topic_title, role')
      .eq('id', testId)
      .single()

    if (test) {
      await supabase.from('skills').upsert({
        user_id: user.id,
        skill_name: test.topic_title,
        category: test.role,
        source: 'mission',
        is_learned: true,
        learned_at: new Date().toISOString(),
        proficiency_level: 'beginner'
      }, { onConflict: 'user_id,skill_name' })

      await supabase.from('notifications').insert({
        user_id: user.id,
        title: `${test.topic_title} Mastered! 🏆`,
        body: 'Skill added to your portfolio. +225 XP earned!',
        type: 'skill',
        action_url: '/portfolio/edit'
      })

      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: 'test_pass',
        event_data: { test_id: testId, topic: test.topic_title, total_score: 225 }
      })
    }

    await supabase.from('daily_missions')
      .update({ test_completed: true, test_score: score, status: 'test_in_progress' })
      .eq('id', missionId)

    try {
      await supabase.rpc('increment', { x: 225, row_id: user.id })
    } catch(e){}

    await supabase.from('portfolios')
      .update({ last_updated: new Date().toISOString() })
      .eq('user_id', user.id)
  }

  if (!passed) {
    await supabase.from('video_progress')
      .update({ completed: false, completion_percentage: 0, watched_seconds: 0 })
      .eq('user_id', user.id)
      .eq('video_id', videoId)

    await supabase.from('daily_missions')
      .update({ video_completed: false, status: 'in_progress' })
      .eq('id', missionId)

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'test_fail',
      event_data: { test_id: testId, difficulty, score }
    })
  }

  return NextResponse.json({
    success: true,
    score,
    passed,
    xpEarned: passed ? xpEarned : 0,
    allPassed: isAllPassed,
    attemptId: updatedAttempt?.id
  })
}
