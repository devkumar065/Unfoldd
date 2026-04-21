import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ExamClient } from '@/components/exam/ExamClient'
import { XCircle, Clock, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ExamPage({ params }) {
  const { token } = params
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/auth/login?redirect=/exam/${token}`)
  }

  const { data: exam } = await supabase
    .from('exams')
    .select('*, skills (skill_name, category), exam_questions (*)')
    .eq('exam_link_token', token)
    .eq('user_id', user.id)
    .single()

  if (!exam) {
    return <InvalidExamScreen reason="invalid" message="This exam link is invalid or does not belong to your account." />
  }

  if (exam.status === 'completed' || exam.status === 'flagged') {
    return <InvalidExamScreen reason="completed" exam={exam} message="You have already completed this exam." />
  }

  if (new Date() > new Date(exam.expires_at)) {
    await supabase.from('exams').update({ status: 'expired' }).eq('id', exam.id)
    return <InvalidExamScreen reason="expired" message="This exam link has expired. Generate a new one from your dashboard." />
  }

  return <ExamClient exam={exam} user={user} token={token} />
}

function InvalidExamScreen({ reason, message, exam }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="glass p-10 rounded-3xl border border-border bg-card max-w-md w-full flex flex-col items-center">
        {reason === 'invalid' && <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6"><XCircle size={40} /></div>}
        {reason === 'expired' && <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-6"><Clock size={40} /></div>}
        {reason === 'completed' && <div className="w-20 h-20 bg-green/10 text-green rounded-full flex items-center justify-center mb-6"><CheckCircle2 size={40} /></div>}
        
        <h2 className="text-2xl font-bold text-white mb-4">
          {reason === 'invalid' ? 'Invalid Link' : reason === 'expired' ? 'Link Expired' : 'Exam Completed'}
        </h2>
        <p className="text-text-secondary mb-8">{message}</p>
        
        {reason === 'completed' && exam && (
          <div className="w-full bg-background border border-border rounded-xl p-4 mb-8">
            <p className="text-sm text-text-muted uppercase font-bold tracking-wider mb-1">Your Score</p>
            <p className="text-3xl font-display font-bold text-white">{exam.score}/{exam.total_marks}</p>
          </div>
        )}
        
        <a href="/dashboard" className="w-full inline-flex items-center justify-center h-12 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}
