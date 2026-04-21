'use client'

import { motion } from 'framer-motion'
import { Target, MonitorPlay, CheckCircle2, Shield, Mail, Flame, Award } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const ICONS = {
  mission_complete: { icon: Target, color: 'text-purple', bg: 'bg-purple/10 border-purple/20' },
  video_complete: { icon: MonitorPlay, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  test_pass: { icon: CheckCircle2, color: 'text-green', bg: 'bg-green/10 border-green/20' },
  skill_verified: { icon: Shield, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  internship_apply: { icon: Mail, color: 'text-cyan', bg: 'bg-cyan/10 border-cyan/20' },
  streak_milestone: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' },
  badge_earned: { icon: Award, color: 'text-pink-500', bg: 'bg-pink-500/10 border-pink-500/20' }
}

export function ActivityFeed({ activities = [] }) {
  const getMessage = (activity) => {
    const data = activity.event_data || {}
    switch (activity.event_type) {
      case 'mission_complete': return `Completed Day ${data.day || ''} mission 🎯`
      case 'video_complete': return `Watched '${data.topic || 'tutorial'}' video 📺`
      case 'test_pass': return `Passed ${data.topic || 'topic'} test (${data.score || 100}%) ✅`
      case 'skill_verified': return `Unfoldd verified '${data.skill || 'new'}' skill 🏆`
      case 'internship_apply': return `Applied to ${data.company || 'a company'} 📩`
      case 'streak_milestone': return `Hit ${data.days || 7}-day streak! 🔥`
      case 'badge_earned': return `Earned '${data.badge || 'a'}' Unfoldd badge 🏅`
      default: return 'Completed an activity'
    }
  }

  return (
    <div className="glass p-6 rounded-3xl border border-border bg-card shadow-sm h-full max-h-[500px] flex flex-col">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        Recent Activity
      </h3>

      <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
        {activities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center text-text-muted mb-3">
              <Target size={20} />
            </div>
            <p className="text-sm font-medium text-white mb-1">No activity yet</p>
            <p className="text-xs text-text-secondary">Start your first mission to see your activity timeline here.</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
            {activities.map((activity, i) => {
              const conf = ICONS[activity.event_type] || ICONS.mission_complete
              const Icon = conf.icon
              return (
                <motion.div 
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex items-start gap-4"
                >
                  <div className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${conf.bg} ${conf.color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="pt-1.5 min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{getMessage(activity)}</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
