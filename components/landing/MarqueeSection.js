'use client'

const companies = [
  'Razorpay', 'CRED', 'Zepto', 'Meesho', 'Postman', 'Hasura', 'BrowserStack',
  'Freshworks', 'Groww', 'Netlify', 'Fractal Analytics', 'CloudSEK', 'Chargebee',
  'InMobi', 'Springworks', 'Scaler'
]

export default function MarqueeSection() {
  return (
    <div className="py-12 border-y border-white/5 overflow-hidden relative bg-[#0A0A0F]">
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#0A0A0F] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#0A0A0F] to-transparent z-10 pointer-events-none" />

      <div className="text-white/30 text-[10px] font-bold text-center mb-8 uppercase tracking-widest">
        Companies hiring on Unfoldd
      </div>

      <div className="flex gap-12 mb-6 w-max" style={{ animation: 'marquee 40s linear infinite' }}>
        {[...companies, ...companies].map((co, i) => (
          <div key={i} className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors text-sm font-bold whitespace-nowrap flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500/60" />
            {co}
          </div>
        ))}
      </div>

      <div className="flex gap-12 w-max" style={{ animation: 'marquee-reverse 35s linear infinite' }}>
        {[...companies.reverse(), ...companies].map((co, i) => (
          <div key={i} className="flex-shrink-0 text-white/30 hover:text-white/70 transition-colors text-sm font-bold whitespace-nowrap flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
            {co}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
