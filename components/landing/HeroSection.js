'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Rocket, 
  Building2, 
  Lock, 
  Sun, 
  Flame, 
  Zap, 
  Calendar, 
  Brain, 
  CheckCircle2, 
  Send, 
  Target, 
  Check 
} from 'lucide-react'

export default function HeroSection() {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  const mockupRef = useRef(null)

  useEffect(() => {
    let ctx = gsap.context(() => {
      const words = headlineRef.current?.querySelectorAll('.word')
      if (words) {
        gsap.fromTo(words, 
          { y: 100, opacity: 0 },
          { 
            y: 0, opacity: 1,
            stagger: 0.08,
            duration: 1,
            ease: 'power4.out',
            delay: 0.3
          }
        )
      }

      if (mockupRef.current && sectionRef.current) {
        gsap.to(mockupRef.current, {
          y: -100,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
          }
        })
      }

      gsap.utils.toArray('.hero-particle').forEach((particle, i) => {
        gsap.to(particle, {
          y: -30 - (i * 10),
          x: Math.sin(i) * 20,
          duration: 2 + (i * 0.3),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        })
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section 
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-12 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-600/15 blur-[100px]"
        />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(#6C63FF 1px, transparent 1px), linear-gradient(90deg, #6C63FF 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
      </div>

      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="hero-particle absolute rounded-full pointer-events-none hidden md:block"
          style={{
            width: 2 + (i % 3) * 2 + 'px',
            height: 2 + (i % 3) * 2 + 'px',
            background: i % 2 === 0 ? '#6C63FF' : '#00D4FF',
            left: 10 + (i * 8) + '%',
            top: 20 + (i % 5) * 15 + '%',
            opacity: 0.4 + (i % 3) * 0.2
          }}
        />
      ))}

      <div className="relative z-10 text-center max-w-5xl mx-auto mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
          </span>
          <span className="text-purple-300 text-sm font-medium flex items-center gap-2">
            <Rocket size={14} className="text-purple-400" />
            Now with AI-Powered Career Roadmaps
          </span>
        </motion.div>

        <h1 ref={headlineRef} className="text-5xl md:text-7xl lg:text-8xl font-black leading-none mb-6 overflow-hidden" style={{ fontFamily: 'Space Grotesk' }}>
          <div className="overflow-hidden">
            {'Unfold Your'.split(' ').map((word, i) => <span key={i} className="word inline-block mr-4 text-white opacity-0">{word}</span>)}
          </div>
          <div className="overflow-hidden pb-4">
            <span className="word inline-block opacity-0" style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Career Potential
            </span>
          </div>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Unfold your skills. Verify your knowledge. Land your dream internship.
          <br className="hidden md:block" />
          90 days from student to hired professional.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link href="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group px-8 py-4 rounded-2xl text-white font-bold text-lg overflow-hidden shadow-2xl shadow-purple-500/30 w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                Start Free Today
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
              </span>
            </motion.button>
          </Link>

          <Link href="/company/register">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl text-white/70 hover:text-white font-semibold text-lg border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Building2 size={20} className="text-cyan-400" /> Hire Students
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <div className="flex -space-x-2">
            {['AK', 'RS', 'PM', 'VK', 'NS'].map((initials, i) => (
              <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0A0A0F] flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ background: `hsl(${i * 40 + 240}, 70%, 50%)` }}>
                {initials}
              </div>
            ))}
          </div>
          <div className="text-white/50 text-sm">
            <span className="text-white font-semibold">10,000+</span> students already building
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}
          </div>
        </motion.div>
      </div>

      {/* Animated Dashboard Mockup */}
      <motion.div
        ref={mockupRef}
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-20 w-full max-w-4xl mx-auto hidden md:block"
      >
        <div className="bg-[#12121A] rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(108,99,255,0.15)] relative">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0D0D16]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-[#1A1A2E] rounded-lg px-3 py-1.5 text-white/30 text-xs flex items-center gap-2 max-w-md mx-auto">
                <Lock size={10} className="text-white/20" /> unfoldd.me/dashboard
              </div>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold text-lg flex items-center gap-2">
                    Good morning, Ajay <Sun size={18} className="text-yellow-400" />
                  </div>
                  <div className="text-white/40 text-sm">Day 23 of your 90-day journey</div>
                </div>
                <div className="flex gap-2">
                  {[
                    { icon: Flame, val: '23', color: 'text-orange-400' },
                    { icon: Zap, val: '2,450', color: 'text-yellow-400' },
                    { icon: Calendar, val: '23/90', color: 'text-cyan-400' }
                  ].map((stat, i) => (
                    <div key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs font-bold flex items-center gap-1.5">
                      <stat.icon size={12} className={stat.color} />
                      {stat.val}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/20 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-purple-400 text-xs font-bold uppercase tracking-wider">Today&apos;s Mission</span>
                  <span className="text-white/40 text-xs font-medium">Ends in 6h 23m</span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { done: true, type: 'LEARN', text: 'Learn React Hooks' },
                    { done: true, type: 'BUILD', text: 'Build a todo app with useState' },
                    { done: false, type: 'APPLY', text: 'Apply to Razorpay internship' }
                  ].map((task, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2 + i * 0.3 }} className="flex items-center gap-3 py-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${task.done ? 'bg-purple-500 border-purple-500' : 'border-white/20'}`}>
                        {task.done && <Check size={10} className="text-white" />}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-widest ${task.type === 'LEARN' ? 'bg-blue-500/20 text-blue-400' : task.type === 'BUILD' ? 'bg-green-500/20 text-green-400' : task.type === 'APPLY' ? 'bg-orange-500/20 text-orange-400' : ''}`}>
                        {task.type}
                      </span>
                      <span className={`text-sm flex-1 font-medium ${task.done ? 'text-white/40 line-through' : 'text-white'}`}>
                        {task.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '66%' }} transition={{ delay: 3, duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Flame, val: '23', label: 'Streak', color: 'text-orange-400' },
                  { icon: Brain, val: '12', label: 'Skills', color: 'text-purple-400' },
                  { icon: CheckCircle2, val: '4', label: 'Verified', color: 'text-green-400' },
                  { icon: Send, val: '8', label: 'Applied', color: 'text-cyan-400' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 + i * 0.1 }} className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                    <div className="flex justify-center mb-1">
                      <stat.icon size={20} className={stat.color} />
                    </div>
                    <div className="text-white font-bold text-sm">{stat.val}</div>
                    <div className="text-white/30 text-[10px] font-medium uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="text-white/60 text-[10px] uppercase tracking-widest mb-3 font-bold">Verified Skills</div>
                <div className="space-y-2">
                  {['React', 'JavaScript', 'CSS', 'Git'].map((skill, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.5 + i * 0.2 }} className="flex items-center justify-between">
                      <span className="text-white/80 text-sm font-medium">{skill}</span>
                      <CheckCircle2 size={12} className="text-green-400" />
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl p-4">
                <div className="text-cyan-400 text-[10px] uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <Target size={10} /> Top Match
                </div>
                <div className="text-white text-sm font-bold">Razorpay</div>
                <div className="text-white/60 text-xs mb-3 font-medium">Frontend Intern</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[92%] h-full bg-cyan-500 rounded-full" />
                  </div>
                  <span className="text-cyan-400 text-xs font-black">92%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-purple-500/20 blur-3xl rounded-full" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden md:flex"
      >
        <span className="text-white/30 text-[10px] font-bold tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-px h-8 bg-gradient-to-b from-purple-500 to-transparent" />
      </motion.div>
    </section>
  )
}
