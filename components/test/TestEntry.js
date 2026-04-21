'use client'

import { motion } from 'framer-motion'
import { Lock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export function TestEntry({ test, existingAttempt, onStartLevel, dayNumber, currentLevel }) {
  const router = useRouter()
  
  const isFailed = existingAttempt?.status === 'failed'
  
  const levels = [
    { id: 'easy', title: 'Level 1: Easy', questions: '5 questions — Basic recall', passReq: 'Need 4/5 to pass', time: '10 minutes', color: 'green' },
    { id: 'medium', title: 'Level 2: Medium', questions: '5 questions — Understanding', passReq: 'Need 4/5 to pass', time: '10 minutes', color: 'yellow' },
    { id: 'hard', title: 'Level 3: Hard', questions: '5 questions — Application', passReq: 'Need 4/5 to pass', time: '15 minutes', color: 'red' }
  ]

  const getStatus = (levelId) => {
    if (isFailed) return 'failed'
    if (existingAttempt) {
      if (levelId === 'easy' && existingAttempt.easy_passed) return 'passed'
      if (levelId === 'medium' && existingAttempt.medium_passed) return 'passed'
      if (levelId === 'hard' && existingAttempt.hard_passed) return 'passed'
    }
    
    if (levelId === currentLevel) return 'current'
    if (levelId === 'medium' && currentLevel === 'easy') return 'locked'
    if (levelId === 'hard' && (currentLevel === 'easy' || currentLevel === 'medium')) return 'locked'
    return 'locked'
  }

  const handleRewatch = async () => {
    try {
      const res = await fetch('/api/test/reset-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: test.video_id, missionId: existingAttempt?.mission_id, attemptId: existingAttempt?.id })
      })
      if (!res.ok) throw new Error('Failed to reset video')
      router.push(`/missions/${dayNumber}/video`)
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl w-full flex flex-col items-center py-10"
    >
      <div className="text-center mb-10">
        <span className="bg-purple/20 text-purple-light px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-purple/30">Verification Test</span>
        <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">{test.topic_title}</h1>
        <p className="text-text-secondary text-lg">Prove what you learned from today&apos;s video</p>
      </div>

      {isFailed && (
        <div className="w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 shrink-0">
              <XCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Previous attempt failed</h3>
              <p className="text-sm text-text-secondary">You must rewatch the video before retrying</p>
            </div>
          </div>
          <Button onClick={handleRewatch} className="bg-red-500 hover:bg-red-600 text-white font-bold w-full sm:w-auto shrink-0 shadow-lg shadow-red-500/20">
            <RefreshCw size={18} className="mr-2" /> Rewatch Video
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
        {levels.map((level, i) => {
          const status = getStatus(level.id)
          const colorMap = {
            green: 'from-green/20 to-transparent border-green/30 text-green',
            yellow: 'from-yellow-500/20 to-transparent border-yellow-500/30 text-yellow-500',
            red: 'from-red-500/20 to-transparent border-red-500/30 text-red-500'
          }

          return (
            <div key={level.id} className={cn(
              "glass rounded-3xl p-6 border bg-card relative overflow-hidden transition-all duration-300 flex flex-col",
              status === 'passed' ? "border-green/50 opacity-80" : 
              status === 'locked' ? "border-border opacity-50 grayscale" : 
              status === 'failed' ? "border-red-500/50" :
              "border-purple/50 shadow-[0_0_30px_rgba(108,99,255,0.15)] scale-105 z-10"
            )}>
              {status === 'current' && <div className="absolute inset-0 bg-gradient-to-b from-purple/10 to-transparent z-0 pointer-events-none" />}
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-background border", colorMap[level.color])}>
                    {level.title}
                  </span>
                  {status === 'locked' && <Lock size={18} className="text-text-muted" />}
                  {status === 'passed' && <CheckCircle2 size={18} className="text-green" />}
                  {status === 'failed' && <XCircle size={18} className="text-red-500" />}
                </div>
                
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="text-sm text-white font-medium flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-text-muted" />{level.questions}</li>
                  <li className="text-sm text-white font-medium flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-text-muted" />{level.passReq}</li>
                  <li className="text-sm text-text-secondary flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-text-muted" />Timer: {level.time}</li>
                </ul>

                <div className="pt-4 border-t border-border mt-auto">
                  <span className={cn("text-sm font-bold", 
                    status === 'passed' ? "text-green" :
                    status === 'current' ? "text-purple-light" :
                    status === 'failed' ? "text-red-500" : "text-text-muted"
                  )}>
                    {status === 'passed' ? 'Passed ✅' : status === 'current' ? 'Next Up' : status === 'failed' ? 'Failed ✗' : 'Not Started'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="glass p-6 rounded-2xl border border-border bg-background w-full max-w-2xl mb-10 text-sm text-text-secondary leading-relaxed">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2"><AlertCircle size={16} className="text-purple" /> Test Rules</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Answer all 5 questions per level. You need 4 out of 5 correct to pass.</li>
          <li>Once you select an answer it is locked.</li>
          <li>Failing any level requires rewatching the video.</li>
          <li>Passing all 3 levels verifies this skill and adds it to your portfolio.</li>
        </ul>
      </div>

      {!isFailed && (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <Button 
            size="lg" 
            onClick={() => onStartLevel(currentLevel)}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple to-cyan text-white border-0 shadow-[0_0_20px_rgba(108,99,255,0.4)] hover:shadow-[0_0_30px_rgba(108,99,255,0.6)] animate-pulse"
          >
            Begin {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)} Level &rarr;
          </Button>
          <span className="text-xs text-text-muted font-medium">
            {existingAttempt ? `Attempt ${existingAttempt.attempt_number || 1}` : 'This is your first attempt'}
          </span>
        </div>
      )}
    </motion.div>
  )
}
