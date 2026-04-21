'use client'

import { motion } from 'framer-motion'
import { Flame, Brain, Send, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = parseInt(value) || 0
    if (start === end) return

    const duration = 1500
    const increment = end / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    
    return () => clearInterval(timer)
  }, [value])

  return <span>{count}</span>
}

export function StatsRow({ profile, skills = [], applicationsCount = 0 }) {
  const verifiedCount = skills.filter(s => s.is_verified).length

  const stats = [
    {
      label: "Day Streak",
      value: profile?.streak_count || 0,
      sub: `Longest: ${profile?.longest_streak || 0} days`,
      icon: Flame,
      color: "orange",
      border: "border-orange-500/20 hover:border-orange-500/50",
      bg: "bg-orange-500/10",
      iconColor: "text-orange-500"
    },
    {
      label: "Skills Learned",
      value: skills.length || 0,
      sub: `${verifiedCount} verified ✅`,
      icon: Brain,
      color: "purple",
      border: "border-purple/20 hover:border-purple/50",
      bg: "bg-purple/10",
      iconColor: "text-purple"
    },
    {
      label: "Applied",
      value: applicationsCount,
      sub: "Active tracking 🎯",
      icon: Send,
      color: "cyan",
      border: "border-cyan/20 hover:border-cyan/50",
      bg: "bg-cyan/10",
      iconColor: "text-cyan"
    },
    {
      label: "XP Points",
      value: profile?.xp_points || 0,
      sub: `Level: ${profile?.level || 'Beginner'}`,
      icon: Zap,
      color: "green",
      border: "border-green/20 hover:border-green/50",
      bg: "bg-green/10",
      iconColor: "text-green"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 30 }}
          whileHover={{ y: -4 }}
          className={cn(
            "glass p-4 sm:p-5 rounded-2xl border transition-all duration-300 bg-card group relative overflow-hidden",
            stat.border
          )}
        >
          <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity opacity-20 group-hover:opacity-40", stat.bg)} />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={cn("p-2 sm:p-3 rounded-xl", stat.bg, stat.iconColor)}>
              <stat.icon size={20} className="group-hover:scale-110 transition-transform" />
            </div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-display font-bold text-white mb-1">
              <AnimatedCounter value={stat.value} />
            </h3>
            <p className="text-sm font-medium text-text-primary mb-1">{stat.label}</p>
            <p className="text-xs text-text-secondary">{stat.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
