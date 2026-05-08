'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Briefcase, Plus, Filter, Edit2, Trash2, Eye, MapPin, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

export default function InternshipsManagementClient({ initialInternships }) {
  const [internships, setInternships] = useState(initialInternships)
  const [search, setSearch] = useState('')

  const filtered = internships.filter(i => 
    i.role?.toLowerCase().includes(search.toLowerCase()) || 
    i.companies?.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active'
    try {
      const { error } = await supabase.from('internships').update({ status: newStatus }).eq('id', id)
      if (error) throw error
      setInternships(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
      toast.success(`Internship ${newStatus}`)
    } catch(e) {
      toast.error('Update failed')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Internship Postings</h2>
          <Briefcase size={24} className="text-purple-400" />
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 rounded-xl flex items-center gap-2">
          <Plus size={18} /> Add Posting
        </Button>
      </div>

      <div className="bg-[#0D0D16] border border-white/5 rounded-3xl p-4 shadow-lg flex items-center gap-4">
         <Search size={18} className="text-white/20 ml-2" />
         <input 
           type="text" 
           placeholder="Search by role or company..." 
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="bg-transparent border-none outline-none text-sm text-white w-full" 
         />
      </div>

      <div className="bg-[#0D0D16] border border-white/5 rounded-[2.5rem] shadow-lg overflow-hidden">
        <div className="overflow-x-auto min-h-[50vh]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Opportunity</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Details</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Compensation</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((i) => (
                <tr key={i.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white shrink-0">
                         {i.companies?.company_name?.[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{i.role}</div>
                        <div className="text-xs text-white/40">{i.companies?.company_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-white/70"><MapPin size={12}/> {i.location}</div>
                      <div className="flex items-center gap-2 text-xs text-white/70"><Clock size={12}/> {i.duration}</div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-bold text-green-400">₹{i.stipend?.toLocaleString()} <span className="text-[10px] text-white/20 font-normal">/mo</span></div>
                  </td>
                  <td className="p-6">
                    <button onClick={() => toggleStatus(i.id, i.status)} className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all", i.status === 'active' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                      {i.status}
                    </button>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
