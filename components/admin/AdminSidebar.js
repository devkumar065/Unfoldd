'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Users, Ban, Building2, Video, 
  HelpCircle, Briefcase, Flag, Mail, Bell, 
  CreditCard, LineChart, Wrench, Settings, FileText, 
  ChevronLeft, ChevronRight, LogOut, ExternalLink 
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

import Image from 'next/image'

export default function AdminSidebar({ adminUser, flaggedCount, unreadMessagesCount }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const LOGO_URL = "https://srklrlzewvozsvebzgvm.supabase.co/storage/v1/object/public/avatars/icon.png"

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Users',
      items: [
        { name: 'All Users', href: '/admin/users', icon: Users },
        { name: 'Banned Users', href: '/admin/users?filter=banned', icon: Ban },
        { name: 'Companies', href: '/admin/companies', icon: Building2 }
      ]
    },
    {
      title: 'Content',
      items: [
        { name: 'Video Library', href: '/admin/content/videos', icon: Video },
        { name: 'Question Bank', href: '/admin/content/questions', icon: HelpCircle },
        { name: 'Internships', href: '/admin/internships', icon: Briefcase }
      ]
    },
    {
      title: 'Operations',
      items: [
        { 
          name: 'Flagged Exams', 
          href: '/admin/exams', 
          icon: Flag, 
          badge: flaggedCount > 0 ? flaggedCount : null,
          badgeColor: 'bg-red-500 text-white' 
        },
        { 
          name: 'Messages', 
          href: '/admin/messages', 
          icon: Mail,
          badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
          badgeColor: 'bg-cyan-500 text-white'
        },
        { name: 'Notifications', href: '/admin/notifications', icon: Bell }
      ]
    },
    {
      title: 'Revenue',
      items: [
        { name: 'Transactions', href: '/admin/payments', icon: CreditCard },
        { 
          name: 'Analytics', 
          href: '/admin/analytics', 
          icon: LineChart,
          requirePermission: 'can_view_analytics'
        }
      ]
    },
    {
      title: 'System',
      requireRole: 'superadmin',
      items: [
        { name: 'Integrations', href: '/admin/integrations', icon: Wrench },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
        { name: 'Audit Log', href: '/admin/audit-log', icon: FileText }
      ]
    }
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  return (
    <motion.aside
      initial={{ width: 260 }}
      animate={{ width: collapsed ? 80 : 260 }}
      className="hidden md:flex flex-col h-screen border-r border-white/5 bg-[#0A0A0F] relative z-20 flex-shrink-0"
    >
      {/* Top Brand */}
      <div className="flex items-center justify-between p-6 h-20 border-b border-white/5 shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <Image src={LOGO_URL} width={32} height={32} alt="Unfoldd Admin Logo" className="object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              </div>
              <div className="flex flex-col">
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
                <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Admin</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 hide-scrollbar">
        {navGroups.map((group, i) => {
          // Check group role requirements
          if (group.requireRole && adminUser?.role !== group.requireRole) return null

          // Filter items based on permissions
          const visibleItems = group.items.filter(item => {
            if (item.requirePermission && !adminUser?.permissions?.[item.requirePermission]) return false
            if (adminUser?.role === 'support' && !['Dashboard', 'All Users'].includes(item.name)) return false
            return true
          })

          if (visibleItems.length === 0) return null

          return (
            <div key={i} className="mb-6 px-4">
              {!collapsed && (
                <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 px-3">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {visibleItems.map(item => {
                  // Precise matching for root, startsWith for sub-pages
                  const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)

                  return (
                    <Link key={item.name} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer relative",
                          isActive
                            ? "bg-purple-600/10 text-purple-400 font-bold"
                            : "text-white/60 hover:bg-white/5 hover:text-white font-medium"
                        )}
                      >
                        {isActive && (
                          <motion.div layoutId="adminNavIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-purple-500 rounded-r-full" />
                        )}
                        
                        <div className="flex items-center gap-3">
                          <item.icon size={18} className={cn("shrink-0", isActive ? "text-purple-400" : "text-white/40 group-hover:text-white/80")} />
                          {!collapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
                        </div>

                        {!collapsed && item.badge && (
                          <div className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm", item.badgeColor)}>
                            {item.badge}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Profile Area */}
      <div className="p-4 border-t border-white/5 shrink-0 bg-[#050508]">
        {!collapsed && (
          <a href="/dashboard" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 mb-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition-colors">
            Student App <ExternalLink size={14} />
          </a>
        )}
        
        <div className={cn("flex items-center justify-between", collapsed && "flex-col gap-4")}>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-900 to-[#0A0A0F] border border-purple-500/30 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
              {adminUser?.avatar_url ? (
                <Image src={adminUser.avatar_url} alt="Avatar" fill className="object-cover" />
              ) : (
                adminUser?.full_name?.charAt(0) || 'A'
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{adminUser?.full_name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 truncate">{adminUser?.role}</p>
                </div>
              </div>
            )}
          </div>
          
          <button onClick={handleSignOut} title="Sign Out" className="p-2 rounded-xl text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
