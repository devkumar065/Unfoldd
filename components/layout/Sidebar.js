'use client'

import { memo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Globe,
  FileText,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  LogOut,
  ExternalLink
} from 'lucide-react'
import { createClientComponentClient } 
  from '@supabase/auth-helpers-nextjs'

const navGroups = [
  {
    label: null,
    items: [
      { href: '/dashboard', 
        icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/missions', 
        icon: BookOpen, label: 'Missions' },
      { href: '/skills', 
        icon: Brain, label: 'Skills' },
    ]
  },
  {
    label: 'Career',
    items: [
      { href: '/portfolio/edit', 
        icon: Globe, label: 'Portfolio' },
      { href: '/resume', 
        icon: FileText, label: 'Resume' },
      { href: '/internships', 
        icon: Briefcase, label: 'Jobs' },
    ]
  },
  {
    label: 'Account',
    items: [
      { href: '/settings', 
        icon: Settings, label: 'Settings' },
    ]
  }
]

const Sidebar = memo(function Sidebar({ profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const supabase = createClientComponentClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: 'spring', stiffness: 300, 
        damping: 30 }}
      className="h-screen bg-[#0A0A0F] 
        border-r border-white/5
        flex flex-col flex-shrink-0
        overflow-hidden relative hidden md:flex"
    >
      {/* Logo */}
      <div className="h-16 flex items-center 
        border-b border-white/5 px-4 flex-shrink-0">
        <Link href="/dashboard"
          className="flex items-center gap-2.5 
            min-w-0">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-xl
            bg-gradient-to-br from-purple-500 
            to-cyan-500 flex items-center 
            justify-center flex-shrink-0
            shadow-lg shadow-purple-500/20">
            <span className="text-white font-black 
              text-sm">U</span>
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="font-bold text-lg 
                  text-white whitespace-nowrap"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Unfol
                <span className="bg-gradient-to-r 
                  from-purple-400 to-cyan-400
                  bg-clip-text text-transparent">
                  dd
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto 
        overflow-x-hidden py-4 px-2 space-y-1">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {/* Group label */}
            {group.label && !collapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white/25 text-xs
                  uppercase tracking-widest
                  px-3 py-2 font-medium"
              >
                {group.label}
              </motion.p>
            )}

            {/* Nav items */}
            {group.items.map(({ href, icon: Icon, 
              label }) => {
              const isActive = pathname === href ||
                (href !== '/dashboard' && 
                 pathname.startsWith(href))

              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  className="block"
                >
                  <motion.div
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-3
                      px-3 py-2.5 rounded-xl
                      transition-colors duration-150
                      relative group
                      ${isActive
                        ? 'bg-purple-500/15 text-purple-300'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      }`}
                  >
                    {/* Active left border */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 
                          -translate-y-1/2 w-0.5 h-5
                          bg-purple-400 rounded-full"
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 35
                        }}
                      />
                    )}

                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className="flex-shrink-0"
                    />

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm font-medium 
                            whitespace-nowrap"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="absolute left-full 
                        ml-2 px-2 py-1 bg-[#1A1A2E]
                        text-white text-xs rounded-lg
                        whitespace-nowrap opacity-0
                        group-hover:opacity-100
                        pointer-events-none
                        border border-white/10
                        transition-opacity duration-150
                        z-50">
                        {label}
                      </div>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom section — user info */}
      <div className="border-t border-white/5 p-3
        flex-shrink-0">
        
        {/* Streak + XP pills */}
        {!collapsed && profile && (
          <div className="flex gap-2 mb-3">
            <div className="flex items-center gap-1.5
              bg-orange-500/10 border border-orange-500/20
              rounded-lg px-2.5 py-1.5 flex-1">
              <Flame size={13} 
                className="text-orange-400 flex-shrink-0" />
              <span className="text-orange-300 text-xs 
                font-semibold">
                {profile.streak_count || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5
              bg-yellow-500/10 border border-yellow-500/20
              rounded-lg px-2.5 py-1.5 flex-1">
              <Zap size={13} 
                className="text-yellow-400 flex-shrink-0" />
              <span className="text-yellow-300 text-xs 
                font-semibold">
                {profile.xp_points || 0}
              </span>
            </div>
          </div>
        )}

        {/* User row */}
        <div className={`flex items-center gap-3
          ${collapsed ? 'justify-center' : ''}`}>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full
            bg-gradient-to-br from-purple-500 
            to-cyan-500 flex items-center
            justify-center text-white text-xs 
            font-bold flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() 
              || 'U'}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs 
                font-medium truncate">
                {profile?.full_name || 'Student'}
              </p>
              <p className="text-white/30 text-xs 
                truncate capitalize">
                {profile?.target_role || 'Loading...'}
              </p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleSignOut}
              className="text-white/20 hover:text-white/60
                transition-colors p-1 rounded-lg
                hover:bg-white/5"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20
          w-6 h-6 bg-[#1A1A2E] border border-white/10
          rounded-full flex items-center justify-center
          text-white/40 hover:text-white
          transition-colors shadow-lg z-10"
      >
        {collapsed 
          ? <ChevronRight size={12} />
          : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
})

export default Sidebar
