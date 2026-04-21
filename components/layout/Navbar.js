'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Zap, ChevronDown, User, LogOut, Settings, ExternalLink, ShieldCheck } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase/client'
import { NotificationBell } from './NotificationBell'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, clearUser } = useUser()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    clearUser()
    router.push('/auth/login')
  }

  const getPageTitle = () => {
    const path = pathname.split('/')[1]
    if (!path) return 'Overview'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  const LOGO_URL = "https://srklrlzewvozsvebzgvm.supabase.co/storage/v1/object/public/avatars/icon.png"

  return (
    <nav className="h-20 border-b border-border bg-background/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 lg:hidden">
        <Image src={LOGO_URL} alt="Unfoldd" width={32} height={32} className="rounded-lg shadow-[0_0_15px_rgba(108,99,255,0.5)] object-contain bg-white/5 p-1" />
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <h1 className="text-xl font-display font-bold text-white">{getPageTitle()}</h1>
        {pathname !== '/dashboard' && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <ChevronDown size={14} className="-rotate-90" />
            <span>{pathname.split('/').slice(-1)[0]}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-5 ml-auto">
        {/* Streak Counter */}
        <div className="hidden sm:flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 shadow-sm">
          <motion.div
            animate={profile?.streak_count > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
          >
            <Flame className={cn("w-4 h-4", profile?.streak_count > 0 ? "text-orange-500" : "text-text-muted")} />
          </motion.div>
          <span className="font-bold text-sm text-white">{profile?.streak_count || 0}</span>
        </div>

        {/* XP Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-purple/10 border border-purple/20 rounded-full px-3 py-1.5 shadow-sm">
          <Zap className="w-4 h-4 text-purple" fill="currentColor" />
          <span className="font-bold text-sm text-purple-light">{profile?.xp_points || 0} XP</span>
        </div>

        <NotificationBell />

        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-card border-2 border-border overflow-hidden hover:border-purple transition-colors relative">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple to-cyan text-white font-bold text-sm uppercase">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <ChevronDown size={14} className={cn("text-text-muted transition-transform", dropdownOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-3 w-64 bg-[#0B0F1A] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-xl"
                >
                  <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                    <p className="font-bold text-white text-base truncate">{profile?.full_name || 'Student'}</p>
                    <p className="text-xs text-text-muted truncate mt-0.5 font-medium">{user?.email}</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg bg-purple/10 text-purple-light border border-purple/20">
                      <div className="w-1 h-1 rounded-full bg-purple animate-pulse" />
                      {profile?.level || 'Beginner'}
                    </div>
                  </div>

                  <div className="p-2">
                    <Link href="/portfolio/edit" onClick={() => setDropdownOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-sm font-bold text-white transition-all cursor-pointer group">
                        <User size={18} className="text-text-muted group-hover:text-purple transition-colors" />
                        View Portfolio
                      </div>
                    </Link>
                    <Link href="/settings" onClick={() => setDropdownOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-sm font-bold text-white transition-all cursor-pointer group">
                        <Settings size={18} className="text-text-muted group-hover:text-purple transition-colors" />
                        Settings
                      </div>
                    </Link>
                    
                    {!profile?.is_premium && (
                      <Link href="/upgrade" onClick={() => setDropdownOpen(false)}>
                        <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-gradient-to-r from-purple/20 to-cyan/20 hover:from-purple/30 hover:to-cyan/30 border border-purple/30 text-sm font-black text-white transition-all cursor-pointer mt-1 shadow-lg shadow-purple/10">
                          <span className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-cyan animate-pulse" />
                            Upgrade to Pro
                          </span>
                        </div>
                      </Link>
                    )}
                  </div>

                  <div className="p-2 border-t border-white/5 bg-white/[0.01]">
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 text-sm font-bold text-red-500 transition-all group"
                    >
                      <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}