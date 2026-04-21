'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Flame, Zap, GraduationCap, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

export function Leaderboard({ userId }) {
  const [activeTab, setActiveTab] = useState('weekly')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app we'd fetch from supabase.rpc('get_weekly_leaderboard')
    const mockData = [
      { id: '1', full_name: 'Priyanka Sharma', avatar_url: null, target_role: 'fullstack', streak_count: 42, missions_this_week: 7, xp_this_week: 1250 },
      { id: '2', full_name: 'Rahul Verma', avatar_url: null, target_role: 'sde', streak_count: 28, missions_this_week: 7, xp_this_week: 1100 },
      { id: '3', full_name: 'Ananya Iyer', avatar_url: null, target_role: 'data_science', streak_count: 15, missions_this_week: 6, xp_this_week: 950 },
      { id: '4', full_name: 'Vikram Singh', avatar_url: null, target_role: 'cybersecurity', streak_count: 31, missions_this_week: 6, xp_this_week: 920 },
      { id: userId, full_name: 'You', avatar_url: null, target_role: 'sde', streak_count: 5, missions_this_week: 3, xp_this_week: 450 }
    ].sort((a,b) => b.xp_this_week - a.xp_this_week)
    
    setData(mockData)
    setLoading(false)
  }, [userId])

  return (
    <div className="glass rounded-[2.5rem] border border-border bg-card/60 overflow-hidden shadow-2xl flex flex-col h-full max-h-[800px]">
      <div className="p-8 border-b border-border bg-background/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-black text-white flex items-center gap-3">
             <Trophy className="text-yellow-500" /> Rankings
          </h2>
          <div className="flex bg-card border border-border rounded-xl p-1">
             {['weekly', 'alltime'].map(t => (
               <button key={t} onClick={()=>setActiveTab(t)} className={cn("px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all", activeTab === t ? "bg-purple text-white shadow-lg" : "text-text-muted hover:text-white")}>{t}</button>
             ))}
          </div>
        </div>
        
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-2 items-end pt-4">
           {data.slice(0,3).map((user, i) => {
             const ranks = [
               { color: 'bg-silver', order: 'order-1', h: 'h-24', medal: '🥈' },
               { color: 'bg-gold', order: 'order-2', h: 'h-32', medal: '🥇' },
               { color: 'bg-bronze', order: 'order-3', h: 'h-20', medal: '🥉' }
             ]
             const rank = ranks[i === 0 ? 1 : i === 1 ? 0 : 2]
             return (
               <div key={user.id} className={cn("flex flex-col items-center", rank.order)}>
                  <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden mb-2 relative">
                    <div className="absolute -top-1 -right-1 text-xs">{rank.medal}</div>
                    <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`} width={48} height={48} alt="avatar" />
                  </div>
                  <div className={cn("w-full rounded-t-xl bg-gradient-to-t from-white/5 to-white/10 border-x border-t border-white/10 flex flex-col items-center justify-center p-2", rank.h)}>
                    <p className="text-[10px] font-black text-white truncate w-full text-center">{user.full_name.split(' ')[0]}</p>
                    <p className="text-[10px] font-black text-purple-light">{user.xp_this_week} XP</p>
                  </div>
               </div>
             )
           })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
        {data.map((user, i) => {
          const isMe = user.id === userId
          return (
            <motion.div 
              key={user.id}
              initial={{opacity:0, x: -10}} animate={{opacity:1, x:0}} transition={{delay: i*0.05}}
              className={cn("p-4 rounded-2xl flex items-center gap-4 border transition-all", isMe ? "bg-purple/10 border-purple shadow-[0_0_20px_rgba(108,99,255,0.1)]" : "bg-background/40 border-border hover:border-white/10")}
            >
              <span className="w-6 text-xs font-black text-text-muted">#{i + 1}</span>
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border relative">
                 <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`} width={40} height={40} alt="avatar" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.full_name} {isMe && '(You)'}</p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">{user.target_role?.replace('_', ' ')}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-black text-white">{user.xp_this_week}</p>
                  <p className="text-[9px] font-bold text-text-muted uppercase">XP</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                   <Flame size={14} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
