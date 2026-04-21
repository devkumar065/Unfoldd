'use client'

import { motion } from 'framer-motion'
import { Zap, ChevronRight, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const LEVELS = [
  { name: 'Beginner', min: 0, max: 500, icon: '🌱', color: 'text-gray-400', bg: 'bg-gray-400/10' },
  { name: 'Explorer', min: 501, max: 1500, icon: '🔭', color: 'text-cyan', bg: 'bg-cyan/10' },
  { name: 'Builder', min: 1501, max: 3500, icon: '🔨', color: 'text-purple', bg: 'bg-purple/10' },
  { name: 'Developer', min: 3501, max: 7000, icon: '💻', color: 'text-green', bg: 'bg-green/10' },
  { name: 'Expert', min: 7001, max: 15000, icon: '⚡', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { name: 'Master', min: 15001, max: Infinity, icon: '👑', color: 'text-red-500', bg: 'bg-red-500/10' }
]

export function XPSystem({ xpPoints = 0, currentLevelName = 'Beginner' }) {
  const currentLevel = LEVELS.find(l => xpPoints >= l.min && xpPoints <= l.max) || LEVELS[0]
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1]
  
  const progress = nextLevel ? ((xpPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100

  return (
    <div className="glass p-8 rounded-[2.5rem] border border-border bg-card/60 shadow-xl overflow-hidden relative">
      <div className={cn("absolute -right-10 -top-10 w-40 h-40 blur-3xl opacity-20", currentLevel.bg.replace('10', '40'))} />
      
      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className={cn("w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl border-4 border-white/5", currentLevel.bg)}
        >
          {currentLevel.icon}
        </motion.div>

        <div className="flex-1 w-full text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h2 className="text-3xl font-display font-black text-white">{currentLevel.name}</h2>
            <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", currentLevel.color, currentLevel.bg.replace('10', '20'))}>Level {LEVELS.indexOf(currentLevel) + 1}</span>
          </div>
          
          <p className="text-text-secondary text-lg mb-6">You have accumulated <span className="text-white font-black">{xpPoints.toLocaleString()} XP</span></p>
          
          {nextLevel && (
            <div className="space-y-3">
              <div className="flex justify-between items-end text-xs font-bold uppercase tracking-tighter">
                <span className="text-text-muted">Progress to {nextLevel.name}</span>
                <span className="text-white">{xpPoints - currentLevel.min} / {nextLevel.min - currentLevel.min} XP</span>
              </div>
              <div className="h-4 w-full bg-background border border-border rounded-full p-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-purple to-cyan rounded-full shadow-[0_0_15px_rgba(108,99,255,0.5)]"
                />
              </div>
              <p className="text-[10px] text-text-muted font-medium text-center md:text-left italic">Earn more XP by completing missions and verifying skills.</p>
            </div>
          )}
        </div>

        <div className="hidden lg:grid grid-cols-3 gap-2">
           {LEVELS.slice(0, 6).map((lvl, i) => {
             const isEarned = xpPoints >= lvl.min
             return (
               <div key={i} className={cn("w-16 h-16 rounded-2xl border flex items-center justify-center text-2xl transition-all", isEarned ? "bg-card border-purple/30 shadow-lg" : "bg-background/50 border-border grayscale opacity-30")}>
                 {lvl.icon}
               </div>
             )
           })}
        </div>
      </div>
    </div>
  )
}
