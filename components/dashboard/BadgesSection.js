'use client'

import BadgeIcon from '@/components/gamification/BadgeIcon'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

const ALL_BADGES = [
  'first_mission',
  'first_verified', 
  'streak_7',
  'streak_30',
  'streak_60',
  'streak_90',
  'first_application',
  'top_learner',
  'early_adopter'
]

export default function BadgesSection({ earnedBadges = [] }) {
  const earnedTypes = earnedBadges.map(b => b.badge_type)

  return (
    <div className="bg-[#12121A] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center">
          <Trophy size={16} className="text-yellow-500" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Achievements</h3>
          <p className="text-white/30 text-xs">
            {earnedTypes.length}/{ALL_BADGES.length} earned
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {ALL_BADGES.map((badgeType, i) => (
          <motion.div
            key={badgeType}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <BadgeIcon
              badgeType={badgeType}
              earned={earnedTypes.includes(badgeType)}
              size={40}
              showLabel={true}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
