'use client'

import { memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  BookOpen,
  Brain,
  Briefcase,
  User
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/missions', icon: BookOpen, 
    label: 'Missions' },
  { href: '/skills', icon: Brain, label: 'Skills' },
  { href: '/internships', icon: Briefcase, 
    label: 'Jobs' },
  { href: '/portfolio/edit', icon: User, 
    label: 'Profile' },
]

const MobileNav = memo(function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0
      z-50 md:hidden
      bg-[#0A0A0F]/95 backdrop-blur-xl
      border-t border-white/5"
      style={{ 
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))' 
      }}>
      <div className="flex items-center justify-around
        px-2 pt-2 pb-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href ||
            (href !== '/dashboard' && 
             pathname.startsWith(href))

          return (
            <Link key={href} href={href} prefetch={true}>
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center
                  gap-1 px-3 py-1 min-w-[56px]"
              >
                {/* Icon container */}
                <div className={`relative p-1.5 
                  rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-purple-500/20' 
                    : ''}`}>
                  
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={`transition-colors duration-200
                      ${isActive 
                        ? 'text-purple-400' 
                        : 'text-white/35'}`}
                  />

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -bottom-1 
                        left-1/2 -translate-x-1/2
                        w-1 h-1 rounded-full bg-purple-400"
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 35
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <span className={`text-[10px] 
                  font-medium transition-colors duration-200
                  ${isActive 
                    ? 'text-purple-400' 
                    : 'text-white/25'}`}>
                  {label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
})

export default MobileNav
