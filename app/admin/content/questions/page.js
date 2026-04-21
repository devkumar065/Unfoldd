import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import QuestionBankClient from '@/components/admin/content/QuestionBank'

export const dynamic = 'force-dynamic'

export default async function QuestionsPage({ searchParams }) {
  const supabase = createServerComponentClient({ cookies })

  // Fetch all topics (tests) to show in sidebar
  const { data: topics } = await supabase
    .from('topic_tests')
    .select(`
      *,
      test_questions (count)
    `)
    .order('role')
    .order('day_number')

  // Fetch questions for selected topic if testId exists
  const selectedTestId = searchParams.testId
  let selectedQuestions = []
  if (selectedTestId) {
    const { data } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', selectedTestId)
      .order('difficulty')
      .order('created_at')
    selectedQuestions = data || []
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
      <QuestionBankClient 
        initialTopics={topics || []} 
        initialQuestions={selectedQuestions}
        selectedTestId={selectedTestId}
      />
    </div>
  )
}