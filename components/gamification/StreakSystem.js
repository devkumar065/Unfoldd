'use client'

import { motion } from 'framer-motion'
import { Flame, Trophy, Calendar, Zap, AlertTriangle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function StreakSystem({ streakCount = 0, longestStreak = 0, recentDays = [] }) {
  // 30 day mock heatmap logic
  const heatmap = Array.from({ length: 30 }).map((_, i) => {
    const isToday = i === 29
    const dayAgo = 29 - i
    const active = i > (29 - streakCount)
    return { active, isToday }
  })

  const getFireIcon = () => {
    if (streakCount >= 90) return { emoji: '👑🔥', size: 'text-7xl', glow: 'shadow-orange-500' }
    if (streakCount >= 60) return { emoji: '🔥🔥🔥', size: 'text-6xl', glow: 'shadow-orange-500' }
    if (streakCount >= 30) return { emoji: '🔥🔥', size: 'text-5xl', glow: 'shadow-orange-500' }
    return { emoji: '🔥', size: 'text-4xl', glow: 'shadow-orange-500' }
  }

  const fire = getFireIcon()

  const milestones = [
    { days: 7, label: 'Week Warrior', reward: '500 XP' },
    { days: 30, label: 'Month Master', reward: '1000 XP' },
    { days: 90, label: 'Legendary', reward: '5000 XP' }
  ]

  const nextMilestone = milestones.find(m => m.days > streakCount) || milestones[2]

  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-[2.5rem] border border-border bg-card/60 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/10 blur-[80px] pointer-events-none" />
        
        <p className="text-xs font-black uppercase tracking-widest text-text-muted mb-4 relative z-10">Current Streak</p>
        
        <motion.div 
          animate={{ scale: [1, 1.1, 1], filter: ["blur(0px)", "blur(2px)", "blur(0px)"] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className={cn("mb-2 relative z-10", fire.size)}
        >
          {fire.emoji}
        </motion.div>
        
        <h2 className="text-7xl font-display font-black text-white mb-2 relative z-10">{streakCount}</h2>
        <p className="text-lg font-bold text-white mb-6 relative z-10">Days Strong</p>
        
        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full text-orange-500 text-xs font-black uppercase tracking-tighter mb-8 relative z-10">
          <Trophy size={14} /> Best: {longestStreak} days
        </div>

        <div className="w-full space-y-4 relative z-10">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
            <span className="text-text-muted">Progress to {nextMilestone.days} days</span>
            <span className="text-white">{streakCount} / {nextMilestone.days}</span>
          </div>
          <div className="h-2 w-full bg-background border border-border rounded-full overflow-hidden">
            <motion.div initial={{width:0}} animate={{width:`${(streakCount/nextMilestone.days)*100}%`}} className="h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
          </div>
          <p className="text-[10px] text-orange-500/80 font-bold uppercase italic">Reward: {nextMilestone.reward} bonus + {nextMilestone.label} Badge</p>
        </div>
      </div>

      <div className="glass p-6 rounded-3xl border border-border bg-card/40">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Calendar size={16}/> 30-Day Heatmap</h3>
        <div className="grid grid-cols-6 gap-2">
          {heatmap.map((day, i) => (
            <motion.div 
              key={i} 
              initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}} transition={{delay: i*0.01}}
              className={cn(
                "aspect-square rounded-md transition-all",
                day.active ? "bg-purple shadow-[0_0_10px_rgba(108,99,255,0.3)]" : "bg-background border border-border/50",
                day.isToday && "border-2 border-cyan animate-pulse"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
