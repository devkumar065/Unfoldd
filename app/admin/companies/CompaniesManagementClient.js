'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Building2, Globe, ExternalLink, ShieldCheck, Mail, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export default function CompaniesManagementClient({ initialCompanies }) {
  const [companies, setCompanies] = useState(initialCompanies)
  const [search, setSearch] = useState('')

  const filtered = companies.filter(c => 
    c.company_name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Hiring Partners 🏢</h2>
          <p className="text-xs text-white/40 mt-1">Manage registered companies and their hiring limits.</p>
        </div>
        <Button className="bg-white text-black font-black px-6 rounded-xl flex items-center gap-2">
          <Plus size={18} /> Invite Company
        </Button>
      </div>

      <div className="bg-[#0D0D16] border border-white/5 rounded-3xl p-4 shadow-lg flex items-center gap-4">
         <Search size={18} className="text-white/20 ml-2" />
         <input 
           type="text" 
           placeholder="Search companies..." 
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="bg-transparent border-none outline-none text-sm text-white w-full" 
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((co) => (
          <div key={co.id} className="bg-[#0D0D16] border border-white/5 rounded-3xl p-6 hover:border-purple-500/30 transition-all shadow-xl group">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-xl font-bold shadow-inner">
                   {co.company_name[0]}
                </div>
                <div>
                   <h3 className="font-bold text-white tracking-tight group-hover:text-purple-400 transition-colors">{co.company_name}</h3>
                   <div className="flex items-center gap-1.5 mt-1 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                      <Globe size={12}/> {co.website?.replace('https://', '')}
                   </div>
                </div>
             </div>

             <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Plan</span>
                   <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border", co.plan === 'growth' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : co.plan === 'starter' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-white/5 text-white/30 border-white/10")}>
                     {co.plan}
                   </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Job Postings</span>
                   <span className="text-xs font-bold text-white">{co.internships?.length || 0} active</span>
                </div>
                <div className="flex justify-between items-center py-2">
                   <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Views Left</span>
                   <span className="text-xs font-mono font-bold text-green-400">{co.profile_views_remaining?.toLocaleString()}</span>
                </div>
             </div>

             <div className="flex gap-3">
                <button className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest transition-all">Manage Limits</button>
                <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"><ExternalLink size={16}/></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
