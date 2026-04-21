'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Target, Zap, Shield, FileText, Activity, CreditCard,
  Ban, ShieldCheck, Mail, Calendar, Edit3, MapPin, CheckCircle2,
  XCircle, AlertTriangle, ExternalLink, Download
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

export default function UserDetailClient({ profile, missions, skills, exams, applications, payments, activity }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isBanned, setIsBanned] = useState(false) // Assuming status exists or controlled via auth
  const [isProcessing, setIsProcessing] = useState(false)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'skills', label: 'Skills', icon: Shield },
    { id: 'exams', label: 'Exams', icon: FileText, badge: exams.filter(e => e.proctoring_flag_count > 0).length },
    { id: 'applications', label: 'Applications', icon: Mail },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'activity', label: 'Activity', icon: Activity },
  ]

  const handleBanUser = async () => {
    if(!confirm("Are you sure you want to ban this user?")) return
    setIsProcessing(true)
    try {
      // Mock API call
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, updates: { status: 'banned' } })
      })
      setIsBanned(true)
      toast.success('User banned successfully')
    } catch(e) {
      toast.error('Failed to ban user')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGrantPro = async () => {
    setIsProcessing(true)
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, updates: { is_premium: true } })
      })
      toast.success('Granted Pro status')
    } catch(e) {
      toast.error('Failed to grant pro')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteUser = async () => {
    if(!confirm("DELETE ACCOUNT FOREVER? This cannot be undone.")) return
    toast.error('Delete disabled in this demo mode.')
  }

  const completedMissions = missions.filter(m => m.status === 'completed').length
  const verifiedSkills = skills.filter(s => s.is_verified).length

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-[#0D0D16] border border-white/5 p-6 md:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-purple-900 to-[#0A0A0F] border-2 border-white/10 flex items-center justify-center text-white text-3xl font-black shadow-inner overflow-hidden shrink-0">
            {profile.avatar_url ? <Image src={profile.avatar_url} alt={`${profile.full_name}'s avatar`} fill className="object-cover"/> : profile.full_name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2" style={{ fontFamily: 'Space Grotesk' }}>
              {profile.full_name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white/50">{profile.email}</span>
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest", isBanned ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                {isBanned ? 'BANNED' : 'ACTIVE'}
              </span>
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest", profile.is_premium ? "bg-purple-500/10 text-purple-400" : "bg-white/5 text-white/40")}>
                {profile.is_premium ? 'PRO' : 'FREE'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
           <button disabled={isProcessing} className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2">
             <Edit3 size={14} /> Edit User
           </button>
           {!isBanned ? (
             <button onClick={handleBanUser} disabled={isProcessing} className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold text-xs transition-colors flex items-center justify-center gap-2">
               <Ban size={14} /> Ban User
             </button>
           ) : (
             <button disabled={isProcessing} className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-500 font-bold text-xs transition-colors flex items-center justify-center gap-2">
               <CheckCircle2 size={14} /> Unban
             </button>
           )}
           <button onClick={handleDeleteUser} className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2">
             <AlertTriangle size={14} /> Delete
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#0D0D16] border border-white/5 rounded-2xl p-1.5 overflow-x-auto hide-scrollbar sticky top-20 z-20 shadow-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 whitespace-nowrap",
              activeTab === tab.id ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon size={14} /> {tab.label}
            {tab.badge > 0 && (
              <span className="w-5 h-5 rounded-md bg-red-500 text-white flex items-center justify-center text-[10px] ml-1">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[50vh]">
        <AnimatePresence mode="wait">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0D0D16] border border-white/5 rounded-3xl p-6 shadow-lg">
                   <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Profile Details</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                       <label className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-1">College/Institution</label>
                       <div className="text-sm text-white font-medium bg-white/[0.02] p-3 rounded-xl border border-white/5 flex items-center gap-2">
                         <MapPin size={14} className="text-white/40" /> {profile.college || 'Not set'}
                       </div>
                     </div>
                     <div>
                       <label className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-1">Year of Study</label>
                       <div className="text-sm text-white font-medium bg-white/[0.02] p-3 rounded-xl border border-white/5 flex items-center gap-2">
                         <Calendar size={14} className="text-white/40" /> {profile.year ? `${profile.year} Year` : 'Not set'}
                       </div>
                     </div>
                     <div className="sm:col-span-2">
                       <label className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-1">Target Role</label>
                       <div className="text-sm text-purple-400 font-bold bg-purple-500/5 p-3 rounded-xl border border-purple-500/20">
                         {profile.target_role || 'Not set'}
                       </div>
                     </div>
                     <div className="sm:col-span-2">
                       <label className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-1">Account Created</label>
                       <div className="text-sm text-white/70 font-medium">
                         {format(new Date(profile.created_at), 'MMMM do, yyyy')} ({formatDistanceToNow(new Date(profile.created_at))} ago)
                       </div>
                     </div>
                   </div>
                </div>

                <div className="bg-[#0D0D16] border border-white/5 rounded-3xl p-6 shadow-lg">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Admin Actions</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleGrantPro} className="flex-1 p-4 rounded-2xl bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 hover:border-purple-500/50 transition-colors text-left group">
                      <div className="flex items-center gap-2 text-white font-bold mb-1"><ShieldCheck size={18} className="text-cyan-400" /> Grant Premium</div>
                      <p className="text-[10px] text-white/50">Manually unlock all pro features for this user.</p>
                    </button>
                    <button className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors text-left">
                      <div className="flex items-center gap-2 text-white font-bold mb-1"><Mail size={18} className="text-white/50" /> Send System Message</div>
                      <p className="text-[10px] text-white/50">Send a direct notification to their dashboard.</p>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-[#0D0D16] border border-white/5 rounded-3xl p-6 shadow-lg">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Performance Stats</h3>
                    <div className="space-y-4">
                       <StatRow label="Current Streak" value={`🔥 ${profile.streak_count || 0} days`} color="text-orange-500" />
                       <StatRow label="XP Points" value={`⚡ ${profile.xp_points || 0}`} color="text-yellow-400" />
                       <StatRow label="Level" value={profile.level || 'Beginner'} color="text-purple-400" />
                       <div className="h-px w-full bg-white/5 my-2" />
                       <StatRow label="Missions Completed" value={`${completedMissions} / ${missions.length || 90}`} color="text-cyan-400" />
                       <StatRow label="Skills Verified" value={`${verifiedSkills} / ${skills.length}`} color="text-green-400" />
                       <StatRow label="Job Applications" value={applications.length} color="text-white" />
                    </div>
                 </div>
              </div>

            </motion.div>
          )}

          {/* MISSIONS TAB */}
          {activeTab === 'missions' && (
            <motion.div key="missions" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-[#0D0D16] border border-white/5 rounded-3xl shadow-lg overflow-hidden">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-white/5 bg-white/[0.02]">
                     <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Day</th>
                     <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Topic</th>
                     <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                     <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Tasks</th>
                     <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Completed At</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {missions.map(m => (
                     <tr key={m.id} className="hover:bg-white/[0.02]">
                       <td className="p-4 text-white/50 font-mono text-sm">{m.day_number}</td>
                       <td className="p-4 text-white font-medium text-sm">{m.topic_title}</td>
                       <td className="p-4">
                         <span className={cn("px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest", m.status === 'completed' ? "bg-green-500/10 text-green-500" : m.status.includes('progress') ? "bg-yellow-500/10 text-yellow-500" : "bg-white/5 text-white/30")}>
                           {m.status.replace('_', ' ')}
                         </span>
                       </td>
                       <td className="p-4 text-[10px] font-black tracking-widest text-white/40">
                         {m.video_completed ? 'V✓ ' : 'V- '}
                         {m.build_completed ? 'B✓ ' : 'B- '}
                         {m.apply_completed ? 'A✓' : 'A-'}
                       </td>
                       <td className="p-4 text-right text-xs text-white/50">
                         {m.completed_at ? format(new Date(m.completed_at), 'MMM d, yyyy') : '—'}
                       </td>
                     </tr>
                   ))}
                   {missions.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-white/30">No missions found.</td></tr>}
                 </tbody>
               </table>
            </motion.div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <motion.div key="skills" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {skills.map(s => (
                 <div key={s.id} className={cn("p-4 rounded-2xl border bg-[#0D0D16] relative overflow-hidden group", s.is_verified ? "border-green-500/30" : "border-yellow-500/30")}>
                   {s.is_verified && <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 blur-xl rounded-full" />}
                   <div className="flex justify-between items-start mb-3 relative z-10">
                     <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded", s.is_verified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400")}>
                       {s.is_verified ? 'Verified ✅' : 'Learned ✓'}
                     </span>
                   </div>
                   <h4 className="text-white font-bold text-sm relative z-10">{s.skill_name}</h4>
                   <div className="mt-4 pt-3 border-t border-white/5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     {!s.is_verified && <button className="flex-1 text-[10px] font-bold text-green-400 bg-green-500/10 rounded py-1 hover:bg-green-500/20">Verify</button>}
                     <button className="flex-1 text-[10px] font-bold text-red-400 bg-red-500/10 rounded py-1 hover:bg-red-500/20">Remove</button>
                   </div>
                 </div>
               ))}
               {skills.length === 0 && <div className="col-span-full p-8 text-center text-white/30 glass rounded-3xl">No skills added yet.</div>}
            </motion.div>
          )}

          {/* EXAMS TAB */}
          {activeTab === 'exams' && (
            <motion.div key="exams" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-[#0D0D16] border border-white/5 rounded-3xl shadow-lg overflow-hidden">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-white/5 bg-white/[0.02]">
                     <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Exam ID</th>
                     <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Topic</th>
                     <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Score</th>
                     <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                     <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Flags</th>
                     <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {exams.map(e => (
                     <tr key={e.id} className={cn("hover:bg-white/[0.02]", e.proctoring_flag_count > 0 && e.status !== 'passed' ? "bg-red-500/5" : "")}>
                       <td className="p-4 text-xs font-mono text-white/50">{e.exam_link_token ? e.exam_link_token.substring(0,8) : e.id.substring(0,8)}...</td>
                       <td className="p-4 text-sm font-bold text-white">{e.skills?.skill_name || 'Unknown Topic'}</td>
                       <td className="p-4 text-sm font-mono text-white">{e.score || 0}%</td>
                       <td className="p-4">
                         <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest", e.status === 'passed' ? "bg-green-500/20 text-green-400" : e.status === 'failed' ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/50")}>
                           {e.status}
                         </span>
                       </td>
                       <td className="p-4">
                         {e.proctoring_flag_count > 0 ? (
                           <span className="flex items-center gap-1 text-red-400 font-bold text-xs bg-red-500/10 px-2 py-0.5 rounded w-fit"><AlertTriangle size={12}/> {e.proctoring_flag_count} Warnings</span>
                         ) : (
                           <span className="text-green-500 text-xs font-bold">Clean</span>
                         )}
                       </td>
                       <td className="p-4 text-right">
                         <button className="text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white px-3 py-1 rounded">View Logs</button>
                       </td>
                     </tr>
                   ))}
                   {exams.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-white/30">No exams taken.</td></tr>}
                 </tbody>
               </table>
            </motion.div>
          )}

          {/* Placeholder for other tabs (Activity, Payments, Applications) */}
          {['activity', 'payments', 'applications'].includes(activeTab) && (
             <motion.div key="placeholder" initial={{opacity:0}} animate={{opacity:1}} className="p-10 text-center bg-[#0D0D16] border border-white/5 rounded-3xl text-white/40 italic">
               Detailed view for {activeTab} coming soon in subsequent updates. Check raw data in Supabase.
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function StatRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-white/60 text-sm font-medium">{label}</span>
      <span className={cn("font-bold", color)}>{value}</span>
    </div>
  )
}
