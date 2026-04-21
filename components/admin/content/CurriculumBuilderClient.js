'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Play, FileQuestion, CheckCircle2, XCircle, Search, Edit2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

export default function CurriculumBuilderClient({ initialData }) {
  const [activeRole, setActiveRole] = useState('fullstack')
  const [search, setSearch] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)

  const roles = [
    { id: 'fullstack', name: 'Full Stack Development' },
    { id: 'sde', name: 'Software Engineering (SDE)' },
    { id: 'cybersecurity', name: 'Cybersecurity' },
    { id: 'data_science', name: 'Data Science' },
    { id: 'devops', name: 'DevOps & Cloud' },
    { id: 'uiux', name: 'UI/UX Design' }
  ]

  // Construct a full 90-day grid based on fetched data
  const roleData = initialData[activeRole] || []
  
  const curriculumGrid = Array.from({ length: 90 }, (_, i) => {
    const dayData = roleData.find(v => v.day_number === i + 1)
    const hasVideo = !!dayData?.youtube_video_id
    const hasQuestions = (dayData?.topic_tests?.[0]?.test_questions?.[0]?.count || 0) >= 15
    
    return {
      day: i + 1,
      topic: dayData?.topic_title || `Unplanned Topic (Day ${i + 1})`,
      hasVideo,
      hasQuestions,
      isComplete: hasVideo && hasQuestions,
      data: dayData
    }
  }).filter(d => d.topic.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-160px)] animate-in fade-in duration-500">
      
      {/* Left: Role Selection & Grid */}
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Curriculum Builder 🗺️</h2>
          <p className="text-xs text-white/40 mt-1">Design the 90-day learning path for each career track.</p>
        </div>

        <div className="flex bg-[#0D0D16] border border-white/5 rounded-2xl p-1.5 overflow-x-auto hide-scrollbar shadow-lg w-max max-w-full">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => { setActiveRole(role.id); setSelectedDay(null); }}
              className={cn(
                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 whitespace-nowrap",
                activeRole === role.id ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {role.name}
            </button>
          ))}
        </div>

        <div className="bg-[#0D0D16] border border-white/5 rounded-3xl p-4 shadow-lg flex items-center gap-4">
           <Search size={16} className="text-white/20 ml-2" />
           <input 
             type="text" 
             placeholder={`Search days in ${roles.find(r => r.id === activeRole)?.name}...`}
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="bg-transparent border-none outline-none text-xs font-bold text-white w-full" 
           />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 pb-20">
           {curriculumGrid.map((cell) => (
             <button
               key={cell.day}
               onClick={() => setSelectedDay(cell)}
               className={cn(
                 "p-3 rounded-2xl border text-left flex flex-col h-24 transition-all relative group",
                 selectedDay?.day === cell.day 
                   ? "bg-purple-600/20 border-purple-500/50 shadow-[0_0_20px_rgba(108,99,255,0.3)] ring-1 ring-purple-500/30" 
                   : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/5",
                 !cell.data && "opacity-50 hover:opacity-100 border-dashed"
               )}
             >
               <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 group-hover:text-white/50 transition-colors">Day {cell.day}</span>
               <span className="text-[10px] font-bold text-white leading-tight line-clamp-2 mb-auto group-hover:text-purple-300 transition-colors">{cell.topic}</span>
               
               <div className="flex gap-1.5 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className={cn("w-4 h-4 rounded flex items-center justify-center", cell.hasVideo ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-white/20")} title="Video Module">
                    <Play size={8} fill="currentColor" />
                  </div>
                  <div className={cn("w-4 h-4 rounded flex items-center justify-center", cell.hasQuestions ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white/20")} title="Question Pool">
                    <FileQuestion size={8} />
                  </div>
               </div>
               
               <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center bg-[#0D0D16]">
                 {cell.isComplete ? <CheckCircle2 size={12} className="text-green-500 bg-green-500/10 rounded-full" /> : <XCircle size={12} className="text-red-500 bg-red-500/10 rounded-full" />}
               </div>
             </button>
           ))}
        </div>
      </div>

      {/* Right: Day Editor Panel */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div 
            key="editor" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }} 
            className="w-full lg:w-96 shrink-0 space-y-6 sticky top-24 h-max"
          >
            <div className="bg-[#0D0D16] border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-900 to-[#0A0A0F] border border-purple-500/30 flex items-center justify-center font-black text-white text-lg shadow-inner">
                     {selectedDay.day}
                   </div>
                   <div className="text-[10px] font-black uppercase text-white/40 tracking-widest leading-tight">
                     Day Plan<br/><span className="text-purple-400">{activeRole}</span>
                   </div>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white transition-colors">
                  <XCircle size={16} />
                </button>
              </div>

              <div className="space-y-5 relative z-10">
                 <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Topic Override</label>
                   <input 
                     type="text" 
                     className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-purple-500 outline-none" 
                     defaultValue={selectedDay.topic}
                   />
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Linked Video</label>
                   {selectedDay.hasVideo ? (
                     <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                       <div className="flex items-center gap-3">
                          <Play size={14} className="text-purple-400" />
                          <span className="text-xs font-bold text-white truncate max-w-[180px]">{selectedDay.data.topic_title}</span>
                       </div>
                       <button className="text-[10px] font-black text-white/40 hover:text-white uppercase">Change</button>
                     </div>
                   ) : (
                     <button className="w-full py-3 rounded-xl border border-dashed border-white/20 text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                       <Play size={12} /> Assign Video
                     </button>
                   )}
                 </div>

                 <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white/60 flex items-center gap-2"><FileQuestion size={14} className="text-cyan-400"/> Assessment Pool</span>
                      <span className={cn("font-black", selectedDay.hasQuestions ? "text-green-500" : "text-yellow-500")}>
                        {selectedDay.data?.topic_tests?.[0]?.test_questions?.[0]?.count || 0}/15
                      </span>
                    </div>
                    {!selectedDay.hasQuestions && (
                      <p className="text-[10px] text-white/40 italic">Minimum 15 questions required (5 per difficulty level) to unlock the daily exam.</p>
                    )}
                 </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                 <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                   <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                   <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest leading-relaxed">
                     Saving changes will instantly update the curriculum for all students actively tracking this role.
                   </p>
                 </div>
                 <Button fullWidth className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black h-12 shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:shadow-purple-500/50 transition-all rounded-xl">
                    Save Day {selectedDay.day} Plan
                 </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
