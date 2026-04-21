'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export function QuestionFlow({ testId, videoId, missionId, level, timerMinutes, onComplete, attemptId }) {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const submitTest = useCallback(async (finalAnswers) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          videoId,
          missionId,
          difficulty: level,
          answers: finalAnswers,
          attemptId
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      onComplete(data.score, data.passed, data.allPassed, data.attemptId)
    } catch (error) {
      toast.error('Failed to submit test. Answers saved locally.')
      localStorage.setItem(`test_backup_${testId}`, JSON.stringify(finalAnswers))
      setIsSubmitting(false)
    }
  }, [testId, videoId, missionId, level, attemptId, onComplete, isSubmitting])

  const handleTimeUp = useCallback(() => {
    toast.error("Time's up! Submitting your answers automatically.")
    submitTest(answers)
  }, [answers, submitTest])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/test/questions?testId=${testId}&difficulty=${level}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch questions')
        if (!data.questions || data.questions.length === 0) {
            throw new Error('No questions available')
        }
        setQuestions(data.questions)
      } catch (error) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuestions()
  }, [testId, level])

  useEffect(() => {
    if (isLoading || questions.length === 0 || isSubmitting) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 120) toast('2 minutes left! ⏰', { icon: '⚠️' })
        if (prev <= 1) {
          clearInterval(interval)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = "Leaving will count as a failed attempt"
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isLoading, questions.length, isSubmitting, handleTimeUp])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={48} className="text-purple animate-spin mb-4" />
        <p className="text-text-secondary font-medium">Loading {level} questions...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return <div className="text-white text-center">Failed to load questions. Please refresh.</div>
  }

  const currentQ = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const renderQuestionText = (text) => {
    if (text.includes('```')) {
      const parts = text.split('```')
      return (
        <div className="space-y-4">
          <p>{parts[0]}</p>
          <pre className="bg-[#1E1E2E] p-4 rounded-xl overflow-x-auto border border-border">
            <code className="text-green text-sm font-mono">{parts[1].replace(/^[a-z]+\n/, '')}</code>
          </pre>
          {parts[2] && <p>{parts[2]}</p>}
        </div>
      )
    }
    return <p>{text}</p>
  }

  return (
    <div className="max-w-3xl w-full flex flex-col py-4 md:py-10 h-full max-h-screen">
      <div className="flex items-center justify-between mb-8 glass p-4 rounded-2xl border border-border bg-card shadow-sm sticky top-4 z-50">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded bg-purple/10 text-purple-light border border-purple/20">
          Level: {level}
        </span>
        <span className="font-bold text-white text-sm">Question {currentIndex + 1} of {questions.length}</span>
        <div className={cn("flex items-center gap-2 font-bold font-mono px-3 py-1.5 rounded-lg border", 
          timeLeft < 60 ? "bg-red-500/10 text-red-500 border-red-500/30 animate-pulse" : 
          timeLeft < 180 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" : 
          "bg-background text-white border-border"
        )}>
          <Clock size={16} /> {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex gap-2 justify-center mb-8">
        {questions.map((_, i) => (
          <div key={i} className={cn("h-2 rounded-full transition-all duration-500", 
            i < currentIndex ? "w-4 bg-green shadow-[0_0_8px_rgba(0,245,160,0.5)]" : 
            i === currentIndex ? "w-12 bg-purple shadow-[0_0_10px_rgba(108,99,255,0.5)]" : "w-4 bg-border"
          )} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex-1 flex flex-col"
        >
          <div className="glass p-6 md:p-10 rounded-3xl border border-border bg-card shadow-lg mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple" />
            <div className="flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-purple/10 border border-purple/30 text-purple flex items-center justify-center font-bold shrink-0 shadow-inner">
                Q{currentIndex + 1}
              </span>
              <div className="text-xl md:text-2xl font-display font-medium text-white leading-relaxed pt-1">
                {renderQuestionText(currentQ.question_text)}
              </div>
            </div>
          </div>

          <div className="grid gap-4 flex-1 content-start pb-20 md:pb-0">
            {currentQ.options && currentQ.options.map((opt, i) => {
              const isSelected = selectedId === opt
              const isLocked = selectedId !== null && !isSelected

              return (
                <motion.button
                  key={i}
                  disabled={selectedId !== null}
                  onClick={() => handleSelectOption(opt)}
                  whileHover={selectedId === null ? { scale: 1.01, borderColor: 'rgba(108,99,255,0.5)' } : {}}
                  whileTap={selectedId === null ? { scale: 0.98 } : {}}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 glass relative overflow-hidden",
                    isSelected ? "bg-purple border-purple-light text-white shadow-[0_0_20px_rgba(108,99,255,0.3)] scale-[1.02]" :
                    isLocked ? "bg-background/30 border-border text-text-muted opacity-50 cursor-not-allowed" :
                    "bg-card border-border text-text-primary hover:bg-card/80 cursor-pointer"
                  )}
                >
                  <div className="flex items-start gap-4 relative z-10">
                    <span className={cn("font-bold", isSelected ? "text-white" : "text-purple-light")}>
                      {['A.', 'B.', 'C.', 'D.'][i]}
                    </span>
                    <span className="text-[15px] leading-relaxed">{opt.replace(/^[A-D]\.\s*/, '')}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedId !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="fixed md:static bottom-0 left-0 right-0 p-4 md:p-0 bg-background/80 md:bg-transparent backdrop-blur-md border-t border-border md:border-0 z-50 md:mt-8 flex justify-end"
          >
            <Button 
              size="lg" 
              onClick={handleNext} 
              isLoading={isSubmitting}
              className="w-full md:w-auto px-10 h-14 text-lg font-bold bg-white text-black hover:bg-gray-200 border-0"
            >
              {isLast ? "Submit Test" : "Next Question"} &rarr;
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
