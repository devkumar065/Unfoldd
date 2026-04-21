'use client'

import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: '3rd Year, VIT Vellore',
    target: 'Full Stack Developer',
    quote: 'Unfoldd changed everything. In 60 days I went from knowing basic HTML to getting a React internship at a funded startup. The verified badge is what got me the callback.',
    rating: 5,
    streak: 67,
    skills: 14
  },
  {
    name: 'Rahul Mehta',
    role: '2nd Year, AKTU Lucknow',
    target: 'Cybersecurity Analyst',
    quote: 'The company specifically said they filter for Unfoldd verified candidates. That badge on my portfolio opened doors I never thought possible as a tier-3 college student.',
    rating: 5,
    streak: 45,
    skills: 9
  },
  {
    name: 'Aditya Kumar',
    role: '3rd Year, SRM Chennai',
    target: 'Data Scientist',
    quote: 'Applied to 3 internships using my Unfoldd portfolio. Got shortlisted for all 3. Converted 2 of them. This is the only platform that actually delivers results.',
    rating: 5,
    streak: 89,
    skills: 18
  },
  {
    name: 'Sneha Patel',
    role: '4th Year, NIT Surat',
    target: 'DevOps Engineer',
    quote: 'I was about to give up on getting placed. Unfoldd gave me a clear daily plan and by day 45 I had my first interview. By day 90 I had an offer.',
    rating: 5,
    streak: 90,
    skills: 22
  },
  {
    name: 'Arjun Singh',
    role: '2nd Year, Amity University',
    target: 'SDE',
    quote: 'The anti-skip videos forced me to actually learn. The tests after each video made sure I retained it. First time in my life I actually finished what I started.',
    rating: 5,
    streak: 34,
    skills: 11
  }
]

export default function TestimonialsSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden bg-[#0A0A0F]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
            ⭐ Student Stories
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
            Real Results From{' '}
            <span style={{ background: 'linear-gradient(135deg, #FFD700, #FF6B6B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Real Students
            </span>
          </h2>
        </div>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={32}
          slidesPerView={1}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={true}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          className="pb-16 px-4"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i} className="h-auto">
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-br from-[#12121A] to-[#0A0A0F] border border-white/10 hover:border-yellow-500/30 rounded-[2.5rem] p-8 flex flex-col transition-all duration-500 cursor-default shadow-2xl relative group"
              >
                <div className="absolute inset-0 rounded-[2.5rem] bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, j) => <span key={j} className="text-yellow-400 text-lg">★</span>)}
                </div>

                <p className="text-white/80 text-base leading-relaxed flex-1 mb-8 font-medium italic relative">
                  <span className="absolute -top-4 -left-2 text-4xl text-white/10 font-serif">&quot;</span>
                  {t.quote}
                  <span className="absolute -bottom-4 right-0 text-4xl text-white/10 font-serif">&quot;</span>
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between group-hover:border-orange-500/30 transition-colors">
                    <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Streak</span>
                    <span className="text-orange-400 font-black flex items-center gap-1"><span className="text-lg leading-none">🔥</span> {t.streak}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center justify-between group-hover:border-green-400/30 transition-colors">
                    <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Verified</span>
                    <span className="text-green-400 font-black flex items-center gap-1"><span className="text-lg leading-none">✅</span> {t.skills}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg flex-shrink-0 shadow-lg border border-white/10" style={{ background: `hsl(${i * 60 + 200}, 70%, 50%)` }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-white font-bold text-base tracking-tight">{t.name}</div>
                    <div className="text-white/40 text-xs font-medium mb-0.5">{t.role}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{t.target}</div>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
