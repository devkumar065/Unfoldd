'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, IndianRupee, MapPin, Clock, Trash2, Edit3, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export function JobPostingManager({ initialPostings, companyId }) {
  const [postings, setPostings] = useState(initialPostings)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    role: '',
    description: '',
    required_skills: [],
    location: '',
    is_remote: true,
    stipend_min: 15000,
    stipend_max: 25000,
    duration_months: 3,
    deadline: ''
  })

  const handleCreate = async () => {
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase.from('internships').insert({
        ...formData,
        company_name: 'Your Company', // In real app, derived from company record
        posted_by_admin: companyId,
        is_active: true
      }).select().single()

      if (error) throw error
      setPostings([data, ...postings])
      toast.success('Internship posted successfully!')
      setShowModal(false)
    } catch(e) {
      toast.error(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('internships').delete().eq('id', id)
    if (!error) {
      setPostings(postings.filter(p => p.id !== id))
      toast.success('Posting deleted')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Job Postings</h2>
          <p className="text-sm text-text-secondary">Manage and track your active internship opportunities.</p>
        </div>
        <Button onClick={()=>setShowModal(true)} className="bg-white text-black font-bold h-11 px-6"><Plus size={18} className="mr-2"/> Post New Internship</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {postings.map((p, i) => (
          <motion.div key={p.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: i*0.1}} className="glass p-6 rounded-[2rem] border border-border bg-card/60">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{p.role}</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center gap-1 mt-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active</span>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors"><Edit3 size={16}/></button>
                   <button onClick={()=>handleDelete(p.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-background/50 p-3 rounded-2xl border border-border">
                 <p className="text-[10px] text-text-muted font-black uppercase tracking-tighter mb-1">Applications</p>
                 <p className="text-xl font-black text-white">{p.application_count || 0}</p>
               </div>
               <div className="bg-background/50 p-3 rounded-2xl border border-border">
                 <p className="text-[10px] text-text-muted font-black uppercase tracking-tighter mb-1">Views</p>
                 <p className="text-xl font-black text-white">{p.view_count || 0}</p>
               </div>
             </div>

             <div className="flex items-center justify-between pt-4 border-t border-border">
               <div className="flex items-center gap-3 text-xs text-text-muted font-bold">
                 <span className="flex items-center gap-1"><MapPin size={14}/> {p.is_remote ? 'Remote' : p.location}</span>
                 <span className="flex items-center gap-1"><IndianRupee size={14}/> {p.stipend_min/1000}k+</span>
               </div>
               <Button variant="ghost" className="h-9 px-4 text-xs font-bold text-purple hover:text-purple-light">View Applicants &rarr;</Button>
             </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
           <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="glass relative z-10 w-full max-w-2xl bg-card rounded-[2.5rem] border border-border p-8 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-2xl font-bold text-white">Post New Internship</h2>
                <button onClick={()=>setShowModal(false)} className="p-2 hover:bg-border rounded-xl"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 hide-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase px-1">Role Title</label>
                    <input type="text" value={formData.role} onChange={e=>setFormData({...formData, role:e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:border-purple outline-none" placeholder="Frontend Developer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase px-1">Location</label>
                    <input type="text" value={formData.location} onChange={e=>setFormData({...formData, location:e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:border-purple outline-none" placeholder="e.g. Bangalore or Remote" />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-text-muted uppercase px-1">Job Description</label>
                   <textarea value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} className="w-full h-32 bg-background border border-border rounded-2xl p-4 text-sm text-white focus:border-purple outline-none resize-none" placeholder="Describe the role and your company..."></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase px-1">Stipend (Min)</label>
                      <input type="number" value={formData.stipend_min} onChange={e=>setFormData({...formData, stipend_min:e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:border-purple outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase px-1">Duration (Months)</label>
                      <input type="number" value={formData.duration_months} onChange={e=>setFormData({...formData, duration_months:e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:border-purple outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase px-1">Deadline</label>
                      <input type="date" onChange={e=>setFormData({...formData, deadline:e.target.value})} className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:border-purple outline-none [color-scheme:dark]" />
                   </div>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-border">
                 <Button size="lg" fullWidth isLoading={isSubmitting} onClick={handleCreate} className="h-14 bg-purple hover:bg-purple-light text-white font-bold text-lg border-0 shadow-lg">Publish Internship Posting</Button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  )
}
