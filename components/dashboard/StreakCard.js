'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function StreakCard({ 
  streak = 0, 
  longestStreak = 0 
}) {
  const today = new Date().getDay()
  // Convert: 0=Sun → 6, 1=Mon → 0, etc
  const todayIndex = today === 0 ? 6 : today - 1

  function getMessage(streak) {
    if (streak === 0) return 'Start your streak today!'
    if (streak < 7) return 'Great start! Keep going'
    if (streak < 30) return "You're on fire!"
    if (streak < 60) return 'Incredible consistency!'
    return 'Legendary dedication!'
  }

  return (
    <div className="bg-[#12121A] border border-white/5 
      rounded-2xl p-5">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg 
          bg-orange-500/10 flex items-center 
          justify-center">
          <Flame size={14} className="text-orange-400" />
        </div>
        <h3 className="text-white font-bold text-sm">
          Day Streak
        </h3>
      </div>

      {/* Streak number */}
      <div className="flex items-end gap-3 mb-4">
        <div className="flex items-baseline gap-2">
          <span 
            className="text-5xl font-black text-white"
            style={{ fontFamily: 'Space Grotesk' }}>
            {streak}
          </span>
          <motion.div
            animate={streak > 0 
              ? { scale: [1, 1.2, 1] }
              : {}}
            transition={{ 
              duration: 2, 
              repeat: Infinity 
            }}
          >
            <Flame 
              size={28} 
              className={streak > 0 
                ? 'text-orange-400' 
                : 'text-white/20'} 
            />
          </motion.div>
        </div>
      </div>

      {/* Days of week */}
      <div className="flex gap-1.5 mb-3">
        {DAYS.map((day, i) => (
          <div key={i} className="flex-1 flex 
            flex-col items-center gap-1">
            <div className={`w-full aspect-square 
              rounded-lg flex items-center 
              justify-center text-[10px] font-bold
              transition-colors
              ${i === todayIndex 
                ? 'bg-purple-600 text-white ring-1 ring-purple-400/50'
                : i < todayIndex && streak > (todayIndex - i)
                ? 'bg-orange-500/30 text-orange-400'
                : 'bg-white/5 text-white/20'
              }`}>
              {day}
            </div>
          </div>
        ))}
      </div>

      {/* Best streak */}
      <p className="text-white/30 text-xs mb-2">
        Best: {longestStreak} days
      </p>

      {/* Message */}
      <p className={`text-xs font-medium
        ${streak === 0 
          ? 'text-white/40' 
          : 'text-orange-400'}`}>
        {getMessage(streak)}
      </p>

      {/* Warning if 0 */}
      {streak === 0 && (
        <div className="mt-3 bg-orange-500/10 
          border border-orange-500/20 rounded-xl 
          p-2.5">
          <p className="text-orange-400 text-[10px]
            text-center font-medium">
            Complete today&apos;s mission to start your streak!
          </p>
        </div>
      )}
    </div>
  )
}
