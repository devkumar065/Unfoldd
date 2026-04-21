'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, ChevronRight, Share2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function ExamResult({ exam, score, totalMarks, passed, flagged, flagCount, skillName }) {
  const router = useRouter()
  const percent = Math.round((score / totalMarks) * 100)

  if (passed && !flagged) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green/10 via-transparent to-transparent pointer-events-none" />
        
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-32 h-32 rounded-full bg-green/20 border border-green/40 flex items-center justify-center text-green mb-8 shadow-[0_0_50px_rgba(0,245,160,0.4)] relative z-10">
          <CheckCircle2 size={64} />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 text-center relative z-10">Skill Verified! ✅</h1>
        
        <div className="text-center mb-10 relative z-10">
          <p className="text-6xl font-bold text-white tracking-tighter mb-2">{percent}%</p>
          <p className="text-text-secondary">{score}/{totalMarks} marks</p>
        </div>

        <div className="glass p-6 rounded-3xl border border-green/30 bg-green/5 max-w-md w-full mb-8 relative z-10 text-center shadow-xl">
          <div className="w-12 h-12 bg-purple rounded-xl flex items-center justify-center font-display font-bold text-white mx-auto mb-4">D</div>
          <h3 className="text-xl font-bold text-white mb-1">{skillName}</h3>
          <div className="inline-flex items-center gap-1 bg-green/20 text-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-green/30"><ShieldCheck size={14}/> Verified</div>
          <p className="text-sm text-text-secondary">This badge has been added to your portfolio and is visible to all companies.</p>
        </div>

        <div className="flex items-center gap-2 bg-green/10 border border-green/20 px-4 py-2 rounded-full text-green text-sm font-bold mb-10 relative z-10">
          <CheckCircle2 size={16} /> Clean exam — no violations
        </div>

        <div className="flex flex-col gap-3 w-full max-w-md relative z-10">
          <Button size="lg" onClick={() => router.push('/portfolio/edit')} className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple to-cyan text-white border-0 shadow-[0_0_20px_rgba(108,99,255,0.4)]">
            View My Portfolio <ChevronRight className="ml-2" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none" />
      
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }} className="w-32 h-32 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-8 shadow-[0_0_50px_rgba(239,68,68,0.2)] relative z-10">
        {flagged ? <AlertTriangle size={64} /> : <XCircle size={64} />}
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 text-center relative z-10">
        {flagged ? 'Exam Flagged' : 'Not Quite There Yet'}
      </h1>
      
      <div className="text-center mb-8 relative z-10">
        <p className="text-5xl font-bold text-red-500 tracking-tighter mb-2">{percent}%</p>
        <p className="text-text-secondary">{score}/{totalMarks} marks — You need 70% to pass</p>
      </div>

      {flagged ? (
        <div className="glass p-6 rounded-3xl border border-red-500/30 bg-card max-w-md w-full mb-8 relative z-10 text-center">
          <h3 className="font-bold text-red-500 mb-2">Result is pending admin approval</h3>
          <p className="text-text-secondary text-sm">We recorded {flagCount} proctoring violations during your session. An admin will review your exam within 24 hours.</p>
        </div>
      ) : (
        <div className="glass p-6 rounded-3xl border border-border bg-card max-w-md w-full mb-8 relative z-10 text-center">
          <p className="text-text-secondary text-sm mb-4">Don&apos;t give up! Review the topic and try again. Most skills take 2-3 attempts to verify.</p>
          <div className="bg-background border border-border rounded-xl p-4 text-left">
            <h4 className="text-xs font-bold text-text-muted uppercase mb-2">What to do next:</h4>
            <ol className="list-decimal list-inside text-sm text-white space-y-2">
              <li>Review the topic video again</li>
              <li>Practice more coding challenges</li>
              <li>Generate a new exam link when ready</li>
            </ol>
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative z-10">
        <Button size="lg" fullWidth onClick={() => router.push('/dashboard')} className="h-14 font-bold bg-white text-black hover:bg-gray-200">
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
