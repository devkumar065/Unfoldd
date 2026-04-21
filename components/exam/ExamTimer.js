'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function ExamTimer({ expiresAt, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const calculateRemaining = () => Math.max(0, Math.floor((new Date(expiresAt) - new Date()) / 1000))
    setTimeLeft(calculateRemaining())

    const interval = setInterval(() => {
      const remaining = calculateRemaining()
      setTimeLeft(remaining)
      
      if (remaining === 0) {
        clearInterval(interval)
        onTimeUp()
      }
      
      if (remaining === 900) toast.warning('15 minutes remaining!')
      if (remaining === 300) toast.error('Only 5 minutes left!')
      if (remaining === 60) toast.error('1 minute remaining! Submit now!')
    }, 1000)
    
    return () => clearInterval(interval)
  }, [expiresAt, onTimeUp])

  const m = Math.floor(timeLeft / 60)
  const s = timeLeft % 60
  const formatted = `${m}:${s.toString().padStart(2, '0')}`

  return (
    <div className={`font-mono font-bold text-lg px-4 py-1.5 rounded-xl border tracking-widest ${timeLeft < 300 ? 'bg-red-500/20 text-red-500 border-red-500/40 animate-pulse' : timeLeft < 900 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40' : 'bg-background text-white border-border'}`}>
      {formatted}
    </div>
  )
}
