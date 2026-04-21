'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { formatTime } from '@/lib/youtube/utils'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function VideoProgressBar({ watchedSeconds = 0, totalSeconds = 1, isCompleted }) {
  const { width, height } = useWindowSize()
  const pct = Math.min(100, Math.max(0, (watchedSeconds / totalSeconds) * 100))
  
  return (
    <div className="w-full flex flex-col gap-3 relative">
      {isCompleted && (
         <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
           <Confetti width={300} height={100} recycle={false} numberOfPieces={50} gravity={0.2} style={{position: 'absolute', top: '-50px'}} />
         </div>
      )}
      <div className="flex justify-between text-sm font-medium text-text-secondary">
        <span>Watched: {formatTime(watchedSeconds)}</span>
        <span>{formatTime(totalSeconds - watchedSeconds)} remaining</span>
      </div>
      
      <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border relative">
        <motion.div 
          className={cn("h-full rounded-full transition-colors duration-500", isCompleted ? "bg-green shadow-[0_0_10px_rgba(0,245,160,0.8)]" : "bg-gradient-to-r from-purple to-cyan")}
          style={{ width: `${pct}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center h-6">
        <span className="text-xs font-bold text-text-muted">{Math.floor(pct)}% complete</span>
        <AnimatePresence>
          {isCompleted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-bold text-green flex items-center gap-1 drop-shadow-[0_0_8px_rgba(0,245,160,0.5)]"
            >
              <CheckCircle2 size={14} /> Video Complete! Test is unlocked.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
