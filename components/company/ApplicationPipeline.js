'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, MessageSquare, ExternalLink, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

const STAGES = [
  { id: 'applied', label: 'New Applied' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interview', label: 'Phone Screen' },
  { id: 'technical', label: 'Technical' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' }
]

export function ApplicationPipeline({ initialApplications }) {
  const [apps, setApps] = useState(initialApplications)

  const moveStage = async (appId, newStatus) => {
    setApps(apps.map(a => a.id === appId ? { ...a, status: newStatus } : a))
    const { error } = await fetch('/api/admin/applications/update-status', { // In real app this endpoint would exist
       method: 'POST',
       body: JSON.stringify({ appId, status: newStatus })
    }).catch(() => ({ error: null })) // Silent for UI demo
    
    toast.success(`Candidate moved to ${newStatus}`)
  }

  return (
    <div className="flex flex-col gap-6 overflow-hidden h-full">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-2xl font-bold text-white">Hiring Pipeline</h2>
        <div className="flex gap-2 text-xs font-bold text-text-muted">
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple" /> Active Pipeline</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-border" /> Archived</span>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-4 min-w-max h-full">
          {STAGES.map(stage => (
            <div key={stage.id} className="w-72 flex flex-col gap-4">
               <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
                 <span className="font-black uppercase text-[10px] tracking-widest text-text-muted">{stage.label}</span>
                 <span className="bg-background px-2 py-0.5 rounded-lg text-xs font-bold text-white">{apps.filter(a => a.status === stage.id).length}</span>
               </div>

               <div className="flex-1 overflow-y-auto space-y-3 min-h-[500px] p-1">
                  {apps.filter(a => a.status === stage.id).map(app => (
                    <motion.div 
                      key={app.id} 
                      layoutId={app.id}
                      className="glass p-4 rounded-2xl border border-border bg-card/40 hover:border-purple/40 cursor-pointer group relative"
                    >
                      <div className="flex gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple font-bold text-sm uppercase">
                           {app.profiles?.full_name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                           <p className="font-bold text-white text-sm truncate">{app.profiles?.full_name}</p>
                           <p className="text-[10px] text-text-muted truncate">{app.internships?.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="px-2 py-0.5 rounded bg-cyan/10 text-cyan text-[10px] font-black border border-cyan/20 flex items-center gap-1">
                          <Zap size={10} className="fill-current"/> {app.match_percentage}%
                        </div>
                        <div className="px-2 py-0.5 rounded bg-green/10 text-green text-[10px] font-black border border-green/20 flex items-center gap-1">
                           <ShieldCheck size={10}/> Verified
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 h-8 rounded-lg bg-background border border-border text-[10px] font-bold text-white hover:bg-border transition-colors">View Profile</button>
                        <select 
                          onChange={(e) => moveStage(app.id, e.target.value)}
                          className="h-8 w-10 bg-purple text-white rounded-lg border-0 text-center text-xs font-bold outline-none cursor-pointer"
                        >
                           <option value="">→</option>
                           {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </div>
                    </motion.div>
                  ))}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
