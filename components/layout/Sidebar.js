'use client'

import { memo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// memo prevents re-renders when parent re-renders
const Sidebar = memo(function Sidebar({ profile }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { href: '/missions', icon: '🎯', label: 'Missions' },
    { href: '/skills', icon: '🧠', label: 'Skills' },
    { href: '/portfolio/edit', icon: '🌐', label: 'Portfolio' },
    { href: '/resume', icon: '📄', label: 'Resume' },
    { href: '/internships', icon: '💼', label: 'Internships' },
    { href: '/settings', icon: '⚙️', label: 'Settings' },
  ]

  const LOGO_URL = "https://srklrlzewvozsvebzgvm.supabase.co/storage/v1/object/public/avatars/icon.png"

  return (
    <aside className="w-[240px] h-screen bg-[#0A0A0F] border-r border-white/5 flex flex-col flex-shrink-0 hidden md:flex">
      
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src={LOGO_URL} alt="U" width={28} height={28} className="rounded-lg" />
          <span className="font-bold text-white flex items-center">
            <span>Unfol</span>
            <span className="gradient-text">dd</span>
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true} // Prefetch ALL nav items
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-purple-500/15 text-purple-300 border-l-2 border-purple-500'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base w-5 text-center flex-shrink-0">
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      {profile && (
        <div className="p-4 border-t border-white/5 bg-[#050508]/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative overflow-hidden">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill className="object-cover" />
              ) : (
                profile.full_name?.[0] || 'U'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate">
                {profile.full_name}
              </p>
              <p className="text-white/40 text-[10px] flex items-center gap-1">
                🔥 {profile.streak_count || 0} · ⚡ {profile.xp_points || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
})

export default Sidebar
