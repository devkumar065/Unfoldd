'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Target, 
  Flame, 
  CheckCircle, 
  ClipboardList, 
  Send, 
  Settings, 
  Megaphone, 
  MessageSquare,
  Check
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { cn } from '@/lib/utils/cn'

const notificationIcons = {
  mission: { 
    icon: Target, 
    color: 'text-purple-400',
    bg: 'bg-purple-500/15'
  },
  streak: { 
    icon: Flame, 
    color: 'text-orange-400',
    bg: 'bg-orange-500/15'
  },
  skill: { 
    icon: CheckCircle, 
    color: 'text-green-400',
    bg: 'bg-green-500/15'
  },
  exam: { 
    icon: ClipboardList, 
    color: 'text-blue-400',
    bg: 'bg-blue-500/15'
  },
  application: { 
    icon: Send, 
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15'
  },
  system: { 
    icon: Settings, 
    color: 'text-white/40',
    bg: 'bg-white/5'
  },
  broadcast: { 
    icon: Megaphone, 
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/15'
  },
  admin_message: {
    icon: MessageSquare,
    color: 'text-purple-400',
    bg: 'bg-purple-500/15'
  }
}

function NotifIcon({ type }) {
  const config = notificationIcons[type] || notificationIcons.system
  const Icon = config.icon
  return (
    <div className={`w-10 h-10 rounded-xl 
      ${config.bg} flex items-center 
      justify-center flex-shrink-0`}>
      <Icon size={18} className={config.color} />
    </div>
  )
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
        className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0A0A0F] text-[9px] font-bold flex items-center justify-center text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
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
              className="absolute right-0 top-full mt-3 w-[340px] bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px]"
            >
              <div className="p-4 border-b border-white/5 bg-[#12121A]/80 backdrop-blur-xl flex items-center justify-between shrink-0">
                <h3 className="font-bold text-white text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Check size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-white/30 flex flex-col items-center justify-center">
                    <Bell size={32} className="mb-3 opacity-10" />
                    <p className="text-sm font-medium">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id, notif.action_url)}
                      className={cn(
                        "p-3 rounded-xl cursor-pointer transition-all duration-200 flex gap-3",
                        notif.is_read 
                          ? "hover:bg-white/5 opacity-60"
                          : "bg-white/[0.03] hover:bg-white/[0.06] border border-white/5"
                      )}
                    >
                      <NotifIcon type={notif.type} />
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className={cn("text-sm truncate", notif.is_read ? "font-medium text-white/70" : "font-bold text-white")}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.body}
                        </p>
                        <p className="text-[10px] text-white/20 mt-2 font-medium uppercase tracking-wider">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
