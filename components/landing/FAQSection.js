'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Is Unfoldd really free to start?',
    a: 'Yes! Our free plan includes the complete 90-day AI roadmap, daily missions, basic portfolio, and 3 skill verifications per month. No credit card required. Upgrade only when you want unlimited access.'
  },
  {
    q: 'How is this different from Coursera or Udemy?',
    a: "Unfoldd is not a course platform. We give you a daily mission system that combines structured video learning with proctored skill verification, automatic portfolio building, and direct company matching. We don't just educate — we get you hired."
  },
  {
    q: 'Are the verified skill badges actually recognized?',
    a: 'Yes. Companies registered on Unfoldd specifically filter for verified candidates. Our proctored exam system — with camera monitoring and anti-cheat technology — ensures every badge is genuinely earned and trusted.'
  },
  {
    q: 'Can I use Unfoldd alongside my regular college?',
    a: 'Absolutely! During onboarding you enter your class timetable and upcoming exam dates. Unfoldd builds your missions around your free time — even 30 minutes a day is enough to make serious progress.'
  },
  {
    q: 'What if I miss a day or fall behind?',
    a: "Your progress is always saved. Your roadmap adapts. We don't punish missed days — we make it easy to restart. Pro users get 2 streak freezes per month to protect their streak during busy periods."
  },
  {
    q: 'Which career roles does Unfoldd support?',
    a: 'Currently: Full Stack Development, Software Engineering (SDE), Cybersecurity/SOC Analysis, Data Science/ML Engineering, DevOps/Cloud, and UI/UX Design. More roles are added regularly.'
  },
  {
    q: 'How does the proctored exam work?',
    a: 'You generate a time-limited exam link from your dashboard. Open it on your laptop — the exam forces fullscreen, disables all shortcuts, and uses your camera to monitor for violations. Pass with 70%+ to get officially verified.'
  },
  {
    q: 'Can companies actually find me on Unfoldd?',
    a: 'Yes. Registered companies search for candidates filtered by verified skills, role, college, and year. Students with verified skills appear in priority placement. Your portfolio and resume are always attached to applications.'
  }
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section id="faq" className="py-32 px-6 relative bg-[#0A0A0F]">
      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
            🤔 Got Questions?
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              viewport={{ once: true }}
              className="border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors duration-300 bg-[#12121A] shadow-xl group"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-8 py-6 text-left bg-transparent group-hover:bg-white/5 transition-colors duration-300"
              >
                <span className="text-white font-bold text-lg pr-4 tracking-tight">
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-colors"
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1}}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 pt-2 text-white/60 text-base font-medium leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
