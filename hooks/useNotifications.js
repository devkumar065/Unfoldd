import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getFCMToken, onForegroundMessage } from '@/lib/firebase/client'
import { useUserStore } from '@/store/userStore'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function useNotifications() {
  const { user } = useUserStore()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) return
    fetchNotifications()
    
    const channel = supabase.channel('notifications_realtime')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)
        toast.info(payload.new.title, {
          description: payload.new.body,
        })
      })
      .subscribe()
    
    return () => supabase.removeChannel(channel)
  }, [user, fetchNotifications])

  useEffect(() => {
    if (!user) return
    async function registerPushToken() {
      try {
        const token = await getFCMToken()
        if (token) {
          await supabase.from('profiles').update({ notification_token: token }).eq('id', user.id)
        }
      } catch(e) {}
    }
    registerPushToken()
  }, [user])

  const markAsRead = async (notificationId) => {
    await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', notificationId)
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    if (!user) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetchNotifications }
}
