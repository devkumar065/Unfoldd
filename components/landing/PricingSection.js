'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PricingSection() {
  const [yearly, setYearly] = useState(false)

  const plans = [
    {
      name: 'Starter',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect to start your journey',
      color: '#9999BB',
      features: [
        { text: '90-day AI roadmap', included: true },
        { text: 'Daily missions', included: true },
        { text: 'Basic portfolio', included: true },
        { text: '3 skill verifications/month', included: true },
        { text: '5 internship matches/week', included: true },
        { text: 'Premium templates', included: false },
        { text: 'Unlimited verifications', included: false },
        { text: 'Priority company placement', included: false },
      ],
      cta: 'Get Started Free',
      ctaStyle: 'border'
    },
    {
      name: 'Pro',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      description: 'For serious learners',
      color: '#6C63FF',
      popular: true,
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Unlimited verifications', included: true },
        { text: 'Premium portfolio templates', included: true },
        { text: 'Unlimited internship matches', included: true },
        { text: 'Priority company placement', included: true },
        { text: 'ATS resume optimization', included: true },
        { text: 'Streak freeze (2/month)', included: true },
        { text: '1:1 AI counseling', included: false },
      ],
      cta: 'Start Pro →',
      ctaStyle: 'gradient'
    },
    {
      name: 'Elite',
      monthlyPrice: 499,
      yearlyPrice: 4990,
      description: 'For fast-trackers',
      color: '#00D4FF',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: '1:1 AI career counseling', included: true },
        { text: 'Mock interview preparation', included: true },
        { text: 'LinkedIn optimization', included: true },
        { text: 'Direct recruiter intro', included: true },
        { text: 'Placement guarantee support', included: true },
        { text: 'Priority 24/7 support', included: true },
        { text: 'Exclusive job referrals', included: true },
      ],
      cta: 'Go Elite →',
      ctaStyle: 'cyan'
    }
  ]

  return (
    <section id="pricing" className="py-32 px-6 relative bg-[#0A0A0F]">
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
            💰 Simple Pricing
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
            Invest In Your Future
          </h2>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 bg-white/5 w-max mx-auto p-2 rounded-2xl border border-white/10 shadow-lg">
            <span className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl cursor-pointer transition-all ${!yearly ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`} onClick={() => setYearly(false)}>
              Monthly
            </span>
            <span className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-2 ${yearly ? 'bg-purple/20 text-purple-light border border-purple/30' : 'text-white/40 hover:text-white/80'}`} onClick={() => setYearly(true)}>
              Yearly
              <span className="bg-green-500/20 text-green-400 text-[9px] px-2 py-0.5 rounded-full border border-green-500/30">
                Save 16%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <motion.div key={i} whileHover={{ y: -10 }} transition={{ duration: 0.4 }} className={`relative rounded-[2.5rem] p-8 border transition-all duration-500 shadow-2xl flex flex-col h-full ${plan.popular ? 'bg-gradient-to-b from-purple-900/20 to-[#12121A] border-purple-500/40 z-10 scale-105 md:-mx-4' : 'bg-[#12121A] border-white/10 hover:border-white/20'}`}>
              
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-[0_0_20px_rgba(108,99,255,0.4)]">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-white font-black text-2xl mb-2 tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>{plan.name}</h3>
                <p className="text-white/40 text-xs font-medium uppercase tracking-widest">{plan.description}</p>
              </div>

              <div className="mb-10 pb-8 border-b border-white/10">
                <div className="flex items-start gap-1">
                  <span className="text-white/50 text-xl font-bold mt-2">₹</span>
                  <motion.span key={yearly ? 'yearly' : 'monthly'} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-black text-white tracking-tighter" style={{ fontFamily: 'Space Grotesk' }}>
                    {yearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </motion.span>
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                    {plan.monthlyPrice > 0 ? yearly ? '/yr' : '/mo' : ''}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className={`flex items-start gap-3 text-sm font-medium ${f.included ? 'text-white/80' : 'text-white/20'}`}>
                    <span className={f.included ? (plan.popular ? 'text-purple-400' : 'text-cyan-400') : 'text-white/20'}>
                      {f.included ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                    </span>
                    <span className={f.included ? '' : 'line-through decoration-white/20'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/signup">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${plan.ctaStyle === 'gradient' ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_30px_rgba(108,99,255,0.3)]' : plan.ctaStyle === 'cyan' ? 'bg-cyan-600 text-black shadow-[0_0_30px_rgba(0,212,255,0.2)]' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30'}`}>
                  {plan.cta}
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-16 text-center">
          {['🔒 256-bit encryption', '✅ Cancel anytime', '🎓 Upgrade when ready'].map((badge, i) => (
            <div key={i} className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
