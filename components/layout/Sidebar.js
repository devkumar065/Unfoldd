'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Target, Code, Briefcase, FileText, Settings, Flame, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Missions', href: '/missions', icon: Target },
  { name: 'Skills', href: '/skills', icon: Code },
  { name: 'Portfolio', href: '/portfolio/edit', icon: Briefcase },
  { name: 'Resume', href: '/resume', icon: FileText },
  { name: 'Internships', href: '/internships', icon: Briefcase },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useUser()
  const [collapsed, setCollapsed] = useState(false)

  const LOGO_URL = "https://srklrlzewvozsvebzgvm.supabase.co/storage/v1/object/public/avatars/icon.png"

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      className="hidden md:flex flex-col h-screen border-r border-border bg-card/50 glass relative z-10"
    >
      <div className="flex items-center justify-between p-6">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2"
            >
              <Image src={LOGO_URL} alt="Unfoldd" width={32} height={32} className="rounded-lg shadow-[0_0_15px_rgba(108,99,255,0.5)] object-contain bg-white/5 p-1" />
      <span className="text-xl flex items-center" style={{ fontFamily: 'Space Grotesk' }}>
        <span className="text-white font-black">Unfol</span>
        <span style={{
          background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 900
        }}>
          dd
        </span>
      </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("p-1 rounded-md hover:bg-border text-text-secondary transition-colors", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                  isActive
                    ? "bg-purple/10 text-purple border border-purple/20 shadow-[0_0_10px_rgba(108,99,255,0.1)]"
                    : "text-text-secondary hover:bg-border/50 hover:text-text-primary"
                )}
              >
                <item.icon size={20} className={cn("min-w-[20px]", isActive ? "text-purple" : "text-text-secondary group-hover:text-purple-light")} />
                {!collapsed && <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>}
              </motion.div>
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-border mt-auto space-y-4">
        {!collapsed ? (
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <Flame className="text-orange-500 animate-pulse" size={24} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">Current Streak</p>
              <p className="text-xl font-bold font-display text-white">{profile?.streak_count || 0} Days</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-12 w-full bg-orange-500/10 border border-orange-500/20 rounded-xl">
             <Flame className="text-orange-500 animate-pulse" size={20} />
          </div>
        )}

        <div className={cn("flex items-center gap-3 p-2 rounded-xl hover:bg-border/50 transition-colors cursor-pointer relative", collapsed && "justify-center")}>
          <div className="w-10 h-10 rounded-full bg-border overflow-hidden shrink-0 border border-border relative">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-purple flex items-center justify-center text-sm font-bold text-white uppercase">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-text-secondary truncate">{profile?.target_role || 'Learner'}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}