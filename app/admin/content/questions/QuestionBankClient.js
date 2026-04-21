'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Filter, ShieldCheck, Brain, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

export default function QuestionBankClient({ initialQuestions }) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredQuestions = questions.filter(q => {
    if (activeTab === 'ai') return q.created_by === 'ai'
    if (activeTab === 'admin') return q.created_by === 'admin'
    return true
  }).filter(q => q.question_text.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
      const { error } = await supabase.from('test_questions').delete().eq('id', id)
      if (error) throw error
      setQuestions(prev => prev.filter(q => q.id !== id))
      toast.success('Question removed')
    } catch(e) {
      toast.error('Deletion failed')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Question Bank ❓</h2>
          <p className="text-xs text-white/40 mt-1">Manage MCQ and coding questions for skill tests.</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20">
          <Plus size={18} /> New Question
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
         <div className="bg-[#0D0D16] border border-white/5 rounded-3xl p-4 shadow-lg flex items-center gap-4 flex-1">
           <Search size={18} className="text-white/20 ml-2" />
           <input 
             type="text" 
             placeholder="Search questions..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="bg-transparent border-none outline-none text-sm text-white w-full" 
           />
         </div>
         <div className="flex bg-[#0D0D16] border border-white/5 rounded-2xl p-1 shadow-xl">
           {['all', 'admin', 'ai'].map(tab => (
             <button key={tab} onClick={()=>setActiveTab(tab)} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all capitalize", activeTab === tab ? "bg-cyan-600 text-white shadow-lg" : "text-text-muted hover:text-white")}>
               {tab}
             </button>
           ))}
         </div>
      </div>

      <div className="bg-[#0D0D16] border border-white/5 rounded-[2.5rem] shadow-lg overflow-hidden">
        <div className="overflow-x-auto min-h-[50vh]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Source</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Question</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Test Topic</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Difficulty</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    {q.created_by === 'ai' ? (
                      <div className="flex items-center gap-2 text-purple-400 font-black text-[10px] uppercase tracking-tighter">
                         <Brain size={14} /> AI Generated
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-tighter">
                         <ShieldCheck size={14} /> Admin Verified
                      </div>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="text-sm text-white font-medium line-clamp-2 max-w-md">{q.question_text}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-xs text-white/50">{q.topic_tests?.topic_title || 'General'}</div>
                  </td>
                  <td className="p-6">
                    <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border", q.difficulty === 'hard' ? "bg-red-500/10 text-red-500 border-red-500/20" : q.difficulty === 'medium' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-green-500/10 text-green-500 border-green-500/20")}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredQuestions.length === 0 && (
                <tr><td colSpan={5} className="p-20 text-center italic text-white/20">No questions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
