'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Edit2, Trash2, Filter, ShieldCheck, Brain, 
  AlertCircle, ChevronRight, CheckCircle2, Info, Loader2, Sparkles, Code
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

export default function QuestionBank({ initialTopics, initialQuestions, selectedTestId }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [topics, setTopics] = useState(initialTopics)
  const [questions, setQuestions] = useState(initialQuestions)
  const [activeTab, setActiveTab] = useState('easy') // easy | medium | hard
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchTopic, setSearchTopic] = useState('')

  const selectedTopic = topics.find(t => t.id === selectedTestId)
  
  const filteredTopics = topics.filter(t => 
    t.topic_title.toLowerCase().includes(searchTopic.toLowerCase()) ||
    t.role.toLowerCase().includes(searchTopic.toLowerCase())
  )

  const handleTopicSelect = (id) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('testId', id)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Permanently delete this question?')) return
    try {
      const { error } = await supabase.from('test_questions').delete().eq('id', id)
      if (error) throw error
      setQuestions(prev => prev.filter(q => q.id !== id))
      toast.success('Question deleted')
    } catch(e) {
      toast.error('Deletion failed')
    }
  }

  const activeLevelQuestions = questions.filter(q => q.difficulty === activeTab)
  const poolCount = activeLevelQuestions.length
  const progressPercent = Math.min((poolCount / 5) * 100, 100)

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-160px)] animate-in fade-in duration-500">
      
      {/* Sidebar: Topic Selector */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
         <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Question Bank ❓</h2>
            <p className="text-xs text-white/40">Select a lesson to manage assessment pool.</p>
         </div>

         <div className="bg-[#0D0D16] border border-white/5 rounded-3xl p-4 shadow-lg">
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                type="text" 
                placeholder="Search topics..." 
                value={searchTopic}
                onChange={(e)=>setSearchTopic(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:border-purple-500 outline-none" 
              />
            </div>

            <div className="space-y-1 max-h-[60vh] overflow-y-auto hide-scrollbar pr-1">
               {filteredTopics.map(topic => {
                 const isActive = topic.id === selectedTestId
                 return (
                   <button
                     key={topic.id}
                     onClick={() => handleTopicSelect(topic.id)}
                     className={cn(
                       "w-full text-left p-3 rounded-xl transition-all group flex flex-col gap-1 border border-transparent",
                       isActive ? "bg-purple-600/10 border-purple-500/30 ring-1 ring-purple-500/20" : "hover:bg-white/5"
                     )}
                   >
                     <div className="flex justify-between items-start gap-2">
                        <span className={cn("text-[11px] font-bold truncate", isActive ? "text-purple-400" : "text-white/70 group-hover:text-white")}>
                          {topic.topic_title}
                        </span>
                        <span className="px-1 py-0.5 rounded bg-white/5 text-[8px] font-black uppercase text-white/20">{topic.role}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="flex gap-0.5">
                           {[1,2,3].map(i => <div key={i} className={cn("w-1 h-1 rounded-full", i <= (topic.test_questions?.[0]?.count || 0) / 5 ? "bg-purple-500" : "bg-white/10")} />)}
                        </div>
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-tighter">Day {topic.day_number}</span>
                     </div>
                   </button>
                 )
               })}
            </div>
         </div>
      </div>

      {/* Main Content: Question Editor */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {!selectedTestId ? (
            <motion.div key="none" initial={{opacity:0}} animate={{opacity:1}} className="h-full glass rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center p-12">
               <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6">
                 <HelpCircle size={40} />
               </div>
               <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No Topic Selected</h3>
               <p className="text-white/40 max-w-xs mx-auto text-sm leading-relaxed">Choose a lesson from the sidebar to view or add assessment questions.</p>
            </motion.div>
          ) : (
            <motion.div key="selected" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
               <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-card/60 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest">
                             Day {selectedTopic.day_number}
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-white/5 text-white/40 border border-white/10 text-[10px] font-black uppercase tracking-widest uppercase">
                             {selectedTopic.role}
                          </span>
                       </div>
                       <h2 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>{selectedTopic.topic_title}</h2>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-black px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
                       <Sparkles size={18} /> Auto-Generate with AI
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mt-10">
                     {['easy', 'medium', 'hard'].map(level => {
                       const count = questions.filter(q => q.difficulty === level).length
                       return (
                         <button 
                           key={level} 
                           onClick={() => setActiveTab(level)}
                           className={cn(
                             "p-4 rounded-2xl border text-left transition-all relative overflow-hidden group",
                             activeTab === level ? "bg-white/10 border-white/20 shadow-lg" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                           )}
                         >
                            {activeTab === level && <motion.div layoutId="activeLvl" className="absolute top-0 left-0 w-1 h-full bg-purple-500" />}
                            <div className="flex justify-between items-center mb-3">
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{level}</span>
                               <span className={cn("text-xs font-black", count >= 5 ? "text-green-500" : "text-yellow-500")}>{count}/5</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className={cn("h-full transition-all duration-1000", count >= 5 ? "bg-green-500" : "bg-yellow-500")} style={{ width: `${Math.min((count/5)*100, 100)}%` }} />
                            </div>
                         </button>
                       )
                     })}
                  </div>
               </div>

               {/* Questions List */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <h3 className="text-sm font-black uppercase tracking-widest text-white/30">{activeTab} Questions Pool</h3>
                     <span className="text-[10px] font-bold text-white/20 italic">Minimum 5 required per level for test activation</span>
                  </div>

                  {activeLevelQuestions.map((q, i) => (
                    <div key={q.id} className="bg-[#0D0D16] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all shadow-xl group">
                       <div className="flex justify-between items-start gap-4 mb-6">
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center gap-1.5">
                                   {q.created_by === 'ai' ? <><Brain size={12}/> AI Generated</> : <><ShieldCheck size={12}/> Admin Verified</>}
                                </span>
                                {q.is_coding && <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1.5"><Code size={12}/> Coding</span>}
                             </div>
                             <p className="text-white font-bold text-lg leading-relaxed">{q.question_text}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Edit2 size={16}/></button>
                             <button onClick={()=>handleDeleteQuestion(q.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                          {q.options.map((opt, idx) => (
                            <div key={idx} className={cn("p-4 rounded-xl border text-sm font-medium transition-all", opt === q.correct_answer ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-white/[0.02] border-white/5 text-white/40")}>
                               {opt}
                            </div>
                          ))}
                       </div>

                       <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-6">
                          <div className="flex items-center gap-6">
                             <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Times Shown</p>
                                <p className="text-white font-mono font-bold text-xs">{q.times_shown || 0}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Accuracy</p>
                                <p className={cn("font-mono font-bold text-xs", (q.correct_count / (q.times_shown || 1)) < 0.4 ? "text-red-500" : "text-green-400")}>
                                   {Math.round((q.correct_count / (q.times_shown || 1)) * 100)}%
                                </p>
                             </div>
                          </div>
                          {q.explanation && (
                            <div className="flex-1 flex gap-2 p-3 rounded-xl bg-white/[0.01] border border-white/5">
                               <Info size={14} className="text-white/20 mt-0.5 shrink-0" />
                               <p className="text-xs text-white/40 leading-relaxed italic">{q.explanation}</p>
                            </div>
                          )}
                       </div>
                    </div>
                  ))}

                  <button className="w-full py-10 rounded-[2rem] border-2 border-dashed border-white/5 hover:border-purple-500/20 hover:bg-purple-500/5 transition-all text-white/20 hover:text-purple-400 flex flex-col items-center justify-center gap-3 group">
                     <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                     </div>
                     <span className="font-black uppercase tracking-widest text-xs">Add {activeTab} Question</span>
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function HelpCircle({size}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> }
