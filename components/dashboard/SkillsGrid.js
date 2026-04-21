'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ShieldAlert, X, Copy, QrCode, ExternalLink, Loader2, Brain } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

export function SkillsGrid({ skills = [] }) {
  const [filter, setFilter] = useState('all')
  const [examModal, setExamModal] = useState({ open: false, skill: null, link: '', expires: '', loading: false })

  const filteredSkills = skills.filter(s => {
    if (filter === 'learned') return s.is_learned && !s.is_verified
    if (filter === 'verified') return s.is_verified
    return true
  })

  const handleVerifyClick = async (skill) => {
    setExamModal({ open: true, skill, link: '', expires: '', loading: true })
    try {
      const res = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: skill.id, skillName: skill.skill_name })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setExamModal(prev => ({ ...prev, link: data.examLink, expires: data.expiresAt, loading: false }))
    } catch (error) {
      toast.error(error.message)
      setExamModal({ open: false, skill: null, link: '', expires: '', loading: false })
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(examModal.link)
    toast.success('Exam link copied!')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-white">My Skills 🧠</h3>
        <div className="flex bg-card border border-border rounded-lg p-1">
          {['all', 'learned', 'verified'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all", filter === f ? "bg-purple text-white shadow-sm" : "text-text-muted hover:text-white")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredSkills.length === 0 ? (
        <div className="glass p-12 rounded-3xl border border-border text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-purple/10 text-purple rounded-full flex items-center justify-center mb-4">
            <Brain size={32} />
          </div>
          <p className="text-white font-bold text-lg mb-1">No skills here yet</p>
          <p className="text-text-secondary text-sm">Complete daily missions to earn skills and unfold your portfolio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredSkills.map(skill => (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "glass p-5 rounded-2xl border flex flex-col bg-card",
                  skill.is_verified ? "border-green/50 shadow-[0_0_15px_rgba(0,245,160,0.1)]" : "border-border"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-purple/10 text-purple-light border border-purple/20">
                    {skill.category || 'Tech'}
                  </span>
                  {skill.is_verified ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green bg-green/10 px-2 py-1 rounded border border-green/20">
                      <CheckCircle2 size={14} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                      <ShieldAlert size={14} /> Learned
                    </span>
                  )}
                </div>
                
                <h4 className="font-bold text-lg text-white mb-auto">{skill.skill_name}</h4>
                
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-text-muted capitalize">Level: {skill.proficiency_level}</span>
                  {!skill.is_verified && (
                    <Button size="sm" variant="outline" className="h-8 text-xs px-3 border-purple text-purple hover:bg-purple hover:text-white" onClick={() => handleVerifyClick(skill)}>
                      Verify Now
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {examModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !examModal.loading && setExamModal({ open: false })} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass relative z-10 w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl p-6 md:p-8"
            >
              <button onClick={() => !examModal.loading && setExamModal({ open: false })} className="absolute top-4 right-4 text-text-muted hover:text-white"><X size={24} /></button>
              
              {examModal.loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 size={48} className="text-purple animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">Generating your exam...</h3>
                  <p className="text-sm text-text-secondary">Our AI is crafting specialized questions for {examModal.skill?.skill_name}</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green/10 text-green rounded-full flex items-center justify-center mx-auto mb-4 border border-green/20">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Your Exam is Ready!</h3>
                  <p className="text-sm text-text-secondary mb-6">Proctoring is enabled. Ensure you have a working camera.</p>

                  <div className="bg-background border border-border rounded-xl p-4 mb-6">
                    <div className="w-48 h-48 bg-white mx-auto rounded-lg mb-4 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                      <QrCode size={120} className="text-black" />
                    </div>
                    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2">
                      <input type="text" readOnly value={examModal.link} className="flex-1 bg-transparent text-xs text-text-muted outline-none px-2 truncate" />
                      <button onClick={copyLink} className="p-2 bg-purple text-white rounded hover:bg-purple-light transition-colors"><Copy size={16} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl text-center">
                      <p className="text-xs text-orange-500 font-bold uppercase mb-1">Expires In</p>
                      <p className="text-lg font-bold text-white">60 mins</p>
                    </div>
                    <div className="bg-purple/10 border border-purple/20 p-3 rounded-xl text-center">
                      <p className="text-xs text-purple-light font-bold uppercase mb-1">Questions</p>
                      <p className="text-lg font-bold text-white">10 items</p>
                    </div>
                  </div>

                  <a href={examModal.link} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full h-12 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Start Exam on Desktop <ExternalLink size={18} className="ml-2" />
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
