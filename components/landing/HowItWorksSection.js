'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import { Map, Target, Briefcase, Sparkles, CheckCircle2, Lock } from 'lucide-react'

export default function HowItWorksSection() {
  const sectionRef = useRef(null)
  const stepsRef = useRef(null)

  useEffect(() => {
    // Only apply horizontal scroll pinning on desktop
    if (window.innerWidth < 1024) return

    let ctx = gsap.context(() => {
      const steps = gsap.utils.toArray('.step-panel')
      
      gsap.to(steps, {
        xPercent: -100 * (steps.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: stepsRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (steps.length - 1),
          start: 'top top',
          end: () => '+=' + stepsRef.current.offsetWidth * (steps.length - 1)
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const steps = [
    {
      number: '01',
      title: 'Get Your AI Roadmap',
      subtitle: 'Personalized. Precise. Yours.',
      description: 'Tell Unfoldd your target role, college schedule, and daily time. Our AI builds your exact 90-day plan — not a generic course, but your specific path from where you are to where you want to be.',
      features: ['Fitted around your class timetable', 'Adjusts before your exam dates', 'Updates based on your progress', 'Role-specific skill progression'],
      color: '#6C63FF',
      icon: Map
    },
    {
      number: '02',
      title: 'Learn, Build & Verify',
      subtitle: 'Real skills. Real proof.',
      description: 'Each day: watch a curated video (cannot skip), complete a hands-on build task, apply to one matched internship. Pass our proctored exam to earn an officially verified skill badge.',
      features: ['Anti-skip video learning', 'Three-level knowledge tests', 'AI camera-monitored exams', 'Official verified badges'],
      color: '#00D4FF',
      icon: Target
    },
    {
      number: '03',
      title: 'Get Hired',
      subtitle: 'Companies come to you.',
      description: 'Your auto-built portfolio shows verified skills that companies trust. Your resume scores itself for ATS. Companies on Unfoldd filter specifically for verified candidates — putting you ahead of the crowd.',
      features: ['Auto-updating portfolio', 'ATS-optimized resume', 'Smart internship matching', 'Priority company placement'],
      color: '#00F5A0',
      icon: Briefcase
    }
  ]

  return (
    <section ref={sectionRef} id="how-it-works" className="relative bg-[#0A0A0F] overflow-hidden">
      <div className="text-center pt-32 pb-10 px-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
          <Sparkles size={12} /> The Process
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
          Three Steps to{' '}
          <span style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Getting Hired
          </span>
        </h2>
        <p className="text-white/40 mt-4 text-sm font-bold uppercase tracking-widest hidden lg:block">Scroll to explore the journey →</p>
      </div>

      <div ref={stepsRef} className="flex flex-col lg:flex-row lg:overflow-hidden w-full lg:w-[300vw]">
        {steps.map((step, i) => (
          <div key={i} className="step-panel w-full lg:w-screen min-h-screen flex items-center justify-center px-6 py-20 relative" style={{ background: `radial-gradient(ellipse at center, ${step.color}08 0%, transparent 70%)` }}>
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
              
              <div className="order-2 lg:order-1">
                <div className="text-8xl md:text-9xl font-black mb-6 opacity-10 leading-none" style={{ color: step.color, fontFamily: 'Space Grotesk' }}>{step.number}</div>
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-8 shadow-xl">
                  <step.icon size={32} style={{ color: step.color }} />
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>{step.title}</h3>
                <p className="font-bold text-lg mb-6 uppercase tracking-wider" style={{ color: step.color }}>{step.subtitle}</p>
                <p className="text-white/50 leading-relaxed mb-10 text-lg font-medium">{step.description}</p>
                
                <ul className="space-y-4">
                  {step.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-white/70 font-medium">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 shadow-md" style={{ background: step.color + '20', color: step.color, border: `1px solid ${step.color}40` }}>
                        <CheckCircle2 size={10} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative order-1 lg:order-2">
                <div className="bg-[#0D0D16] rounded-3xl border p-8 shadow-2xl relative z-10 overflow-hidden" style={{ borderColor: step.color + '30', boxShadow: `0 30px 60px ${step.color}15` }}>
                  <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${step.color}, transparent)` }} />
                  {i === 0 && <RoadmapMockup />}
                  {i === 1 && <LearningMockup />}
                  {i === 2 && <HiringMockup />}
                </div>
                <div className="absolute -inset-10 rounded-[3rem] -z-10 blur-3xl opacity-20 pointer-events-none" style={{ background: step.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RoadmapMockup() {
  return (
    <div className="space-y-4">
      <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-[#6C63FF] animate-pulse" /> Active 90-Day Plan
      </div>
      {['Week 1: Advanced Auth Systems', 'Week 2: Microservices Arch', 'Week 3: Build Payment Gateway', 'Week 4: Production Deployment'].map((w, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center text-[#6C63FF] text-xs font-black">{i + 1}</div>
          <span className="text-white/80 font-bold text-sm tracking-tight">{w}</span>
        </motion.div>
      ))}
    </div>
  )
}

function LearningMockup() {
  return (
    <div className="space-y-6">
      <div className="bg-black/60 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden border border-white/10 group cursor-pointer">
        <div className="w-16 h-16 rounded-full bg-[#00D4FF]/20 border border-[#00D4FF]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
           <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[12px] border-l-[#00D4FF] border-b-8 border-b-transparent ml-1" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5">
          <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ duration: 3, ease: "linear" }} className="h-full bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['EASY', 'MEDIUM', 'HARD'].map((l, i) => (
          <div key={i} className={`text-center py-3 rounded-xl text-[10px] font-black tracking-widest flex items-center justify-center gap-1.5 ${i < 2 ? 'bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/20' : 'bg-white/5 text-white/30 border border-white/5'}`}>
            {l} {i < 2 ? <CheckCircle2 size={10} /> : <Lock size={10} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function HiringMockup() {
  return (
    <div className="space-y-4">
      <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Matched Opportunities</div>
      {[
        { co: 'Razorpay', role: 'Frontend Intern', match: 94, color: '#00F5A0' },
        { co: 'CRED', role: 'Full Stack Intern', match: 87, color: '#00D4FF' },
        { co: 'Zepto', role: 'React Developer', match: 79, color: '#6C63FF' },
      ].map((job, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-colors">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white bg-gradient-to-br from-white/10 to-transparent border border-white/10">{job.co[0]}</div>
            <div>
              <div className="text-white text-sm font-bold">{job.co}</div>
              <div className="text-white/40 text-xs font-medium mt-0.5">{job.role}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-[10px] font-black tracking-widest" style={{ color: job.color }}>{job.match}% MATCH</div>
            <button className="text-[10px] font-black tracking-wider px-4 py-1.5 rounded-lg text-white transition-all hover:scale-105" style={{ background: job.color, boxShadow: `0 0 15px ${job.color}40` }}>APPLY</button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
