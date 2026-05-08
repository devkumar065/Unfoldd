'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Rocket, GraduationCap, Building2 } from 'lucide-react'

export default function FinalCTASection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.final-cta-content',
        { y: 100, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true
          }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-40 px-6 relative overflow-hidden bg-[#0A0A0F]">
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-[#0A0A0F] to-cyan-900/20" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[100px]"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(108,99,255,0.1), transparent, rgba(0,212,255,0.1), transparent)',
          }}
        />
      </div>

      <div className="final-cta-content relative z-10 text-center max-w-4xl mx-auto">
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
          className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl backdrop-blur-md"
        >
          <Rocket size={48} className="text-purple-400" />
        </motion.div>
        
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter" style={{ fontFamily: 'Space Grotesk' }}>
          Your Career Starts{' '}
          <span style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Today
          </span>
        </h2>
        
        <p className="text-white/50 text-xl md:text-2xl mb-16 font-medium leading-relaxed max-w-2xl mx-auto">
          10,000+ students are already unfolding their careers on Unfoldd.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/auth/signup" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group w-full sm:w-auto px-12 py-6 rounded-[2rem] text-white font-black text-xl uppercase tracking-widest overflow-hidden shadow-[0_0_50px_rgba(108,99,255,0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center justify-center gap-3">
                <GraduationCap size={24} /> Start as Student <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full border border-white/30">FREE</span>
              </span>
            </motion.button>
          </Link>

          <Link href="/company/register" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto px-12 py-6 rounded-[2rem] text-white font-black text-xl uppercase tracking-widest border-2 border-white/20 hover:border-white/40 hover:bg-white/5 backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Building2 size={24} className="text-cyan-400" /> Hire Verified Talent
            </motion.button>
          </Link>
        </div>

        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-12">
          No credit card required · Cancel anytime · Takes 2 minutes to set up
        </p>
      </div>
    </section>
  )
}
