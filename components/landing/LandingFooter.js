'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function LandingFooter() {
  const LOGO_URL = "https://srklrlzewvozsvebzgvm.supabase.co/storage/v1/object/public/avatars/icon.png"

  return (
    <footer className="border-t border-white/5 bg-[#050508] pt-24 pb-12 px-6">
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-20">
          
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <Image src={LOGO_URL} width={40} height={40} alt="Unfoldd Logo" className="object-contain drop-shadow-[0_0_15px_rgba(108,99,255,0.5)]" />
              <span className="text-2xl flex items-center" style={{ fontFamily: 'Space Grotesk' }}>
                <span className="text-white font-black">Unfol</span>
                <span style={{
                  background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900
                }}>
                  dd
                </span>
              </span>
            </div>
            <p className="text-white/40 text-sm font-medium leading-relaxed max-w-sm mb-8">
              Bridging the gap between education and employment, we help students unfold their potential, one day at a time.
            </p>
            <div className="flex gap-4">
              {[
                { icon: '𝕏', href: '#' },
                { icon: 'in', href: '#' },
                { icon: '▶', href: '#' },
                { icon: '✉', href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-purple-500/20 hover:text-purple border border-white/10 hover:border-purple-500/30 flex items-center justify-center text-white/40 transition-all duration-300 text-lg font-serif">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-10">
            {[
              {
                title: 'Platform',
                links: ['Dashboard', 'Daily Missions', 'Verified Portfolio', 'Resume Builder', 'Internship Matches', 'Pricing']
              },
              {
                title: 'For Companies',
                links: ['Find Top Talent', 'Post Internships', 'Pricing Plans', 'Success Stories', 'Create Business Account']
              },
              {
                title: 'Legal & Policy',
                links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy', 'Contact Support']
              }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-black text-[10px] mb-6 uppercase tracking-[0.2em]">
                  {col.title}
                </h4>
                <ul className="space-y-4">
                  {col.links.map((link, j) => {
                    const slug = link.toLowerCase().replace(/ /g, '-')
                    const isLegal = col.title === 'Legal & Policy'
                    const href = isLegal && slug !== 'contact-support' ? `/${slug}` : '#'
                    
                    return (
                      <li key={j}>
                        <Link href={href} className="text-white/40 hover:text-white text-sm font-medium transition-colors duration-300 hover:pl-2">
                          {link}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white/30 text-[10px] font-black uppercase tracking-widest">
            © 2025 Unfoldd Technologies Pvt. Ltd.
          </div>
          <div className="text-white/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            Made with <span className="text-red-500 text-lg leading-none">❤️</span> in India 🇮🇳
          </div>
        </div>
      </div>
    </footer>
  )
}
