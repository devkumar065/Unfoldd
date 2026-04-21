'use client'

import { motion } from 'framer-motion'
import { Flame, Zap, Calendar } from 'lucide-react'

export function HeroGreeting({ profile, roadmap }) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Good morning'
    if (hour >= 12 && hour < 17) return 'Good afternoon'
    if (hour >= 17 && hour < 21) return 'Good evening'
    return 'Still grinding'
  }

  const emoji = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return '☀️'
    if (hour >= 12 && hour < 17) return '👋'
    if (hour >= 17 && hour < 21) return '🌙'
    return '💪'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full rounded-3xl p-8 overflow-hidden bg-card border border-border glass"
    >
      <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-display font-bold text-white">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Developer'} {emoji()}
          </motion.h1>
          <motion.p variants={itemVariants} className="text-text-secondary text-sm md:text-base">
            Day {roadmap?.current_day || 1} of your {roadmap?.total_days || 90}-day journey to {profile?.target_role || 'Tech'}
          </motion.p>
        </div>

        <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
          <div className="glass px-4 py-2 rounded-full border border-purple/20 flex items-center gap-2 bg-card/50">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-white text-sm">{profile?.streak_count || 0} day streak</span>
          </div>
          <div className="glass px-4 py-2 rounded-full border border-purple/20 flex items-center gap-2 bg-card/50">
            <Zap className="w-4 h-4 text-purple" />
            <span className="font-bold text-white text-sm">{profile?.xp_points || 0} XP</span>
          </div>
          <div className="glass px-4 py-2 rounded-full border border-purple/20 flex items-center gap-2 bg-card/50">
            <Calendar className="w-4 h-4 text-cyan" />
            <span className="font-bold text-white text-sm">Day {roadmap?.current_day || 1}/{roadmap?.total_days || 90}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
