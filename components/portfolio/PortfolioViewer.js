'use client'

import { motion } from 'framer-motion'
import { Code, Briefcase, MessageCircle, Globe, MapPin, CheckCircle2, ShieldAlert, Calendar, Flame, User, Mail, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

const LOGO_URL = "https://srklrlzewvozsvebzgvm.supabase.co/storage/v1/object/public/avatars/icon.png"

export function PortfolioViewer({ portfolio, profile, skills = [], badges = [], roadmap }) {
  const template = portfolio?.template_id || 'minimal'
  const isPremium = profile?.is_premium

  const activeTemplate = (!isPremium && ['glassmorphism', 'terminal'].includes(template)) ? 'minimal' : template

  const verifiedSkills = skills.filter(s => s.is_verified)
  const otherSkills = skills.filter(s => !s.is_verified && s.is_learned)

  const BADGE_ICONS = {
    'first_mission': '🎯', 'first_verified': '✅', 'streak_7': '🔥', 'streak_30': '💎',
    'streak_60': '👑', 'streak_90': '🚀', 'first_application': '📩', 'top_learner': '⭐'
  }

  if (activeTemplate === 'terminal') {
    return <TerminalTemplate {...{portfolio, profile, verifiedSkills, otherSkills, badges, roadmap, BADGE_ICONS}} />
  }

  if (activeTemplate === 'glassmorphism') {
    return <GlassmorphismTemplate {...{portfolio, profile, verifiedSkills, otherSkills, badges, roadmap, BADGE_ICONS}} />
  }

  return <MinimalTemplate {...{portfolio, profile, verifiedSkills, otherSkills, badges, roadmap, BADGE_ICONS}} />
}

function MinimalTemplate({ portfolio, profile, verifiedSkills, otherSkills, badges, roadmap, BADGE_ICONS }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-20">
      <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-2 border-border shrink-0 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple to-cyan flex items-center justify-center text-5xl font-black text-white uppercase">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tight mb-2">{profile?.full_name}</h1>
            <p className="text-xl md:text-2xl text-purple-light font-bold tracking-tight">{profile?.target_role}</p>
          </div>
          <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">{portfolio?.bio || portfolio?.tagline}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
            {profile?.college && (
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <GraduationCap size={14} className="text-purple" /> {profile.college}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
               <Calendar size={14} className="text-cyan" /> {profile.year} Year
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
          <a href={`mailto:${profile?.email}`} className="bg-white text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-center hover:bg-purple hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-purple/30 group">
            Hire Me <Mail size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
          <div className="flex gap-2 justify-center md:justify-between">
            {portfolio?.github_url && <SocialLink href={portfolio.github_url} icon={Code} />}
            {portfolio?.linkedin_url && <SocialLink href={portfolio.linkedin_url} icon={Briefcase} />}
            {portfolio?.twitter_url && <SocialLink href={portfolio.twitter_url} icon={MessageCircle} />}
            {portfolio?.website_url && <SocialLink href={portfolio.website_url} icon={Globe} />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Day Streak" value={profile?.streak_count || 0} icon="🔥" color="text-orange-500" />
        <StatCard label="Verified Skills" value={verifiedSkills.length} icon="✅" color="text-green" />
        <StatCard label="Total Expertise" value={verifiedSkills.length + otherSkills.length} icon="📚" color="text-purple" />
      </div>

      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-display font-black text-white">Verified Skills</h2>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Official Certifications</span>
        </div>
        {verifiedSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {verifiedSkills.map(s => (
              <div key={s.id} className="p-6 rounded-[2rem] bg-card border border-border hover:border-purple/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green/5 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-green/10 transition-colors" />
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-purple/10 text-purple-light border border-purple/20">{s.category}</span>
                  <div className="p-2 rounded-xl bg-green/10 text-green border border-green/20">
                    <CheckCircle2 size={16}/>
                  </div>
                </div>
                <h3 className="font-bold text-white text-xl mb-1 relative z-10">{s.skill_name}</h3>
                <p className="text-xs text-text-muted font-bold uppercase tracking-tighter relative z-10">Level: {s.proficiency_level}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-text-muted italic bg-white/5 p-8 rounded-[2rem] text-center border border-dashed border-border">No verified skills yet. Coming soon.</p>}
      </section>

      <section className="space-y-8">
        <div className="flex items-end justify-between">
           <h2 className="text-3xl font-display font-black text-white">Featured Projects</h2>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Practical Experience</span>
        </div>
        {portfolio?.projects && portfolio.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {portfolio.projects.map((p, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] bg-card/40 border border-border hover:border-purple/30 transition-all flex flex-col h-full group">
                <h3 className="text-2xl font-display font-bold text-white mb-3 group-hover:text-purple-light transition-colors">{p.title}</h3>
                <p className="text-text-secondary leading-relaxed mb-8 flex-1">{p.description}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {p.tech_stack?.map((t, j) => <span key={j} className="text-[10px] font-black uppercase px-2.5 py-1 bg-background border border-border rounded-lg text-text-muted tracking-tight">{t}</span>)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {p.github_link && <a href={p.github_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs font-bold text-white bg-background border border-border py-3 rounded-xl hover:bg-border transition-colors"><Code size={16}/> Code</a>}
                  {p.live_link && <a href={p.live_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs font-bold text-white bg-purple py-3 rounded-xl hover:bg-purple-light transition-colors shadow-lg shadow-purple/20"><Globe size={16}/> Demo</a>}
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-text-muted italic bg-white/5 p-8 rounded-[2rem] text-center border border-dashed border-border">Ongoing development in progress.</p>}
      </section>

      <div className="pt-20 border-t border-border flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
           {badges.slice(0, 5).map(b => (
             <div key={b.id} title={b.badge_type} className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-xl grayscale hover:grayscale-0 hover:scale-110 transition-all cursor-help">
               {BADGE_ICONS[b.badge_type] || '🏅'}
             </div>
           ))}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">Verified by</p>
          <Image src={LOGO_URL} width={16} height={16} alt="Unfoldd" className="object-contain" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-white">Unfoldd</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="p-6 rounded-[2rem] bg-card border border-border flex flex-col items-center text-center group hover:border-purple/20 transition-all">
      <span className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">{icon}</span>
      <p className={cn("text-3xl font-display font-black mb-1", color)}>{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{label}</p>
    </div>
  )
}

function GlassmorphismTemplate(props) {
  return <div className="bg-[#050508]"><MinimalTemplate {...props} /></div>
}

function TerminalTemplate({ portfolio, profile, verifiedSkills, otherSkills, badges, roadmap, BADGE_ICONS }) {
  return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-12 font-mono text-[#00FF41]">
      <div className="max-w-4xl mx-auto border border-[#00FF41]/30 p-8 md:p-12 rounded-2xl bg-black/50 shadow-[0_0_50px_rgba(0,255,65,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF41]/50 to-transparent" />
        
        <div className="flex justify-between items-center border-b border-[#00FF41]/20 pb-6 mb-10">
          <div className="flex gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <span className="text-[10px] font-bold tracking-widest opacity-50 uppercase">Session: Authenticated (guest)</span>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <p className="text-white/40 flex items-center gap-2"><span className="text-[#00FF41]">$</span> whoami</p>
            <div className="pl-6 border-l-2 border-[#00FF41]/10">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 uppercase tracking-tighter">{profile?.full_name}</h1>
              <p className="text-lg opacity-80 mb-4">{profile?.target_role} @ {profile?.college}</p>
              <p className="text-[#00FF41]/70 leading-relaxed max-w-2xl">{portfolio?.bio || portfolio?.tagline}</p>
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-white/40 flex items-center gap-2"><span className="text-[#00FF41]">$</span> fetch --stats</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-6">
              {[
                { l: 'STREAK', v: profile?.streak_count },
                { l: 'XP', v: profile?.xp_points },
                { l: 'VERIFIED', v: verifiedSkills.length },
                { l: 'SKILLS', v: verifiedSkills.length + otherSkills.length }
              ].map((s, i) => (
                <div key={i} className="border border-[#00FF41]/20 bg-[#00FF41]/5 p-4 rounded-lg">
                   <p className="text-[10px] opacity-50 mb-1">{s.l}</p>
                   <p className="text-xl font-bold">{s.v}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-white/40 flex items-center gap-2"><span className="text-[#00FF41]">$</span> ls -R ./projects</p>
            <div className="space-y-6 pl-6">
              {portfolio?.projects?.map((p, i) => (
                <div key={i} className="border border-[#00FF41]/10 p-6 rounded-xl hover:bg-[#00FF41]/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    <span className="text-xl font-bold uppercase tracking-tight text-white">{p.title}</span>
                    <div className="flex gap-4 text-[10px] font-bold">
                       {p.github_link && <a href={p.github_link} className="text-[#00FF41] hover:bg-[#00FF41] hover:text-black px-2 py-1 rounded transition-all border border-[#00FF41]/30">SRC_CODE</a>}
                       {p.live_link && <a href={p.live_link} className="text-[#00FF41] hover:bg-[#00FF41] hover:text-black px-2 py-1 rounded transition-all border border-[#00FF41]/30">EXECUTE</a>}
                    </div>
                  </div>
                  <p className="opacity-70 text-sm mb-4 leading-relaxed">{p.description}</p>
                  <div className="flex flex-wrap gap-2">
                     {p.tech_stack?.map((s, idx) => <span key={idx} className="text-[9px] border border-[#00FF41]/20 px-2 py-0.5 rounded uppercase">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <section className="pt-10 flex flex-col md:flex-row gap-6 opacity-60 border-t border-[#00FF41]/10">
            <div className="flex items-center gap-2 text-xs">
               <span className="text-[#00FF41]">$</span> contact --email: <a href={`mailto:${profile?.email}`} className="hover:underline text-white font-bold">{profile?.email}</a>
            </div>
            <div className="flex-1 md:text-right text-[10px] font-bold tracking-widest uppercase">
              Build Version: 2.0.4-verified
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function SocialLink({ href, icon: Icon, glass }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={cn("p-3 rounded-2xl transition-all flex items-center justify-center", glass ? "bg-white/5 border border-white/10 hover:bg-white/10 text-white" : "bg-card border border-border text-text-secondary hover:text-white hover:border-purple/50 shadow-sm")}>
      <Icon size={18} />
    </a>
  )
}