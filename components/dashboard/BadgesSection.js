'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils/cn'

const ALL_BADGES = [
  { id: 'first_mission', title: 'First Mission', icon: '🎯', condition: 'Complete your first mission' },
  { id: 'first_verified', title: 'First Verified', icon: '✅', condition: 'Get first skill verified' },
  { id: 'streak_7', title: 'Week Warrior', icon: '🔥', condition: '7-day streak' },
  { id: 'streak_30', title: 'Month Master', icon: '💎', condition: '30-day streak' },
  { id: 'streak_60', title: 'Consistency King', icon: '👑', condition: '60-day streak' },
  { id: 'streak_90', title: 'Journey Complete', icon: '🚀', condition: '90-day streak' },
  { id: 'first_application', title: 'Job Hunter', icon: '📩', condition: 'First application sent' },
  { id: 'top_learner', title: 'Top Learner', icon: '⭐', condition: '10 skills learned' },
]

export function BadgesSection({ badges = [] }) {
  const earnedMap = badges.reduce((acc, b) => {
    acc[b.badge_type] = b.earned_at
    return acc
  }, {})

  return (
    <div className="glass p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Achievements 🏅</h3>
        <span className="text-sm font-medium text-purple-light bg-purple/10 px-3 py-1 rounded-full border border-purple/20">
          {badges.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ALL_BADGES.map((badge, i) => {
          const isEarned = !!earnedMap[badge.id]
          const earnedDate = isEarned ? new Date(earnedMap[badge.id]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null

          return (
            <Tooltip key={badge.id} content={isEarned ? `Earned on ${earnedDate}` : `Unlock: ${badge.condition}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-300",
                  isEarned 
                    ? "bg-gradient-to-b from-purple/10 to-transparent border-purple/30 shadow-[0_0_20px_rgba(108,99,255,0.1)] hover:border-purple/60 hover:-translate-y-1" 
                    : "bg-background/50 border-border grayscale hover:grayscale-0 hover:bg-card"
                )}
              >
                {!isEarned && (
                  <div className="absolute top-2 right-2 text-text-muted">
                    <Lock size={12} />
                  </div>
                )}
                <div className="text-3xl mb-2 drop-shadow-lg">{badge.icon}</div>
                <h4 className={cn("text-xs font-bold leading-tight", isEarned ? "text-white" : "text-text-muted")}>
                  {badge.title}
                </h4>
              </motion.div>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
