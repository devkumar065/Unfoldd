'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

import Image from 'next/image'

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const LOGO_URL = "https://srklrlzewvozsvebzgvm.supabase.co/storage/v1/object/public/avatars/icon.png"

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollTo(id) {
    const el = document.getElementById(id)
    if (el) {
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: el, offsetY: 80 },
        ease: 'power3.inOut'
      })
    }
    setMobileOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3 bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/5' : 'py-6 bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        <motion.div 
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => scrollTo('hero')}
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Image src={LOGO_URL} width={32} height={32} alt="Unfoldd Logo" className="object-contain drop-shadow-[0_0_15px_rgba(108,99,255,0.5)]" />
          </div>
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

        <div className="hidden md:flex items-center gap-8">
          {['how-it-works', 'pricing', 'faq'].map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className="text-sm text-white/60 hover:text-white transition-colors capitalize tracking-wide relative group"
            >
              {item.replace('-', ' ')}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-purple-500 group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative group">
            <button className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20">
              Sign In
              <ChevronDown size={14} />
            </button>
            
            <div className="absolute top-full right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-[#12121A] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-purple-500/10">
              <Link href="/auth/login" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors group/item">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">🎓</div>
                <div>
                  <div className="text-white text-sm font-medium">Student Login</div>
                  <div className="text-white/40 text-xs">Continue learning</div>
                </div>
              </Link>
              
              <div className="h-px bg-white/5" />
              
              <Link href="/company/login" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">🏢</div>
                <div>
                  <div className="text-white text-sm font-medium">Company Login</div>
                  <div className="text-white/40 text-xs">Find talent</div>
                </div>
              </Link>
            </div>
          </div>

          <Link href="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative px-5 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <span className="relative">Get Started Free →</span>
            </motion.button>
          </Link>
        </div>

        <button className="md:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          <motion.div animate={mobileOpen ? 'open' : 'closed'}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0A0A0F] border-t border-white/5 px-6 py-6"
          >
            <div className="flex flex-col gap-4">
              {['how-it-works', 'pricing', 'faq'].map(item => (
                <button key={item} onClick={() => scrollTo(item)} className="text-left text-white/70 hover:text-white py-2 capitalize border-b border-white/5">
                  {item.replace('-', ' ')}
                </button>
              ))}
              
              <div className="flex flex-col gap-3 pt-4">
                <Link href="/auth/login" className="text-center py-3 border border-white/10 rounded-xl text-white/70 hover:text-white">
                  🎓 Student Login
                </Link>
                <Link href="/company/login" className="text-center py-3 border border-white/10 rounded-xl text-white/70 hover:text-white">
                  🏢 Company Login
                </Link>
                <Link href="/auth/signup" className="text-center py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-semibold">
                  Get Started Free →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
