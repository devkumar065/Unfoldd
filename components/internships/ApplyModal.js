'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle2, FileText, Globe, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

export function ApplyModal({ internship, onClose, skills }) {
  const [coverNote, setCoverNote] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleApply = async () => {
    setIsSending(true)
    try {
      const res = await fetch('/api/internships/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internshipId: internship.id,
          matchPercentage: internship.match_percentage,
          coverNote
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      toast.success('Application sent successfully! 🎉')
      onClose()
      // Refresh current page to update applied status
      window.location.reload()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setIsSending(false)
    }
  }

  const matchedSkills = internship.required_skills?.filter(req => 
    skills.some(s => s.skill_name.toLowerCase().includes(req.toLowerCase()))
  ) || []
  
  const missingSkills = internship.required_skills?.filter(req => 
    !skills.some(s => s.skill_name.toLowerCase().includes(req.toLowerCase()))
  ) || []

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass relative z-10 w-full max-w-xl bg-card rounded-3xl border border-border overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-border flex items-center justify-between bg-background/50">
          <div>
            <h2 className="text-xl font-bold text-white">Apply to {internship.company_name} 🚀</h2>
            <p className="text-xs text-text-muted mt-1">{internship.role}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-border rounded-lg transition-colors text-text-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">What gets sent:</h3>
            
            {/* Portfolio Preview */}
            <div className="p-4 rounded-2xl bg-purple/5 border border-purple/20 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple/10 rounded-lg text-purple">
                  <Globe size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Your Public Portfolio</p>
                  <p className="text-xs text-text-muted">Verified skills & achievements</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-green flex items-center gap-1"><CheckCircle2 size={12}/> Auto-attached</span>
            </div>

            {/* Resume Preview */}
            <div className="p-4 rounded-2xl bg-cyan/5 border border-cyan/20 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan/10 rounded-lg text-cyan">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">ATS-Optimized Resume</p>
                  <p className="text-xs text-text-muted">Latest updated version</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-green flex items-center gap-1"><CheckCircle2 size={12}/> Auto-attached</span>
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Your Match Profile:</h3>
             <div className="flex items-center gap-4">
               <div className="h-2 flex-1 bg-background rounded-full overflow-hidden border border-border">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${internship.match_percentage}%` }}
                    className="h-full bg-gradient-to-r from-purple to-cyan"
                  />
               </div>
               <span className="text-lg font-black text-white">{internship.match_percentage}%</span>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <p className="text-[10px] font-bold text-green uppercase">Skills you have</p>
                 <div className="flex flex-wrap gap-1">
                   {matchedSkills.map(s => <span key={s} className="text-[9px] px-1.5 py-0.5 bg-green/10 text-green rounded border border-green/20">{s}</span>)}
                 </div>
               </div>
               <div className="space-y-2">
                 <p className="text-[10px] font-bold text-orange-500 uppercase">Missing skills</p>
                 <div className="flex flex-wrap gap-1">
                    {missingSkills.map(s => <span key={s} className="text-[9px] px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded border border-orange-500/20">{s}</span>)}
                 </div>
               </div>
             </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-white">Cover Note (Optional)</label>
              <span className="text-[10px] text-text-muted font-mono">{coverNote.length}/200</span>
            </div>
            <textarea 
              maxLength={200}
              placeholder="Why are you a good fit for this role?"
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              className="w-full h-24 bg-background border border-border rounded-2xl p-4 text-sm text-white focus:border-purple outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        <div className="p-6 bg-background/50 border-t border-border">
          <Button 
            fullWidth 
            size="lg" 
            isLoading={isSending}
            onClick={handleApply}
            className="h-14 bg-gradient-to-r from-purple to-purple-dark text-white font-bold text-lg border-0 shadow-[0_0_30px_rgba(108,99,255,0.3)] group"
          >
            Send Application <Send size={20} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
