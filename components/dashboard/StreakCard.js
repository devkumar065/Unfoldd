'use client'

import { motion } from 'framer-motion'
import { Flame, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function StreakCard({ profile, mission }) {
  const streak = profile?.streak_count || 0
  const isDoneToday = mission?.status === 'completed'
  const isUrgent = streak === 0 && !isDoneToday

  const getMessage = () => {
    if (isUrgent) return "Complete today's mission to start your streak!"
    if (streak === 0) return "Start your streak today! 🌱"
    if (streak < 7) return "Great start! Keep going 💪"
    if (streak < 30) return "On fire! Don't stop 🔥"
    return "Legendary consistency! 🏆"
  }

  const days = Array.from({ length: 7 }).map((_, i) => {
    const isToday = i === 6
    if (isToday) return isDoneToday ? 'done' : 'today'
    return (streak > (6 - i)) ? 'done' : 'missed'
  })

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "glass p-6 rounded-3xl border flex flex-col items-center text-center bg-card relative overflow-hidden",
        isUrgent ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]" : "border-border"
      )}
    >
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none",
        isUrgent ? "bg-red-500" : "bg-orange-500"
      )} />

      <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2 relative z-10">Day Streak</p>
      
      <div className="flex items-center justify-center gap-3 mb-4 relative z-10">
        <h2 className="text-6xl font-display font-bold text-white tracking-tighter leading-none">{streak}</h2>
        <motion.div
          animate={streak > 0 ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Flame size={48} className={cn(streak > 0 ? "text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "text-text-muted")} />
        </motion.div>
      </div>

      <div className="flex gap-2 mb-4 relative z-10">
        {days.map((state, i) => (
          <div 
            key={i} 
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors",
              state === 'done' ? "bg-orange-500 text-white border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]" :
              state === 'today' ? "bg-card border-cyan text-cyan border-dashed" :
              "bg-background border-border text-text-muted opacity-50"
            )}
          >
            {['M','T','W','T','F','S','S'][i]}
          </div>
        ))}
      </div>

      <div className={cn("px-4 py-2 rounded-xl text-xs font-bold w-full relative z-10", 
        isUrgent ? "bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center gap-2" : "bg-background border border-border text-text-secondary"
      )}>
        {isUrgent && <AlertCircle size={14} />}
        {getMessage()}
      </div>
      
      {!isUrgent && (
        <p className="text-xs text-text-muted mt-3 relative z-10">Best streak: {profile?.longest_streak || 0} days</p>
      )}
    </motion.div>
  )
}
