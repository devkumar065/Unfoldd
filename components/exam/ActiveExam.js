'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProctoringCamera } from './ProctoringCamera'
import { ExamQuestion } from './ExamQuestion'
import { ExamTimer } from './ExamTimer'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

export function ActiveExam({ exam, stream, onSubmit }) {
  const [answers, setAnswers] = useState([])
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [warningCount, setWarningCount] = useState(0)
  const [warningMsg, setWarningMsg] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const MAX_WARNINGS = 5

  const questions = exam.exam_questions || []

  const logProctoringEvent = useCallback(async (eventType, severity) => {
    setWarningCount(prev => prev + 1)
    try {
      await fetch('/api/exam/proctor/log', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ examId: exam.id, eventType, severity, timestamp: new Date().toISOString() })
      })
    } catch(e) {}
  }, [exam.id])

  const showWarning = useCallback((msg) => {
    setWarningMsg(msg)
  }, [])

  useEffect(() => {
    document.body.classList.add('exam-mode')
    
    const enterFullscreen = () => {
      const el = document.documentElement
      if (el.requestFullscreen) el.requestFullscreen()
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    }

    enterFullscreen()
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        enterFullscreen()
        logProctoringEvent('fullscreen_exit', 'warning')
        showWarning('Exiting fullscreen is not allowed!')
      }
    }

    const blockKeys = (e) => {
      const blocked = [e.ctrlKey, e.altKey, e.metaKey, e.key === 'Tab', e.key === 'F12', e.key === 'F5', e.key === 'Escape', e.key === 'PrintScreen', e.key === 'F11']
      if (blocked.some(Boolean)) {
        e.preventDefault()
        e.stopPropagation()
        logProctoringEvent('keyboard_shortcut', 'warning')
      }
    }
    
    const blockRightClick = (e) => { e.preventDefault(); logProctoringEvent('right_click', 'warning') }
    const blockCopy = (e) => { e.preventDefault(); logProctoringEvent('copy_attempt', 'warning') }
    
    const handleVisibility = () => {
      if (document.hidden) {
        logProctoringEvent('tab_switch', 'critical')
        showWarning('Warning: Do not switch tabs during exam!')
      }
    }

    const handleBeforeUnload = (e) => {
      navigator.sendBeacon('/api/exam/submit', JSON.stringify({ examId: exam.id, answers, autoSubmitted: true }))
      e.preventDefault()
      e.returnValue = 'Leaving will auto-submit your exam. Continue?'
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', blockKeys, true)
    document.addEventListener('contextmenu', blockRightClick)
    document.addEventListener('copy', blockCopy)
    document.addEventListener('cut', blockCopy)
    document.addEventListener('paste', blockCopy)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.body.classList.remove('exam-mode')
      if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen()
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', blockKeys, true)
      document.removeEventListener('contextmenu', blockRightClick)
      document.removeEventListener('copy', blockCopy)
      document.removeEventListener('cut', blockCopy)
      document.removeEventListener('paste', blockCopy)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [answers, exam.id, logProctoringEvent, showWarning])

  const enterFullscreen = () => {
    const el = document.documentElement
    if (el.requestFullscreen) el.requestFullscreen()
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
  }

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId)
      if (existing >= 0) return prev
      return [...prev, { questionId, answer }]
    })
  }

  const handleTimeUp = () => {
    handleSubmit(true)
  }

  const handleSubmit = async (autoSubmitted = false) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: exam.id, answers, autoSubmitted })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onSubmit({ ...data, exam, skillName: exam.skills?.skill_name })
    } catch (e) {
      toast.error('Submission failed. Your answers are saved.')
      setIsSubmitting(false)
    }
  }

  const allAnswered = answers.length === questions.length

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <AnimatePresence>
        {warningMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-red-500/30 z-[100] flex items-center justify-center backdrop-blur-sm">
            <div className="glass bg-card p-8 rounded-3xl border border-red-500 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Warning {warningCount}/{MAX_WARNINGS}</h2>
              <p className="text-text-secondary mb-6">{warningMsg}</p>
              {warningCount >= 3 && <p className="text-red-500 text-sm font-bold mb-6">This exam will be flagged for review if violations continue.</p>}
              <Button fullWidth onClick={() => setWarningMsg(null)} className="bg-red-500 hover:bg-red-600 text-white border-0">Dismiss</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple flex items-center justify-center font-bold text-white font-display text-sm">D</div>
          <span className="font-bold text-white hidden sm:block">Proctored Exam</span>
        </div>
        <div className="text-white font-display font-bold truncate px-4">{exam.skills?.skill_name}</div>
        <div className="flex items-center gap-4">
          {warningCount > 0 && <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30 animate-pulse">⚠️ {warningCount} Warnings</span>}
          <ExamTimer expiresAt={exam.expires_at} onTimeUp={handleTimeUp} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 hide-scrollbar">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {questions.map((q, i) => {
                const isAnswered = answers.some(a => a.questionId === q.id)
                return (
                  <button 
                    key={q.id} onClick={() => setCurrentQIndex(i)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all shrink-0 ${isAnswered ? 'bg-purple text-white border-purple' : i === currentQIndex ? 'bg-card text-white border-white' : 'bg-card border-border text-text-muted'} border-2`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
            
            {questions.length > 0 && (
              <ExamQuestion 
                question={questions[currentQIndex]} 
                questionNumber={currentQIndex + 1} 
                totalQuestions={questions.length}
                selectedAnswer={answers.find(a => a.questionId === questions[currentQIndex].id)?.answer}
                onAnswer={(ans) => handleAnswer(questions[currentQIndex].id, ans)}
                isLocked={answers.some(a => a.questionId === questions[currentQIndex].id)}
              />
            )}

            <div className="mt-10 flex justify-between">
              <Button variant="outline" disabled={currentQIndex === 0} onClick={() => setCurrentQIndex(p => p - 1)}>← Previous</Button>
              {currentQIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentQIndex(p => p + 1)} className="bg-white text-black">Next →</Button>
              ) : (
                <Button isLoading={isSubmitting} disabled={!allAnswered} onClick={() => handleSubmit(false)} className="bg-green hover:bg-green/90 text-black border-0 font-bold px-8">Submit Exam</Button>
              )}
            </div>
          </div>
        </div>

        <div className="w-80 border-l border-border bg-card/30 p-6 flex flex-col shrink-0 overflow-y-auto">
          <ProctoringCamera stream={stream} examId={exam.id} onViolation={logProctoringEvent} />
          
          <div className="mt-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Question Overview</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const isAns = answers.some(a => a.questionId === q.id)
                return (
                  <div key={q.id} onClick={() => setCurrentQIndex(i)} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold border transition-colors cursor-pointer ${isAns ? 'bg-purple/20 border-purple/50 text-purple-light' : i === currentQIndex ? 'bg-white/10 border-white text-white' : 'bg-background border-border text-text-muted'}`}>
                    {i + 1}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-auto pt-8">
            <Button fullWidth isLoading={isSubmitting} disabled={!allAnswered} onClick={() => handleSubmit(false)} className={`h-12 font-bold ${allAnswered ? 'bg-green text-black hover:bg-green/90 border-0 shadow-[0_0_15px_rgba(0,245,160,0.3)] animate-pulse' : 'bg-background border border-border text-text-muted cursor-not-allowed'}`}>
              Submit Exam
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
