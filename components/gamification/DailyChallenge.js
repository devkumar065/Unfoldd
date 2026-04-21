'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Trophy, Clock, ChevronRight, X, Code, Sparkles, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import Editor from '@monaco-editor/react'

export function DailyChallenge({ challenge }) {
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState('// Write your solution here\nfunction solve(input) {\n  \n}')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 2000)) // Simulate evaluation
    setIsSubmitting(false)
    toast.success('Challenge completed! +150 XP bonus earned! 🎉')
    setIsOpen(false)
  }

  if (!challenge) return null

  return (
    <>
      <motion.div 
        whileHover={{ y: -4 }}
        className="glass p-6 rounded-[2.5rem] border border-purple-500/30 bg-gradient-to-br from-purple/10 to-cyan/10 relative overflow-hidden group cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="absolute top-0 right-0 p-3 bg-purple text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl shadow-lg">Bonus</div>
        <div className="flex gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-purple text-white flex items-center justify-center shadow-[0_0_20px_rgba(108,99,255,0.4)] group-hover:scale-110 transition-transform">
             <Trophy size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-display font-black text-white mb-1">{challenge.title}</h3>
            <p className="text-sm text-text-secondary mb-4 line-clamp-2">{challenge.description}</p>
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-1.5 text-xs font-bold text-green"><Zap size={14} fill="currentColor"/> +150 XP</span>
               <span className="flex items-center gap-1.5 text-xs font-bold text-orange-500"><Clock size={14}/> 24h Left</span>
            </div>
          </div>
          <div className="self-center">
             <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-purple group-hover:border-purple transition-all">
               <ChevronRight size={20} />
             </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setIsOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
             <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="glass relative z-10 w-full max-w-5xl h-[90vh] bg-card rounded-[3rem] border border-border flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border bg-background/50 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple flex items-center justify-center text-white"><Trophy size={20}/></div>
                      <div>
                        <h2 className="text-xl font-black text-white">Daily Bonus Challenge</h2>
                        <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Difficulty: {challenge.difficulty}</p>
                      </div>
                   </div>
                   <button onClick={()=>setIsOpen(false)} className="p-2 hover:bg-border rounded-xl transition-colors"><X/></button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                   <div className="w-full md:w-1/3 p-8 overflow-y-auto border-r border-border space-y-6">
                      <h3 className="text-2xl font-display font-black text-white">{challenge.title}</h3>
                      <p className="text-text-secondary leading-relaxed">{challenge.description}</p>
                      
                      <div className="space-y-4">
                         <h4 className="text-xs font-black uppercase text-purple-light tracking-widest">Example</h4>
                         <div className="p-4 rounded-2xl bg-background border border-border font-mono text-xs space-y-2">
                            <p><span className="text-text-muted">Input:</span> {challenge.examples?.[0]?.input}</p>
                            <p><span className="text-text-muted">Output:</span> {challenge.examples?.[0]?.output}</p>
                         </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-green/5 border border-green/20">
                         <h4 className="text-green font-bold text-sm mb-1 flex items-center gap-2"><Sparkles size={16}/> Reward</h4>
                         <p className="text-sm text-text-secondary">Complete this correctly to instantly gain 150 XP and a spot on the daily highlights.</p>
                      </div>
                   </div>

                   <div className="flex-1 flex flex-col bg-[#050508]">
                      <div className="flex-1">
                        <Editor
                          height="100%"
                          language="javascript"
                          theme="vs-dark"
                          value={code}
                          onChange={setCode}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            padding: { top: 20 }
                          }}
                        />
                      </div>
                      <div className="p-6 border-t border-border bg-background/50 flex justify-between items-center">
                         <div className="text-xs text-text-muted font-medium flex items-center gap-2"><Clock size={14}/> Time limit: {challenge.time_limit_minutes}m</div>
                         <Button size="lg" isLoading={isSubmitting} onClick={handleSubmit} className="px-10 bg-white text-black font-black">
                           <Send size={18} className="mr-2"/> Submit Solution
                         </Button>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
