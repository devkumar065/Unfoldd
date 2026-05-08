'use client'

import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import { GraduationCap, CheckCircle2, Building2, Rocket } from 'lucide-react'

export default function StatsSection() {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true
  })

  const stats = [
    { value: 10000, suffix: '+', label: 'Students', desc: 'building daily', icon: GraduationCap, color: 'text-purple-400' },
    { value: 500, suffix: '+', label: 'Skills Verified', desc: 'officially certified', icon: CheckCircle2, color: 'text-green-400' },
    { value: 200, suffix: '+', label: 'Companies', desc: 'actively hiring', icon: Building2, color: 'text-cyan-400' },
    { value: 90, suffix: ' Days', label: 'Journey', desc: 'to interview ready', icon: Rocket, color: 'text-orange-400' },
  ]

  return (
    <section className="py-32 relative overflow-hidden bg-[#0A0A0F]">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-cyan-600/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-center group p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all duration-300 relative overflow-hidden shadow-2xl"
              >
                <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10" />
                
                <div className="flex justify-center mb-6">
                  <Icon size={48} className={`${stat.color} group-hover:scale-110 transition-transform duration-500`} />
                </div>
                <div className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 tracking-tighter" style={{ fontFamily: 'Space Grotesk' }}>
                  {inView ? (
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      delay={i * 0.2}
                      separator=","
                      suffix={stat.suffix}
                      useEasing={true}
                    />
                  ) : '0'}
                </div>
                <div className="text-purple-300 font-bold text-lg uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-white/40 text-sm font-medium">{stat.desc}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
