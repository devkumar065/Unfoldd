'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, ChevronRight, AlertCircle } from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export function LevelResult({ level, score, passed, nextLevel, onNextLevel, dayNumber, testId, videoId, missionId, attemptId }) {
  const router = useRouter()
  const { width, height } = useWindowSize()
  const [count, setCount] = useState(0)
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    let start = 0
    if (start === score) return
    const timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start === score) clearInterval(timer)
    }, 150)
    return () => clearInterval(timer)
  }, [score])

  const xpEarned = level === 'easy' ? 50 : level === 'medium' ? 75 : 100

  const getMessage = () => {
    if (score === 5) return "Perfect Score! You're a natural 🌟"
    if (score === 4) return "Great job! You've got this 💪"
    if (score === 3) return "So close! Review the video and try again."
    return "Keep trying! Rewatch the video to reinforce concepts."
  }

  const handleRewatch = async () => {
    setIsResetting(true)
    try {
      const res = await fetch('/api/test/reset-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, missionId, attemptId })
      })
      if (!res.ok) throw new Error('Failed to reset video')
      router.push(`/missions/${dayNumber}/video`)
    } catch (error) {
      toast.error(error.message)
      setIsResetting(false)
    }
  }

  if (passed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-md">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={400} gravity={0.15} />
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green/20 via-transparent to-transparent pointer-events-none" />

        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          className="w-32 h-32 rounded-full bg-green/20 border border-green/40 flex items-center justify-center text-green mb-8 shadow-[0_0_50px_rgba(0,245,160,0.4)] relative z-10"
        >
          <CheckCircle2 size={64} />
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl md:text-5xl font-display font-bold text-white mb-2 relative z-10 text-center">
          {count}/5 Correct
        </motion.h2>
        
        <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-2xl font-bold text-green mb-4 relative z-10 text-center">
          Level Passed! ✅
        </motion.h3>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-text-secondary text-lg mb-8 relative z-10 text-center max-w-md">
          {getMessage()}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-purple/20 border border-purple/40 px-6 py-3 rounded-full text-purple-light font-bold text-lg mb-12 flex items-center gap-2 relative z-10 shadow-[0_0_20px_rgba(108,99,255,0.2)]">
          +{xpEarned} XP Earned
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="relative z-10 w-full max-w-sm">
          {nextLevel ? (
            <Button size="lg" fullWidth onClick={onNextLevel} className="h-16 text-lg font-bold bg-gradient-to-r from-purple to-cyan text-white border-0 shadow-[0_0_30px_rgba(108,99,255,0.3)] hover:shadow-[0_0_40px_rgba(108,99,255,0.5)]">
              Continue to {nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)} Level <ArrowRight className="ml-2" />
            </Button>
          ) : (
            <p className="text-text-muted text-center animate-pulse">Processing results...</p>
          )}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl py-10 flex flex-col items-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none z-0" />
      
      <motion.div 
        initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 15 }}
        className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)] relative z-10"
      >
        <XCircle size={48} />
      </motion.div>

      <h2 className="text-5xl font-display font-bold text-red-500 mb-2 relative z-10">{count}/5 Correct</h2>
      <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Level Failed</h3>
      <p className="text-text-secondary text-center max-w-md mb-10 relative z-10 text-lg leading-relaxed">
        You need 4 out of 5 correct to pass. Reviewing the material carefully will help you ace these questions.
      </p>

      <div className="glass p-8 rounded-3xl border border-red-500/30 bg-card/80 w-full mb-10 relative z-10 shadow-[0_0_20px_rgba(239,68,68,0.05)] text-center">
        <h4 className="text-white font-bold mb-3 flex items-center justify-center gap-2"><AlertCircle className="text-red-500"/> Action Required</h4>
        <p className="text-sm text-text-secondary mb-6">You must rewatch the full video before you can attempt this level again. Take notes this time!</p>
        
        <Button size="lg" fullWidth isLoading={isResetting} onClick={handleRewatch} className="h-14 text-lg font-bold bg-red-500 hover:bg-red-600 text-white border-0 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <RefreshCw size={20} className="mr-2" /> Rewatch Video
        </Button>
      </div>
      
      <button onClick={() => router.push('/dashboard')} className="text-text-muted hover:text-white text-sm font-medium transition-colors relative z-10 flex items-center gap-1">
        Back to Dashboard
      </button>
    </motion.div>
  )
}
