'use client'

import { motion } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { cn } from '@/lib/utils/cn'

export function ATSScore({ score, targetRole }) {
  const color = score >= 86 ? '#00F5A0' : score >= 71 ? '#F59E0B' : score >= 51 ? '#EAB308' : '#EF4444'
  const label = score >= 86 ? 'Excellent' : score >= 71 ? 'Good' : score >= 51 ? 'Fair' : 'Needs Work'

  return (
    <div className="glass p-6 rounded-[2rem] border border-border bg-card/60 shadow-lg flex items-center gap-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple/5 blur-3xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-purple/10" />
      
      <div className="w-20 h-20 shrink-0 font-display font-black relative z-10">
        <CircularProgressbar 
          value={score} 
          text={`${score}%`} 
          styles={buildStyles({
            textSize: '24px',
            pathColor: color,
            textColor: '#FFF',
            trailColor: 'rgba(255,255,255,0.05)',
            pathTransitionDuration: 1
          })}
        />
      </div>
      
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Compatibility</p>
        <h3 className="text-xl font-display font-black text-white mb-2 leading-none">ATS Score</h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border shadow-sm transition-all" style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}30` }}>
            {label}
          </span>
          <span className="text-[10px] font-bold text-text-muted">for {targetRole || 'Tech'} roles</span>
        </div>
      </div>
    </div>
  )
}
