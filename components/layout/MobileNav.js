'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, BookOpen, Award, Briefcase, User } from 'lucide-react'

export function MobileNav() {
  const pathname = usePathname()

  // Don't show mobile nav on landing page or auth/exam pages
  const hideOn = ['/', '/auth', '/exam', '/admin', '/onboarding']
  if (hideOn.some(path => pathname === path || (path !== '/' && pathname.startsWith(path)))) return null

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: BookOpen, label: 'Missions', href: '/missions' },
    { icon: Award, label: 'Skills', href: '/skills' },
    { icon: Briefcase, label: 'Jobs', href: '/internships' },
    { icon: User, label: 'Profile', href: '/portfolio/edit' },
  ]

  return (
    <nav className="mobile-nav md:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[56px] relative"
              >
                <div className={`relative p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-purple-500/20 text-purple-400' : 'text-white/40'}`}>
                  <Icon size={20} />
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400"
                    />
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-purple-400' : 'text-white/30'}`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
