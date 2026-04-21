'use client'

import { motion } from 'framer-motion'
import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingFooter from '@/components/landing/LandingFooter'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="bg-[#0A0A0F] min-h-screen text-white/80 overflow-hidden">
      <LandingNavbar />
      
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter" 
            style={{ fontFamily: 'Space Grotesk' }}
          >
            We are students who <br/>
            <span style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
               solved our own problem.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Helping students unfold their potential.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>The Broken System</h2>
            <p className="text-lg leading-relaxed text-white/60">
              We sat through 4 years of engineering lectures only to realize we didn&apos;t know how to build a single production-ready application. When we applied for internships, our resumes vanished into the void. 
            </p>
            <p className="text-lg leading-relaxed text-white/60">
              Companies were desperate for talent, but they didn&apos;t trust our college degrees. They wanted proof of skills. We realized the system was fundamentally broken.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[#12121A] border border-red-500/20 rounded-[3rem] p-10 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.05)]">
            <div className="text-5xl mb-6">📉</div>
            <h3 className="text-2xl font-bold text-white mb-4">The Reality</h3>
            <ul className="space-y-4 text-white/60 font-medium">
              <li className="flex gap-3"><span className="text-red-500">✗</span> Syllabus updated 5 years ago</li>
              <li className="flex gap-3"><span className="text-red-500">✗</span> Focus on exams, not building</li>
              <li className="flex gap-3"><span className="text-red-500">✗</span> 1000s of generic certificates with no value</li>
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-purple-900/20 to-[#12121A] border border-purple-500/30 rounded-[3rem] p-10 relative overflow-hidden shadow-[0_0_50px_rgba(108,99,255,0.1)] order-2 md:order-1">
            <div className="text-5xl mb-6">📈</div>
            <h3 className="text-2xl font-bold text-white mb-4">Our Approach</h3>
            <ul className="space-y-4 text-white/80 font-medium">
              <li className="flex gap-3"><span className="text-green-400">✓</span> AI-tailored 90-day roadmaps</li>
              <li className="flex gap-3"><span className="text-green-400">✓</span> Anti-cheat proctored skill verification</li>
              <li className="flex gap-3"><span className="text-green-400">✓</span> Direct matching with top companies</li>
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6 order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>The Unfoldd Solution</h2>
            <p className="text-lg leading-relaxed text-white/60">
              We built the platform we wished we had. Unfoldd doesn&apos;t just give you tutorials; it gives you a daily mission. It forces you to build. 
            </p>
            <p className="text-lg leading-relaxed text-white/60">
              Through our proctored exam engine, we verify your skills mathematically. When a company sees a Unfoldd verified badge on your auto-generated portfolio, they know it&apos;s earned, not bought.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-12" style={{ fontFamily: 'Space Grotesk' }}>Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#12121A] border border-white/5 p-8 rounded-3xl">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-white font-bold mb-2">Students First</h3>
              <p className="text-sm text-white/50">Our pricing and features are designed to democratize access to elite tech careers.</p>
            </div>
            <div className="bg-[#12121A] border border-white/5 p-8 rounded-3xl">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-white font-bold mb-2">Radical Honesty</h3>
              <p className="text-sm text-white/50">We don&apos;t sell fake promises. We verify real skills through rigorous testing.</p>
            </div>
            <div className="bg-[#12121A] border border-white/5 p-8 rounded-3xl">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-white font-bold mb-2">Results Only</h3>
              <p className="text-sm text-white/50">Completion certificates are dead. We measure our success solely by your job offers.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-t from-[#12121A] to-transparent text-center border-t border-white/5">
        <h2 className="text-3xl font-black text-white mb-6" style={{ fontFamily: 'Space Grotesk' }}>Join the Movement</h2>
        <p className="text-white/50 mb-10 max-w-lg mx-auto">Whether you&apos;re a student ready to level up, or a company looking for verified talent.</p>
        <div className="flex justify-center gap-4">
           <Link href="/auth/signup" className="bg-purple text-white px-8 py-4 rounded-2xl font-bold hover:bg-purple-light transition-colors shadow-lg shadow-purple/20">
             Start Free Trial
           </Link>
           <a href="mailto:careers@unfoldd.me" className="bg-transparent border border-white/20 text-white hover:bg-white/5 px-8 py-4 rounded-2xl font-bold transition-colors">
             Careers
           </a>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}
