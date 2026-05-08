'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClientComponentClient }
  from '@supabase/auth-helpers-nextjs'
import { 
  Target, Star, CheckCircle, 
  Send, Zap, Clock 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const eventConfig = {
  mission_complete: {
    icon: Target,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    label: (data) => `Completed Day ${data?.day || ''} mission`
  },
  video_complete: {
    icon: CheckCircle,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    label: (data) => `Watched video`
  },
  test_pass: {
    icon: Star,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    label: (data) => `Passed test`
  },
  exam_complete: {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    label: (data) => `Verified a skill`
  },
  internship_apply: {
    icon: Send,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    label: (data) => `Applied to ${data?.company || 'internship'}`
  },
  mission_generated: {
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    label: () => 'New mission generated'
  }
}

export default function ActivityFeed({ userId }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!userId) return
    fetchActivity()
  }, [userId])

  async function fetchActivity() {
    try {
      const { data } = await supabase
        .from('analytics_events')
        .select('id, event_type, event_data, created_at')
        .eq('user_id', userId)
        .not('event_type', 'like', 'admin_%')
        .order('created_at', { ascending: false })
        .limit(10)

      setEvents(data || [])
    } catch(e) {
      console.error('Activity fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#12121A] border border-white/5 
      rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg 
          bg-white/5 flex items-center justify-center">
          <Clock size={14} className="text-white/40" />
        </div>
        <h3 className="text-white font-bold text-sm">
          Recent Activity
        </h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} 
              className="h-10 rounded-xl bg-white/5 
                animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-10 h-10 rounded-xl 
            bg-white/5 flex items-center 
            justify-center mx-auto mb-3">
            <Clock size={18} 
              className="text-white/20" />
          </div>
          <p className="text-white/30 text-xs">
            Complete your first mission to see activity
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event, i) => {
            const config = eventConfig[event.event_type] 
              || eventConfig.mission_generated
            const Icon = config.icon
            const label = config.label(
              event.event_data || {})

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 
                  py-1.5"
              >
                <div className={`w-7 h-7 rounded-lg 
                  ${config.bg} flex items-center 
                  justify-center flex-shrink-0`}>
                  <Icon size={13} 
                    className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs 
                    truncate">
                    {label}
                  </p>
                  <p className="text-white/25 text-[10px]">
                    {formatDistanceToNow(
                      new Date(event.created_at), 
                      { addSuffix: true }
                    )}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
