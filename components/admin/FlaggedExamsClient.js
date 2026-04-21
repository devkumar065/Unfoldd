'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle2, XCircle, Eye, Activity, ShieldAlert } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

export default function FlaggedExamsClient({ initialExams, adminId }) {
  const [exams, setExams] = useState(initialExams)
  const [filter, setFilter] = useState('pending') // all | pending | reviewed | approved | rejected

  const handleAction = async (examId, action, status) => {
    // Mock action since proctoring schema might vary
    try {
      const note = prompt(`Enter admin note for ${action.toUpperCase()}:`)
      if (note === null) return // cancelled

      // Call API or Supabase to update exam status and add admin note
      const { error } = await supabase
        .from('exams')
        .update({
          status: status,
          reviewed_by_admin: true,
          admin_note: note
        })
        .eq('id', examId)

      if (error) throw error

      toast.success(`Exam ${action} successfully.`)
      setExams(prev => prev.map(e => e.id === examId ? { ...e, status, reviewed_by_admin: true, admin_note: note } : e))
    } catch(e) {
      toast.error('Failed to update exam')
    }
  }

  const handleBulkApprove = async () => {
    const cleanExams = filteredExams.filter(e => e.proctoring_flag_count < 3 && e.score >= 70 && !e.reviewed_by_admin)
    if (cleanExams.length === 0) {
      toast.info('No clean exams to batch approve.')
      return
    }

    if (!confirm(`Approve ${cleanExams.length} clean exams?`)) return

    try {
      // For each, update status
      await Promise.all(cleanExams.map(exam => 
        supabase.from('exams').update({ status: 'passed', reviewed_by_admin: true, admin_note: 'Bulk auto-approved by admin' }).eq('id', exam.id)
      ))

      toast.success(`Batch approved ${cleanExams.length} exams.`)
      // Optimistic update
      setExams(prev => prev.map(e => cleanExams.find(c => c.id === e.id) ? { ...e, status: 'passed', reviewed_by_admin: true, admin_note: 'Bulk auto-approved by admin' } : e))
    } catch(e) {
      toast.error('Bulk approve failed')
    }
  }

  const filteredExams = exams.filter(e => {
    if (filter === 'all') return true
    if (filter === 'pending') return !e.reviewed_by_admin
    if (filter === 'reviewed') return e.reviewed_by_admin
    if (filter === 'approved') return e.status === 'passed' && e.reviewed_by_admin
    if (filter === 'rejected') return e.status === 'failed' && e.reviewed_by_admin
    return true
  })

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2" style={{ fontFamily: 'Space Grotesk' }}>Flagged Exams for Review <span className="text-red-500">🔴</span></h2>
          <p className="text-white/40 text-sm">{exams.filter(e => !e.reviewed_by_admin).length} exams pending review.</p>
        </div>
        <button onClick={handleBulkApprove} className="bg-green-500 hover:bg-green-600 text-black font-black px-6 py-3 rounded-xl transition-colors shadow-[0_0_20px_rgba(0,245,160,0.2)]">
          Approve All Clean ✓
        </button>
      </div>

      <div className="flex bg-[#0D0D16] border border-white/5 rounded-2xl p-1.5 overflow-x-auto hide-scrollbar shadow-lg">
        {['all', 'pending', 'reviewed', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0 capitalize",
              filter === tab ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {filteredExams.map((exam, i) => (
            <motion.div 
              key={exam.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#0D0D16] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl"
            >
              {/* Header */}
              <div className={cn("p-6 border-b flex items-center justify-between", exam.reviewed_by_admin ? "border-white/5 bg-white/[0.02]" : "border-red-500/20 bg-red-500/5")}>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center font-bold text-white shrink-0">
                    {exam.profile?.avatar_url ? <Image src={exam.profile.avatar_url} alt={`${exam.profile?.full_name}'s avatar`} fill className="object-cover"/> : exam.profile?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg tracking-tight">{exam.profile?.full_name || 'Unknown Student'}</h3>
                    <div className="text-xs font-bold text-white/50 uppercase tracking-widest">{exam.skills?.skill_name || 'Unknown Topic'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white">{exam.score || 0}%</div>
                  <div className={cn("text-[10px] font-black uppercase tracking-widest", exam.proctoring_flag_count > 3 ? "text-red-500" : "text-yellow-500")}>
                    ⚠️ {exam.proctoring_flag_count} Violations
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Summary */}
                 <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Violation Summary</h4>
                    <div className="space-y-2">
                       {/* Mock chart bars for UI */}
                       {[
                         { label: 'Tab Switches', count: Math.ceil(exam.proctoring_flag_count * 0.5), color: 'bg-yellow-500' },
                         { label: 'Face Missing', count: Math.floor(exam.proctoring_flag_count * 0.3), color: 'bg-red-500' },
                         { label: 'Multiple Faces', count: 0, color: 'bg-red-600' },
                         { label: 'Fullscreen Exits', count: Math.floor(exam.proctoring_flag_count * 0.2), color: 'bg-orange-500' },
                       ].map((v, idx) => (
                         <div key={idx} className="flex items-center gap-3">
                           <span className="text-xs text-white/60 w-28 shrink-0">{v.label}</span>
                           <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                             <div className={cn("h-full rounded-full", v.color)} style={{ width: `${Math.min((v.count / (exam.proctoring_flag_count || 1)) * 100, 100)}%` }} />
                           </div>
                           <span className="text-xs font-bold text-white w-4 text-right">{v.count}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Timeline */}
                 <div className="space-y-4 border-l border-white/5 pl-8 relative">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Event Timeline</h4>
                    <div className="space-y-4">
                       <div className="relative pl-4 border-l border-white/10 pb-4">
                          <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-green-500" />
                          <div className="text-[10px] text-white/40 font-bold tracking-widest mb-1">00:00</div>
                          <div className="text-sm text-white font-medium">Exam Started</div>
                       </div>
                       <div className="relative pl-4 border-l border-white/10 pb-4">
                          <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="text-[10px] text-white/40 font-bold tracking-widest mb-1">04:12</div>
                          <div className="text-sm text-yellow-500 font-bold">Warning: Tab Switched</div>
                       </div>
                       <div className="relative pl-4 border-l border-white/10">
                          <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-red-500" />
                          <div className="text-[10px] text-white/40 font-bold tracking-widest mb-1">08:45</div>
                          <div className="text-sm text-red-400 font-bold">Critical: Face Missing</div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-white/5 bg-[#0A0A0F]/50 flex flex-col sm:flex-row gap-4">
                 {exam.reviewed_by_admin ? (
                   <div className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <span className="text-xs text-white/40 uppercase tracking-widest font-black block mb-1">Admin Decision</span>
                        <span className={cn("font-bold text-sm", exam.status === 'passed' ? "text-green-500" : "text-red-500")}>
                          {exam.status === 'passed' ? 'APPROVED - Marked as Passed' : 'REJECTED - Marked as Failed'}
                        </span>
                        {exam.admin_note && <p className="text-xs text-white/50 mt-2 italic">Note: &quot;{exam.admin_note}&quot;</p>}
                      </div>
                      <ShieldAlert className="text-white/20" size={32} />
                   </div>
                 ) : (
                   <>
                     <button onClick={() => handleAction(exam.id, 'approve', 'passed')} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-2 bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-black transition-all">
                       <CheckCircle2 size={24} /> Approve (Pass)
                     </button>
                     <button onClick={() => handleAction(exam.id, 'reject', 'failed')} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                       <XCircle size={24} /> Reject (Fail)
                     </button>
                     <button onClick={() => handleAction(exam.id, 'monitor', exam.status)} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-2 bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white transition-all">
                       <Eye size={24} /> Monitor (No Change)
                     </button>
                   </>
                 )}
              </div>
            </motion.div>
          ))}
          {filteredExams.length === 0 && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-16 text-center bg-[#0D0D16] border border-white/5 rounded-[2rem] shadow-lg">
              <Activity className="mx-auto text-white/20 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">All Caught Up!</h3>
              <p className="text-white/50">No exams match the current filter.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
