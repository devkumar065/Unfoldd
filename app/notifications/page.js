'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Target, Flame, CheckCircle2, FileText, Mail, Settings, MessageSquare, ChevronRight, Inbox } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'

const ICON_MAP = {
  mission: { icon: Target, color: 'text-purple', bg: 'bg-purple/10' },
  streak: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  skill: { icon: CheckCircle2, color: 'text-green', bg: 'bg-green/10' },
  exam: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  application: { icon: Mail, color: 'text-cyan', bg: 'bg-cyan/10' },
  system: { icon: Settings, color: 'text-gray-400', bg: 'bg-gray-400/10' },
  broadcast: { icon: MessageSquare, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
}

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications()
  const [filter, setFilter] = useState('all')

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'missions') return n.type === 'mission'
    if (filter === 'skills') return n.type === 'skill' || n.type === 'exam'
    if (filter === 'applications') return n.type === 'application'
    return n.type === filter
  })

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            Notifications <span className="bg-purple text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
          </h1>
          <p className="text-text-secondary mt-1">Stay updated with your career progress</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={markAllAsRead} className="text-purple hover:text-purple-light">
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex bg-card border border-border rounded-xl p-1 mb-8 overflow-x-auto hide-scrollbar">
        {['all', 'missions', 'skills', 'applications', 'system'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn("px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap", filter === f ? "bg-purple text-white shadow-lg" : "text-text-muted hover:text-white")}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({length: 5}).map((_, i) => (
            <div key={i} className="h-24 w-full bg-card/50 border border-border animate-pulse rounded-2xl" />
          ))
        ) : filteredNotifications.length === 0 ? (
          <div className="glass p-20 rounded-[2.5rem] border border-border text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-card border border-border rounded-full flex items-center justify-center mb-6 text-text-muted">
              <Inbox size={40} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">All caught up!</h2>
            <p className="text-text-secondary">No {filter !== 'all' ? filter : ''} notifications to show right now.</p>
          </div>
        ) : (
          filteredNotifications.map((notif, i) => {
            const config = ICON_MAP[notif.type] || ICON_MAP.system
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  markAsRead(notif.id)
                  if (notif.action_url) router.push(notif.action_url)
                }}
                className={cn(
                  "glass p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start group",
                  notif.is_read ? "bg-card/40 border-border opacity-70" : "bg-purple/5 border-purple/20 shadow-[0_0_15px_rgba(108,99,255,0.05)]"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl", config.bg)}>
                  <config.icon size={20} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={cn("font-bold text-white", !notif.is_read && "text-purple-light")}>{notif.title}</h3>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{notif.body}</p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 rounded-full bg-purple mt-2 shadow-[0_0_8px_rgba(108,99,255,1)]" />
                )}
                <ChevronRight size={18} className="text-text-muted mt-4 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            )
          })
        )}
      </div>

      <div className="mt-16 pt-10 border-t border-border">
        <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
        <div className="glass p-8 rounded-3xl border border-border bg-card/40 space-y-6">
          <PreferenceToggle label="Mission Reminders" description="Daily nudges to keep your roadmap on track" defaultChecked />
          <PreferenceToggle label="Streak Alerts" description="Warnings when your streak is at risk" defaultChecked />
          <PreferenceToggle label="Application Updates" description="Instant alerts when a company views your profile" defaultChecked />
          <PreferenceToggle label="Weekly Progress Report" description="A summary of your wins every Sunday" />
          <PreferenceToggle label="Marketing & Tips" description="New feature announcements and career advice" />
        </div>
      </div>
    </div>
  )
}

function PreferenceToggle({ label, description, defaultChecked }) {
  const [checked, setChecked] = useState(defaultChecked || false)
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-bold text-white text-sm">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={cn("w-12 h-6 rounded-full transition-all relative", checked ? "bg-purple" : "bg-border")}
      >
        <motion.div 
          animate={{ x: checked ? 26 : 4 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" 
        />
      </button>
    </div>
  )
}
