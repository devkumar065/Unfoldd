'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Search, Plus, ExternalLink, ShieldAlert, Award, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export default function SkillsPageClient({ profile, initialSkills, roadmap }) {
  const [skills, setSkills] = useState(initialSkills)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  const verifiedSkills = skills.filter(s => s.is_verified)
  const learnedSkills = skills.filter(s => s.is_learned && !s.is_verified)
  const pendingSkills = skills.filter(s => !s.is_learned && !s.is_verified)

  const filteredSkills = skills.filter(s => {
    if (activeTab === 'verified') return s.is_verified
    if (activeTab === 'learned') return s.is_learned && !s.is_verified
    if (activeTab === 'pending') return !s.is_learned && !s.is_verified
    return true
  }).filter(s => s.skill_name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return
    const tempSkill = { id: Math.random(), skill_name: newSkill, category: 'Manual Entry', is_learned: true, is_verified: false }
    setSkills([tempSkill, ...skills])
    setShowAddModal(false)
    setNewSkill('')
    toast.success('Skill added to your profile!')
    // In a real app, send a POST request to add the skill to Supabase
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-end">
        <div>
          <h1 className="text-4xl font-display font-black text-white tracking-tight mb-2">My Skills 🧠</h1>
          <p className="text-text-secondary text-lg">Manage your expertise and verifications</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl border border-border bg-card/60 flex items-center gap-6 shadow-xl">
             <div className="text-center">
                <p className="text-2xl font-black text-green">{verifiedSkills.length}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Verified</p>
             </div>
             <div className="w-px h-8 bg-border" />
             <div className="text-center">
                <p className="text-2xl font-black text-yellow-500">{learnedSkills.length}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Learned</p>
             </div>
             <div className="w-px h-8 bg-border" />
             <div className="text-center">
                <p className="text-2xl font-black text-white">{skills.length}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total</p>
             </div>
          </div>
        </div>
      </div>

      <div className="glass p-4 rounded-[2rem] border border-border bg-card/40 flex flex-col lg:flex-row gap-4 sticky top-24 z-30 shadow-lg backdrop-blur-2xl">
        <div className="flex bg-background border border-border rounded-xl p-1 overflow-x-auto hide-scrollbar">
           {['all', 'verified', 'learned', 'pending'].map(tab => (
             <button key={tab} onClick={()=>setActiveTab(tab)} className={cn("px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all capitalize whitespace-nowrap", activeTab === tab ? "bg-purple text-white shadow-md shadow-purple/20" : "text-text-muted hover:text-white")}>
               {tab === 'verified' ? '✅ ' : ''}{tab}
             </button>
           ))}
        </div>
        <div className="relative flex-1">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
           <input type="text" placeholder="Search skills..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full bg-background border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-purple outline-none" />
        </div>
        <Button onClick={()=>setShowAddModal(true)} className="bg-white text-black font-black px-6 h-12 rounded-xl shrink-0"><Plus size={18} className="mr-2"/> Add Skill</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredSkills.map((skill, i) => (
            <motion.div 
              key={skill.id} layout initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} transition={{delay: i*0.05}}
              className={cn("p-6 rounded-[2rem] border relative overflow-hidden flex flex-col transition-all duration-300 group hover:-translate-y-1", skill.is_verified ? "glass bg-card/60 border-green/30 hover:border-green shadow-[0_0_20px_rgba(0,245,160,0.05)]" : skill.is_learned ? "glass bg-card/40 border-yellow-500/20 hover:border-yellow-500/50" : "bg-card/20 border-border/50")}
            >
               {skill.is_verified && <div className="absolute top-0 right-0 w-24 h-24 bg-green/10 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none group-hover:bg-green/20 transition-colors" />}
               
               <div className="flex justify-between items-start mb-6 relative z-10">
                 <h3 className="text-2xl font-black text-white tracking-tight">{skill.skill_name}</h3>
                 {skill.is_verified ? (
                   <div className="px-3 py-1 rounded-lg bg-green/10 text-green border border-green/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                     <CheckCircle2 size={12} strokeWidth={3}/> Verified
                   </div>
                 ) : skill.is_learned ? (
                   <div className="px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                     Learned ✓
                   </div>
                 ) : (
                   <div className="px-3 py-1 rounded-lg bg-background border border-border text-text-muted text-[10px] font-black uppercase tracking-widest">
                     Pending
                   </div>
                 )}
               </div>

               <div className="mt-auto space-y-4 relative z-10">
                 {skill.is_verified ? (
                   <div className="p-4 rounded-xl bg-background/50 border border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <Award size={14} className="text-purple" /> Unfoldd Certified
                     </div>
                     <button className="text-purple hover:text-white transition-colors"><ExternalLink size={16}/></button>
                   </div>
                 ) : skill.is_learned ? (
                   <Button fullWidth variant="outline" className="border-purple/30 text-purple-light hover:bg-purple/10 hover:border-purple transition-all h-10 font-bold text-xs uppercase tracking-widest">
                     Take Verification Exam &rarr;
                   </Button>
                 ) : (
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Unlocked at Day 45</p>
                 )}
               </div>
            </motion.div>
          ))}
          {filteredSkills.length === 0 && (
            <div className="col-span-full py-20 text-center glass rounded-[3rem] border border-border bg-card/30">
               <ShieldAlert size={48} className="mx-auto text-text-muted mb-6" />
               <h3 className="text-2xl font-black text-white mb-2">No skills found</h3>
               <p className="text-text-secondary">Try adjusting your filters or search term.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowAddModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
             <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="glass relative z-10 w-full max-w-md bg-card rounded-[2rem] border border-border p-8 shadow-2xl">
               <div className="flex justify-between items-start mb-6">
                 <h2 className="text-2xl font-black text-white">Add Custom Skill</h2>
                 <button onClick={()=>setShowAddModal(false)} className="text-text-muted hover:text-white"><X size={20}/></button>
               </div>
               <p className="text-sm text-text-secondary mb-6 leading-relaxed">Manually added skills will appear as &quot;Learned&quot; but require passing an exam to receive the Verified Badge.</p>
               <div className="space-y-4 mb-8">
                 <input autoFocus type="text" value={newSkill} onChange={e=>setNewSkill(e.target.value)} placeholder="e.g. Next.js, GraphQL, Figma..." className="w-full h-14 bg-background border border-border rounded-xl px-4 text-white focus:border-purple outline-none font-medium" />
               </div>
               <Button fullWidth size="lg" onClick={handleAddSkill} disabled={!newSkill.trim()} className="bg-purple text-white font-black h-12">Add to Profile</Button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
