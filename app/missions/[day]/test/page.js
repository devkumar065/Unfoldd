import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { TestEngineClient } from '@/components/test/TestEngineClient'

export const dynamic = 'force-dynamic'

export default async function TestPage({ params }) {
  const dayNumber = parseInt(params.day, 10)
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: mission } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('day_number', dayNumber)
    .single()

  if (!mission) {
    redirect('/dashboard')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('target_role')
    .eq('id', session.user.id)
    .single()

  // Allow access if they explicitly came here to take the test
  // Or if the mission is already completed
  if (!mission.video_completed && mission.status !== 'completed' && mission.status !== 'in_progress') {
    // We'll allow it for now to fix the skip functionality
    // In a stricter system, we might check a 'skipped' flag or similar
  }

  // Improved test fetch: try video_id first, then day_number + role
  let { data: test } = await supabase
    .from('topic_tests')
    .select('*')
    .eq('video_id', mission.video_id)
    .single()

  if (!test) {
    const { data: fallbackTest } = await supabase
      .from('topic_tests')
      .select('*')
      .eq('day_number', dayNumber)
      .eq('role', profile?.target_role)
      .single()
    
    test = fallbackTest
  }

  if (!test && mission) {
    // AUTO-CREATE TEST RECORD: If mission exists but no test record, create one
    // This unblocks the user and allows the API to generate questions on-the-fly
    const { data: newTest, error: createError } = await supabase
      .from('topic_tests')
      .insert({
        video_id: mission.video_id, // Might be null
        topic_title: mission.topic_title,
        role: profile?.target_role,
        day_number: dayNumber,
        total_questions: 15,
        passing_score: 80
      })
      .select()
      .single()
    
    if (!createError) test = newTest
  }

  if (!test) {
    // If STILL no test (unlikely after auto-create)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div className="glass p-10 rounded-3xl border border-border max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Initializing Test</h2>
          <p className="text-text-secondary mb-6">We are setting up your evaluation for Day {dayNumber}. Please refresh in a few seconds.</p>
          <a href={`/missions/${dayNumber}/test`} className="bg-purple text-white px-6 py-2 rounded-xl font-bold">Refresh Page</a>
        </div>
      </div>
    )
  }

  const { data: existingAttempt } = await supabase
    .from('test_attempts')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('test_id', test.id)
    .order('attempt_number', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <TestEngineClient 
        mission={mission} 
        test={test} 
        existingAttempt={existingAttempt} 
        dayNumber={dayNumber} 
        userId={session.user.id}
      />
    </div>
  )
}
