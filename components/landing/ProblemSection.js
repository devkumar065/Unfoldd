'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import { BookOpen, Compass, Send, AlertCircle } from 'lucide-react'

export default function ProblemSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.problem-header',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1,
          scrollTrigger: {
            trigger: '.problem-header',
            start: 'top 80%',
            end: 'top 50%',
            scrub: false,
            once: true
          }
        }
      )

      gsap.fromTo('.problem-card-left',
        { x: -100, opacity: 0, rotation: -5 },
        {
          x: 0, opacity: 1, rotation: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.problem-cards',
            start: 'top 75%',
            once: true
          }
        }
      )

      gsap.fromTo('.problem-card-center',
        { y: 80, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8,
          delay: 0.2,
          scrollTrigger: {
            trigger: '.problem-cards',
            start: 'top 75%',
            once: true
          }
        }
      )

      gsap.fromTo('.problem-card-right',
        { x: 100, opacity: 0, rotation: 5 },
        {
          x: 0, opacity: 1, rotation: 0,
          duration: 0.8, delay: 0.4,
          scrollTrigger: {
            trigger: '.problem-cards',
            start: 'top 75%',
            once: true
          }
        }
      )

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const problems = [
    {
      icon: BookOpen,
      color: 'text-purple-400',
      title: 'College Teaches Theory',
      desc: 'Your syllabus is 5 years behind industry standards. You graduate knowing theory but cannot build a real project or crack any technical interview.',
      stat: '67% of students',
      statDesc: 'feel unprepared for industry',
      className: 'problem-card-left'
    },
    {
      icon: Compass,
      color: 'text-cyan-400',
      title: 'Zero Clear Direction',
      desc: 'React or Vue? Node or Django? Everyone gives conflicting advice. You start 10 different courses and finish none of them.',
      stat: '10+ courses',
      statDesc: 'started, none finished',
      className: 'problem-card-center'
    },
    {
      icon: Send,
      color: 'text-orange-400',
      title: 'Applications Into Void',
      desc: 'You apply to 50 internships. Get 2 replies. No portfolio to show your work. No verified skills. Just a resume with no proof.',
      stat: '2% response rate',
      statDesc: 'for unverified candidates',
      className: 'problem-card-right'
    }
  ]

  return (
    <section ref={sectionRef} id="problem" className="py-32 px-6 relative bg-[#0A0A0F]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="problem-header text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
            <AlertCircle size={12} /> The Problem
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
            Sound Familiar?
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Every engineering student faces these challenges. You&apos;re not alone, but you need a new strategy to break out.
          </p>
        </div>

        <div className="problem-cards grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((p, i) => (
            <div key={i} className={`${p.className} relative bg-gradient-to-br from-[#1A0A0A] to-[#12121A] border border-red-500/10 hover:border-red-500/30 rounded-3xl p-8 transition-all duration-300 group shadow-2xl`}>
              <div className="absolute inset-0 rounded-3xl bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500">
                <p.icon size={32} className={p.color} />
              </div>
              <h3 className="text-white font-bold text-2xl mb-4 tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
                {p.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-8 min-h-[80px]">
                {p.desc}
              </p>
              
              <div className="border-t border-white/10 pt-6">
                <div className="text-red-400 font-black text-xl tracking-tight mb-1">{p.stat}</div>
                <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{p.statDesc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-24">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="inline-flex flex-col items-center gap-3 text-purple-400">
            <span className="text-[10px] font-black uppercase tracking-widest">There is a better way</span>
            <span className="text-xl font-bold">↓</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
