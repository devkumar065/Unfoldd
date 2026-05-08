'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Flame,
  Zap,
  ChevronDown,
  Settings,
  Globe,
  LogOut,
  Crown
} from 'lucide-react'
import { createClientComponentClient }
  from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'
import { useUserStore } from '@/store/userStore'

export default function Navbar({ profile: initialProfile }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const storeProfile = useUserStore(s => s.profile)
  const profile = initialProfile || storeProfile
  const [dropdownOpen, setDropdownOpen] = 
    useState(false)
  const { unreadCount } = useNotifications()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="h-14 bg-[#0A0A0F]/90
      backdrop-blur-xl border-b border-white/5
      flex items-center justify-between
      px-4 flex-shrink-0 z-40 sticky top-0">

      {/* Left — page context / breadcrumb */}
      <div className="flex items-center gap-2">
        {/* Mobile logo (sidebar hidden on mobile) */}
        <div className="md:hidden w-7 h-7 rounded-lg
          bg-gradient-to-br from-purple-500 to-cyan-500
          flex items-center justify-center">
          <span className="text-white font-black text-xs">
            U
          </span>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">

        {/* Streak pill */}
        {profile && (
          <div className="hidden sm:flex items-center 
            gap-1.5 bg-orange-500/10 border 
            border-orange-500/20 rounded-full 
            px-3 py-1.5">
            <Flame size={13} 
              className="text-orange-400" />
            <span className="text-orange-300 text-xs 
              font-bold">
              {profile.streak_count || 0}
            </span>
          </div>
        )}

        {/* XP pill */}
        {profile && (
          <div className="hidden sm:flex items-center 
            gap-1.5 bg-yellow-500/10 border 
            border-yellow-500/20 rounded-full 
            px-3 py-1.5">
            <Zap size={13} 
              className="text-yellow-400" />
            <span className="text-yellow-300 text-xs 
              font-bold">
              {profile.xp_points || 0}
            </span>
          </div>
        )}

        {/* Notifications */}
        <Link href="/notifications">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative w-9 h-9 rounded-xl
              bg-white/5 hover:bg-white/10
              flex items-center justify-center
              transition-colors border border-white/5"
          >
            <Bell size={16} 
              className="text-white/60" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1
                  w-4 h-4 bg-red-500 rounded-full
                  flex items-center justify-center"
              >
                <span className="text-white text-[9px] 
                  font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </motion.div>
            )}
          </motion.button>
        </Link>

        {/* User dropdown */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 
              bg-white/5 hover:bg-white/10
              border border-white/5 rounded-xl
              px-2.5 py-1.5 transition-colors"
          >
            {/* Avatar */}
            <div className="w-6 h-6 rounded-full
              bg-gradient-to-br from-purple-500 
              to-cyan-500 flex items-center
              justify-center text-white text-xs 
              font-bold flex-shrink-0">
              {profile?.full_name?.[0]
                ?.toUpperCase() || 'U'}
            </div>
            <ChevronDown size={13} 
              className="text-white/40" />
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: -8, 
                    scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, 
                    scale: 1 }}
                  exit={{ opacity: 0, y: -8, 
                    scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full 
                    mt-2 w-52 bg-[#12121A] border 
                    border-white/10 rounded-2xl 
                    overflow-hidden shadow-2xl
                    shadow-black/50 z-50"
                >
                  {/* User info */}
                  <div className="px-4 py-3 
                    border-b border-white/5">
                    <p className="text-white font-semibold
                      text-sm truncate">
                      {profile?.full_name}
                    </p>
                    <p className="text-white/40 text-xs
                      truncate capitalize">
                      {profile?.target_role?.replace('_', ' ')}
                    </p>
                    {profile?.is_premium && (
                      <div className="flex items-center 
                        gap-1 mt-1">
                        <Crown size={10} 
                          className="text-yellow-400" />
                        <span className="text-yellow-400 
                          text-xs font-medium">
                          {profile.premium_plan} Plan
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Menu items */}
                  {[
                    { href: '/portfolio/edit', 
                      icon: Globe, label: 'My Portfolio' },
                    { href: '/settings', 
                      icon: Settings, label: 'Settings' },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link key={href} href={href}
                      onClick={() => setDropdownOpen(false)}>
                      <div className="flex items-center 
                        gap-3 px-4 py-2.5 hover:bg-white/5
                        transition-colors cursor-pointer">
                        <Icon size={15} 
                          className="text-white/40" />
                        <span className="text-white/70 
                          text-sm">{label}</span>
                      </div>
                    </Link>
                  ))}

                  {!profile?.is_premium && (
                    <Link href="/settings?tab=billing"
                      onClick={() => setDropdownOpen(false)}>
                      <div className="flex items-center 
                        gap-3 px-4 py-2.5 
                        hover:bg-purple-500/10
                        transition-colors cursor-pointer
                        border-t border-white/5">
                        <Crown size={15} 
                          className="text-purple-400" />
                        <span className="text-purple-400 
                          text-sm font-medium">
                          Upgrade to Pro
                        </span>
                      </div>
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center 
                      gap-3 px-4 py-2.5 hover:bg-red-500/10
                      transition-colors
                      border-t border-white/5"
                  >
                    <LogOut size={15} 
                      className="text-red-400/60" />
                    <span className="text-red-400/60 
                      text-sm">Sign Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
