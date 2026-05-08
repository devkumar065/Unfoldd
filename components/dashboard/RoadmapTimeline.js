'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function RoadmapTimeline({ roadmap, currentDay = 1 }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      const element = document.getElementById(`day-${currentDay}`)
      if (element) {
        // Calculate position to center the current day
        const containerWidth = scrollRef.current.offsetWidth
        const elementLeft = element.offsetLeft
        const elementWidth = element.offsetWidth
        
        scrollRef.current.scrollTo({
          left: elementLeft - (containerWidth / 2) + (elementWidth / 2),
          behavior: 'smooth'
        })
      }
    }
  }, [currentDay])

  if (!roadmap?.roadmap_data?.days) return null

  const days = roadmap.roadmap_data.days
  const totalDays = roadmap.total_days || 90

  const getMilestoneText = (day) => {
    if (day === 10) return "Foundations"
    if (day === 30) return "First Project"
    if (day === 60) return "Portfolio Built"
    if (day === 90) return "Interview Ready"
    return null
  }

  return (
    <div className="glass p-6 md:p-8 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Your unfolding journey 🗺️
          </h3>
          <p className="text-xs text-text-secondary">Progress through your 90-day elite roadmap</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-black text-purple">
            {Math.round((currentDay / totalDays) * 100)}%
          </span>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Complete</span>
        </div>
      </div>

      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex items-start overflow-x-auto pb-12 pt-10 hide-scrollbar relative"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="flex items-center px-10 min-w-max relative h-20">
            {/* The underlying connecting line */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-border/50 z-0 mx-10" />
            
            {days.map((dayData, index) => {
              const day = dayData.day
              const isCompleted = day < currentDay
              const isCurrent = day === currentDay
              const isMilestone = day % 10 === 0
              const milestoneText = getMilestoneText(day)

              return (
                <div key={day} id={`day-${day}`} className="flex items-center relative z-10 group">
                  {/* The actual dot */}
                  <div className="relative flex flex-col items-center justify-center w-12 sm:w-16 h-12">
                    
                    {/* "TODAY" Label - Absolute so it doesn't break alignment */}
                    {isCurrent && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-10 bg-purple text-white text-[9px] font-black tracking-widest px-2 py-0.5 rounded shadow-[0_0_15px_rgba(108,99,255,0.4)] z-20 whitespace-nowrap"
                      >
                        TODAY
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple rotate-45" />
                      </motion.div>
                    )}

                    {/* Milestone Text - Absolute at bottom */}
                    {milestoneText && (
                      <div className="absolute -bottom-10 text-[10px] font-black uppercase tracking-tighter text-text-muted whitespace-nowrap group-hover:text-purple transition-colors">
                        {milestoneText}
                      </div>
                    )}
                    
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className={cn(
                        "rounded-full flex items-center justify-center transition-all duration-300 border-2 z-10",
                        isMilestone ? "w-8 h-8 sm:w-9 sm:h-9" : "w-4 h-4 sm:w-5 sm:h-5",
                        isCompleted ? "bg-green border-green text-black shadow-[0_0_10px_rgba(0,245,160,0.3)]" : 
                        isCurrent ? "bg-card border-purple text-purple shadow-[0_0_20px_rgba(108,99,255,0.6)]" : 
                        "bg-background border-border text-transparent group-hover:border-purple/50"
                      )}
                    >
                      {isCompleted ? (
                        isMilestone ? <Star size={16} className="fill-current" /> : <CheckCircle2 size={12} strokeWidth={3} />
                      ) : isMilestone ? (
                        <Star size={16} className={isCurrent ? "text-purple" : "text-text-muted"} />
                      ) : (
                        <div className={cn("w-1.5 h-1.5 rounded-full", isCurrent ? "bg-purple animate-pulse" : "bg-transparent")} />
                      )}
                    </motion.div>

                    {/* Connecting line segment - fills as you go */}
                    {index < days.length - 1 && (
                      <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 left-full w-full h-[2px] transition-colors duration-500",
                        isCompleted ? "bg-green shadow-[0_0_5px_rgba(0,245,160,0.5)]" : "bg-transparent"
                      )} style={{ width: 'calc(100% - 1.25rem)' }} />
                    )}

                    {/* Tooltip on Hover */}
                    <div className="absolute top-14 opacity-0 group-hover:opacity-100 transition-all bg-[#12121A] border border-border rounded-xl p-4 shadow-2xl w-60 z-[100] pointer-events-none translate-y-2 group-hover:translate-y-0 duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase text-purple-light tracking-[0.2em]">Day {day}</span>
                        <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded border", isCompleted ? "bg-green/10 text-green border-green/20" : isCurrent ? "bg-purple/10 text-purple border-purple/20" : "bg-white/5 text-text-muted border-white/10")}>
                           {isCompleted ? 'COMPLETED' : isCurrent ? 'IN PROGRESS' : 'UPCOMING'}
                        </span>
                      </div>
                      <p className="text-sm text-white font-bold leading-tight">{dayData.topic}</p>
                      <div className="mt-3 flex items-center gap-2 text-[10px] text-text-secondary font-medium italic border-t border-white/5 pt-2">
                         Click for details &rarr;
                      </div>
                    </div>
                  </div>

                  {/* Spacer logic between items */}
                  {index < days.length - 1 && (
                    <div className="w-8 sm:w-12 pointer-events-none" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Fade edges to indicate more content */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-card to-transparent pointer-events-none z-20" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-card to-transparent pointer-events-none z-20" />
      </div>

      <div className="mt-4 flex justify-center">
        <div className="bg-background/50 px-4 py-2 rounded-2xl border border-border flex gap-6">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green shadow-[0_0_5px_rgba(0,245,160,0.5)]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Done</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-purple shadow-[0_0_5px_rgba(108,99,255,0.5)]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Current</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-border" />
             <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Upcoming</span>
           </div>
        </div>
      </div>
    </div>
  )
}