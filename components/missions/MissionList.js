'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Lock, Target, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

export function MissionList({ missions = [], roadmap }) {
  const router = useRouter()
  const [view, setView] = useState('timeline')

  const currentDay = roadmap?.current_day || 1
  const totalDays = roadmap?.total_days || 90

  const allDays = Array.from({ length: totalDays }).map((_, i) => {
    const day = i + 1
    const mission = (missions || []).find(m => m.day_number === day)
    return {
      day,
      mission,
      isCompleted: mission?.status === 'completed',
      isCurrent: day === currentDay,
      isLocked: day > currentDay
    }
  })

  const weeks = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  return (
    <div className="space-y-6">
      <div className="flex bg-card border border-border rounded-lg p-1 w-max">
        <button onClick={() => setView('timeline')} className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", view === 'timeline' ? "bg-purple text-white shadow-sm" : "text-text-muted hover:text-white")}>Timeline</button>
        <button onClick={() => setView('calendar')} className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", view === 'calendar' ? "bg-purple text-white shadow-sm" : "text-text-muted hover:text-white")}>Calendar</button>
      </div>

      {view === 'timeline' && (
        <div className="space-y-12">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="space-y-4">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider pl-4 border-l-2 border-purple-light">Week {wIdx + 1}</h3>
              <div className="space-y-3">
                {week.map(({ day, mission, isCompleted, isCurrent, isLocked }) => (
                  <motion.div 
                    key={day}
                    onClick={() => !isLocked && router.push(`/missions/${day}`)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                      isLocked ? "bg-background border-border/50 opacity-50 cursor-not-allowed" : "bg-card border-border hover:border-purple/50 cursor-pointer glass"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2",
                      isCompleted ? "bg-green/10 border-green text-green" : isCurrent ? "bg-purple/10 border-purple text-purple animate-pulse" : "bg-background border-border text-text-muted"
                    )}>
                      {isCompleted ? <CheckCircle2 size={18} /> : isCurrent ? <Target size={18} /> : <Lock size={18} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-text-muted uppercase mb-1">Day {day}</p>
                      <p className={cn("font-bold truncate text-base", isCompleted ? "text-white" : isCurrent ? "text-white" : "text-text-secondary")}>
                        {mission?.topic_title || `Topic ${day}`}
                      </p>
                    </div>

                    <div className="hidden sm:block">
                      {isCompleted ? (
                        <span className="text-xs font-bold text-green bg-green/10 px-3 py-1 rounded-full border border-green/20">Completed</span>
                      ) : isCurrent ? (
                        <button className="text-xs font-bold text-white bg-purple hover:bg-purple-light px-4 py-1.5 rounded-full transition-colors flex items-center gap-1">
                          Continue <ChevronRight size={14} />
                        </button>
                      ) : (
                        <span className="text-xs text-text-muted">Unlocks after Day {day - 1}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'calendar' && (
        <div className="glass p-6 rounded-3xl border border-border bg-card">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-xs font-bold text-text-muted uppercase pb-2">{d}</div>
            ))}
            {allDays.map(({ day, isCompleted, isCurrent, isLocked }) => (
              <div 
                key={day}
                onClick={() => !isLocked && router.push(`/missions/${day}`)}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all border cursor-pointer",
                  isCompleted ? "bg-green/20 text-green border-green/30 hover:bg-green/30" :
                  isCurrent ? "bg-purple text-white border-purple-light shadow-[0_0_15px_rgba(108,99,255,0.4)]" :
                  isLocked ? "bg-background border-border text-text-muted opacity-30 cursor-not-allowed" :
                  "bg-card border-border text-text-secondary hover:border-purple/50 hover:text-white"
                )}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
