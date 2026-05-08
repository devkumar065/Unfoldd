'use client'

import { motion } from 'framer-motion'
import { Flame, Star, Send, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

// Animated count up
function CountUp({ target, duration = 1500 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target])

  return <span>{count.toLocaleString()}</span>
}

const statCards = (stats) => [
  {
    icon: Flame,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    glowColor: 'rgba(249, 115, 22, 0.1)',
    value: stats.streak,
    label: 'Day Streak',
    sub: `Best: ${stats.longestStreak} days`
  },
  {
    icon: Star,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    glowColor: 'rgba(108, 99, 255, 0.1)',
    value: stats.skillsLearned,
    label: 'Skills Learned',
    sub: `${stats.skillsVerified} verified`
  },
  {
    icon: Send,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    glowColor: 'rgba(0, 212, 255, 0.1)',
    value: stats.applicationsCount,
    label: 'Applied',
    sub: `${stats.shortlisted} shortlisted`
  },
  {
    icon: Zap,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    glowColor: 'rgba(250, 204, 21, 0.1)',
    value: stats.xp,
    label: 'XP Points',
    sub: `Level: ${stats.level}`
  }
]

export default function StatsRow({ stats }) {
  const cards = statCards(stats)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 
      gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: i * 0.08,
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }}
            whileHover={{ 
              y: -3,
              transition: { duration: 0.15 }
            }}
            className={`bg-[#12121A] border 
              ${card.borderColor} rounded-2xl p-4
              cursor-default relative overflow-hidden`}
          >
            {/* Background glow */}
            <div 
              className="absolute inset-0 opacity-50
                pointer-events-none"
              style={{
                background: `radial-gradient(
                  circle at 0% 100%, 
                  ${card.glowColor}, 
                  transparent 70%)`
              }}
            />

            {/* Icon */}
            <div className={`w-9 h-9 rounded-xl 
              ${card.iconBg} flex items-center 
              justify-center mb-3 relative`}>
              <Icon size={18} 
                className={card.iconColor} />
            </div>

            {/* Value */}
            <div 
              className="text-2xl font-black 
                text-white mb-0.5 relative"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              <CountUp target={card.value} />
            </div>

            {/* Label */}
            <div className="text-white/50 text-sm 
              relative">
              {card.label}
            </div>

            {/* Sub */}
            <div className="text-white/25 text-xs 
              mt-0.5 relative">
              {card.sub}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
