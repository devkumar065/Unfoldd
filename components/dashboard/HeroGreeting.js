'use client'

import { motion } from 'framer-motion'
import { Sun, Moon, Sunrise, Sunset, Flame, Zap, Calendar } from 'lucide-react'

export default function HeroGreeting({ 
  profile, 
  currentDay = 1, 
  totalDays = 90, 
  streak = 0, 
  xp = 0 
}) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Good morning'
    if (hour >= 12 && hour < 17) return 'Good afternoon'
    if (hour >= 17 && hour < 21) return 'Good evening'
    return 'Still grinding'
  }

  const GreetingIcon = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return <Sunrise className="text-orange-400" size={24} />
    if (hour >= 12 && hour < 17) return <Sun className="text-yellow-400" size={24} />
    if (hour >= 17 && hour < 21) return <Sunset className="text-orange-500" size={24} />
    return <Moon className="text-blue-400" size={24} />
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Developer'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-[#12121A] border border-white/5 rounded-3xl p-6 md:p-8"
    >
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] -mr-32 -mt-32" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              {getGreeting()}, {firstName}
            </h1>
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <GreetingIcon />
            </motion.div>
          </div>
          <p className="text-white/40 text-sm md:text-base">
            Day {currentDay} of your {totalDays}-day journey to {profile?.target_role?.replace(/_/g, ' ') || 'Tech Career'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <StatPill icon={Flame} value={`${streak} days`} color="text-orange-400" bg="bg-orange-500/10" />
          <StatPill icon={Zap} value={`${xp} XP`} color="text-yellow-400" bg="bg-yellow-500/10" />
          <StatPill icon={Calendar} value={`Day ${currentDay}/${totalDays}`} color="text-cyan-400" bg="bg-cyan-500/10" />
        </div>
      </div>
    </motion.div>
  )
}

function StatPill({ icon: Icon, value, color, bg }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 ${bg}`}>
      <Icon size={14} className={color} />
      <span className="text-white/70 text-xs font-bold">{value}</span>
    </div>
  )
}
