'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Target, Flame, CheckCircle2, FileText, Mail, Settings, MessageSquare, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { cn } from '@/lib/utils/cn'

const ICON_MAP = {
  mission: { icon: Target, color: 'text-purple', bg: 'bg-purple/10' },
  streak: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  skill: { icon: CheckCircle2, color: 'text-green', bg: 'bg-green/10' },
  exam: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  application: { icon: Mail, color: 'text-cyan', bg: 'bg-cyan/10' },
  system: { icon: Settings, color: 'text-gray-400', bg: 'bg-gray-400/10' },
  broadcast: { icon: MessageSquare, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
}

export function NotificationBell() {
  const router = useRouter()
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    }

    fetchNotifications()

    // Real-time subscription
    const channel = supabase.channel('realtime_notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 20))
        setUnreadCount(count => count + 1)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleMarkAsRead = async (id, url) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    
    await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id)
    
    if (url) {
      setOpen(false)
      router.push(url)
    }
  }

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)

    await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).in('id', unreadIds)
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-text-secondary hover:text-white hover:border-purple transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-card shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 sm:-right-4 top-full mt-2 w-[340px] glass border border-border rounded-2xl shadow-2xl z-50 overflow-hidden bg-card flex flex-col max-h-[500px]"
            >
              <div className="p-4 border-b border-border bg-background/80 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs text-purple hover:text-purple-light font-medium flex items-center gap-1 transition-colors"
                  >
                    <Check size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-text-muted flex flex-col items-center justify-center">
                    <Bell size={32} className="mb-3 opacity-20" />
                    <p className="text-sm font-medium">You&apos;re all caught up! 🎉</p>
                    <p className="text-xs mt-1">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const config = ICON_MAP[notif.type] || ICON_MAP.system
                    const Icon = config.icon
                    
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id, notif.action_url)}
                        className={cn(
                          "p-3 rounded-xl cursor-pointer transition-all duration-200 flex gap-3",
                          notif.is_read 
                            ? "hover:bg-border/30 opacity-70"
                            : "bg-purple/5 hover:bg-purple/10 border border-purple/10"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-full shrink-0 flex items-center justify-center", config.bg, config.color)}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className={cn("text-sm truncate", notif.is_read ? "font-medium text-white" : "font-bold text-white")}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.body}
                          </p>
                          <p className="text-[10px] text-text-muted mt-2 font-medium uppercase tracking-wider">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 rounded-full bg-purple shrink-0 mt-1.5" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
