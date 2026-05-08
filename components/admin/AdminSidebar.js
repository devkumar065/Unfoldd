'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  UserX,
  Building2,
  Film,
  HelpCircle,
  Briefcase,
  ClipboardCheck,
  MessageSquare,
  Bell,
  Key,
  BarChart2,
  CreditCard,
  Settings,
  FileText,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

const adminNav = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', 
        icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    label: 'Users',
    items: [
      { href: '/admin/users', 
        icon: Users, label: 'All Users' },
      { href: '/admin/users?filter=banned', 
        icon: UserX, label: 'Banned Users' },
      { href: '/admin/companies', 
        icon: Building2, label: 'Companies' },
    ]
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/content/videos', 
        icon: Film, label: 'Video Library' },
      { href: '/admin/content/questions', 
        icon: HelpCircle, label: 'Question Bank' },
      { href: '/admin/internships', 
        icon: Briefcase, label: 'Internships' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/exams', 
        icon: ClipboardCheck, label: 'Flagged Exams' },
      { href: '/admin/messages', 
        icon: MessageSquare, label: 'Messages' },
      { href: '/admin/notifications', 
        icon: Bell, label: 'Notifications' },
    ]
  },
  {
    label: 'Revenue',
    items: [
      { href: '/admin/transactions', 
        icon: CreditCard, label: 'Transactions' },
      { href: '/admin/analytics', 
        icon: BarChart2, label: 'Analytics' },
    ]
  },
  {
    label: 'System',
    items: [
      { href: '/admin/integrations', 
        icon: Key, label: 'Integrations' },
      { href: '/admin/settings', 
        icon: Settings, label: 'Settings' },
      { href: '/admin/audit-log', 
        icon: FileText, label: 'Audit Log' },
    ]
  }
]

export default function AdminSidebar({ adminUser }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      className="hidden md:flex flex-col h-screen border-r border-white/5 bg-[#0A0A0F] relative z-20 flex-shrink-0 overflow-hidden"
    >
      {/* Brand */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              Unfol<span className="text-purple-500">dd</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500/80">Admin Panel</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 scrollbar-hide">
        {adminNav.map(group => (
          <div key={group.label} className="mb-6">
            {!collapsed && (
              <p className="text-white/20 text-[10px] uppercase tracking-widest px-6 py-2 font-black">
                {group.label}
              </p>
            )}
            <div className="space-y-1 px-3">
              {group.items.map(({ href, icon: Icon, label }) => {
                const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
                return (
                  <Link key={href} href={href}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative group",
                      isActive
                        ? 'bg-purple-500/15 text-purple-300'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    )}>
                      {isActive && (
                        <motion.div layoutId="adminActive" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-purple-500 rounded-full" />
                      )}
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} className="flex-shrink-0" />
                      {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
                      
                      {collapsed && (
                        <div className="absolute left-full ml-3 px-2 py-1 bg-white text-[#0A0A0F] text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                          {label}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Area */}
      <div className="p-4 border-t border-white/5 bg-[#050508]/50">
        {!collapsed && (
          <a href="/dashboard" target="_blank" className="flex items-center justify-center gap-2 w-full py-2 mb-4 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors">
            View App <ExternalLink size={12} />
          </a>
        )}
        <div className={cn("flex items-center justify-between", collapsed && "justify-center")}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
              {adminUser?.full_name?.charAt(0) || 'A'}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{adminUser?.full_name || 'Admin'}</p>
                <p className="text-[10px] text-white/30 truncate uppercase tracking-tighter">{adminUser?.role}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={handleSignOut} className="p-2 text-white/20 hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
