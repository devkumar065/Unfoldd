'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Briefcase, Mail, Settings, PieChart, ShieldCheck, GraduationCap, ChevronRight, Filter, Bookmark, UserCircle, ExternalLink, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { JobPostingManager } from './JobPostingManager'
import { ApplicationPipeline } from './ApplicationPipeline'
import { PortfolioViewer } from '../portfolio/PortfolioViewer'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'

export function CompanyDashboardClient({ company, talent, postings, applications }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('talent') // talent | postings | pipeline
  const [filters, setFilters] = useState({ role: 'All', minVerified: 0 })
  const [selectedStudent, setSelectedStudent] = useState(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/company/login')
  }

  const stats = [
    { label: 'Profiles Available', value: '1,200+', icon: Users, color: 'text-purple' },
    { label: 'Active Postings', value: postings.length, icon: Briefcase, color: 'text-cyan' },
    { label: 'Applications', value: applications.length, icon: Mail, color: 'text-green' },
    { label: 'Plan', value: company.plan.toUpperCase(), icon: ShieldCheck, color: 'text-orange-500' }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-white mb-2">Welcome, {company.company_name}</h1>
          <p className="text-text-secondary">Manage your hiring pipeline and discover verified talent.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-card border border-border rounded-2xl p-1 shadow-xl">
             {[
               { id: 'talent', label: 'Find Talent', icon: Search },
               { id: 'postings', label: 'Postings', icon: Briefcase },
               { id: 'pipeline', label: 'Pipeline', icon: PieChart }
             ].map(tab => (
               <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={cn("px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all", activeTab === tab.id ? "bg-purple text-white shadow-lg" : "text-text-muted hover:text-white")}>
                 <tab.icon size={16}/> {tab.label}
               </button>
             ))}
          </div>
          <Button variant="ghost" onClick={handleSignOut} className="text-red-500 hover:bg-red-500/10 hover:text-red-600 font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2">
            <LogOut size={16} /> <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {stats.map((s, i) => (
           <div key={i} className="glass p-6 rounded-3xl border border-border bg-card/40 flex flex-col justify-between h-32">
             <s.icon className={s.color} size={20} />
             <div>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest">{s.label}</p>
             </div>
           </div>
         ))}
      </div>

      <AnimatePresence mode="wait">
         {activeTab === 'talent' && (
           <motion.div key="talent" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
              {/* Filters Sidebar */}
              <div className="space-y-8 glass p-8 rounded-[2.5rem] border border-border bg-card/40 h-fit sticky top-8">
                <div className="flex items-center gap-2 text-white font-bold mb-4 uppercase text-xs tracking-widest">
                  <Filter size={16}/> Filters
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-bold text-white">Target Role</p>
                  <div className="space-y-2">
                    {['All', 'Full Stack', 'SDE', 'Data Science', 'UI/UX'].map(r => (
                      <label key={r} className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" name="role" checked={filters.role === r} onChange={()=>setFilters({...filters, role: r})} className="w-4 h-4 border-border bg-background text-purple focus:ring-purple" />
                        <span className="text-sm text-text-secondary group-hover:text-white transition-colors">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold text-white">Min. Verified Skills</p>
                  <input type="range" min="0" max="10" value={filters.minVerified} onChange={e=>setFilters({...filters, minVerified: e.target.value})} className="w-full accent-purple" />
                  <div className="flex justify-between text-[10px] text-text-muted font-bold">
                    <span>0 SKILLS</span>
                    <span>{filters.minVerified} SKILLS</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                   <p className="text-xs text-text-muted leading-relaxed">Profiles shown are filtered by your {company.plan} plan limits.</p>
                </div>
              </div>

              {/* Talent Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
                 {talent.map(student => (
                   <motion.div key={student.id} whileHover={{y:-4}} className="glass p-6 rounded-3xl border border-border bg-card/60 hover:border-purple/30 transition-all flex flex-col h-full relative group">
                      <div className="flex gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple to-cyan flex items-center justify-center text-2xl font-bold text-white border border-white/10 shrink-0">
                          {student.full_name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                           <h3 className="font-bold text-white text-lg truncate">{student.full_name}</h3>
                           <p className="text-purple-light font-medium text-sm">{student.target_role?.toUpperCase()}</p>
                           <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold mt-1 uppercase tracking-tighter">
                             <GraduationCap size={12}/> {student.college}
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6 flex-1">
                        {(student.skills || []).filter(s => s.is_verified).slice(0, 4).map(s => (
                          <span key={s.id} className="text-[9px] font-black uppercase px-2 py-1 rounded bg-green/10 text-green border border-green/20 flex items-center gap-1">
                            <ShieldCheck size={10}/> {s.skill_name}
                          </span>
                        ))}
                        {(student.skills || []).length > 4 && <span className="text-[9px] font-bold px-2 py-1 rounded bg-white/5 text-text-muted">+{student.skills.length - 4} more</span>}
                      </div>

                      <div className="pt-4 border-t border-border flex items-center justify-between">
                         <div className="flex gap-4 text-xs font-bold text-text-muted uppercase tracking-tighter">
                            <span>🔥 {student.streak_count || 0}</span>
                            <span>⚡ {student.xp_points || 0}</span>
                         </div>
                         <Button onClick={() => setSelectedStudent(student)} size="sm" className="bg-white text-black font-bold h-9">View Profile</Button>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </motion.div>
         )}

         {activeTab === 'postings' && <JobPostingManager initialPostings={postings} companyId={company.id} />}
         {activeTab === 'pipeline' && <ApplicationPipeline initialApplications={applications} />}
      </AnimatePresence>

      {/* Student Profile Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelectedStudent(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring', damping:25, stiffness:200}} className="relative z-10 w-full max-w-5xl h-[90vh] bg-background border-x border-t border-border rounded-t-[3rem] md:rounded-[3rem] overflow-hidden flex flex-col">
               <div className="p-4 border-b border-border bg-card flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3 pl-4">
                    <UserCircle className="text-purple" />
                    <span className="font-bold text-white">Verified Candidate Profile</span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" className="h-10 text-xs">Download Resume</Button>
                    <Button className="h-10 text-xs">Invite to Interview</Button>
                    <button onClick={()=>setSelectedStudent(null)} className="p-2 hover:bg-border rounded-xl ml-4"><X size={20}/></button>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto bg-background">
                  {/* Reuse PortfolioViewer but without outer wrapper */}
                  <div className="p-8">
                     <p className="text-center text-text-muted text-sm italic mb-10">--- Portfolio Preview Start ---</p>
                     {/* In a real app we'd fetch the portfolio data for this student first */}
                     <p className="text-white text-center py-20">Full Portfolio Data for <strong>{selectedStudent.full_name}</strong> loading...</p>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function X({size}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> }
