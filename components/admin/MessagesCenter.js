'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, User, Users, Zap, Mail, Bell, Smartphone, Send, Clock, Eye, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils/cn'

export default function MessagesCenter({ initialMessages, stats }) {
  const [messages, setMessages] = useState(initialMessages)
  const [activeFilter, setActiveFilter] = useState('all') // all | inapp | email | push

  const [compose, setCompose] = useState({
    recipientType: 'all',
    recipientValue: '',
    subject: '',
    body: '',
    sendVia: ['inapp'],
    schedule: 'now'
  })

  const [isSending, setIsSending] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSend = async () => {
    setIsSending(true)
    setShowConfirm(false)
    try {
      const res = await fetch('/api/admin/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType: compose.recipientType,
          recipientIds: compose.recipientType === 'role' || compose.recipientType === 'activity' ? [compose.recipientValue] : compose.recipientType === 'specific' ? [compose.recipientValue] : [],
          subject: compose.subject,
          messageBody: compose.body,
          sendVia: compose.sendVia,
          scheduledFor: compose.schedule === 'now' ? null : compose.schedule
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')

      toast.success(`Sent to ${data.sentCount} users!`)
      
      // Optimistic add to history
      setMessages(prev => [{
        id: data.messageId || Math.random().toString(),
        subject: compose.subject,
        recipient_type: compose.recipientType,
        send_via: compose.sendVia,
        recipient_count: data.sentCount,
        sent_at: new Date().toISOString(),
        message_body: compose.body
      }, ...prev])

      // Reset
      setCompose(prev => ({ ...prev, subject: '', body: '' }))
    } catch(e) {
      toast.error(e.message)
    } finally {
      setIsSending(false)
    }
  }

  const toggleChannel = (channel) => {
    setCompose(prev => {
      const isSelected = prev.sendVia.includes(channel)
      if (isSelected && prev.sendVia.length === 1) return prev // keep at least one
      return {
        ...prev,
        sendVia: isSelected ? prev.sendVia.filter(c => c !== channel) : [...prev.sendVia, channel]
      }
    })
  }

  const filteredMessages = messages.filter(m => activeFilter === 'all' || m.send_via?.includes(activeFilter))

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 min-h-[calc(100vh-160px)] pb-20">
      
      {/* LEFT PANEL: COMPOSE */}
      <div className="w-full lg:w-[45%] flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Send Message ✉️</h2>
          <p className="text-xs text-white/40 mt-1">Broadcast to students via multiple channels.</p>
        </div>

        <div className="bg-[#0D0D16] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex-1">
           <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
           
           <div className="space-y-8 relative z-10">
              {/* STEP 1 */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between border-b border-white/5 pb-2">
                   <h3 className="text-xs font-black uppercase tracking-widest text-purple-400">1. Select Recipients</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <RecipientCard 
                      icon={Globe} title="All Users" desc={`${stats.totalUsers} total`} 
                      selected={compose.recipientType === 'all'} 
                      onClick={() => setCompose(p => ({...p, recipientType: 'all'}))} 
                    />
                    <RecipientCard 
                      icon={User} title="Specific User" desc="Search by email" 
                      selected={compose.recipientType === 'specific'} 
                      onClick={() => setCompose(p => ({...p, recipientType: 'specific'}))} 
                    />
                    <RecipientCard 
                      icon={Users} title="By Role" desc="Target career track" 
                      selected={compose.recipientType === 'role'} 
                      onClick={() => setCompose(p => ({...p, recipientType: 'role', recipientValue: 'fullstack'}))} 
                    />
                    <RecipientCard 
                      icon={Zap} title="By Activity" desc="Streaks & Premium" 
                      selected={compose.recipientType === 'activity'} 
                      onClick={() => setCompose(p => ({...p, recipientType: 'activity', recipientValue: 'active_streak'}))} 
                    />
                 </div>

                 {compose.recipientType === 'specific' && (
                   <input type="text" placeholder="Enter user email or ID..." value={compose.recipientValue} onChange={e=>setCompose(p=>({...p, recipientValue: e.target.value}))} className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-purple-500 outline-none" />
                 )}
                 {compose.recipientType === 'role' && (
                   <select value={compose.recipientValue} onChange={e=>setCompose(p=>({...p, recipientValue: e.target.value}))} className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-purple-500 outline-none">
                     <option value="fullstack">Full Stack Developer</option>
                     <option value="sde">SDE</option>
                     <option value="cybersecurity">Cybersecurity</option>
                   </select>
                 )}
                 {compose.recipientType === 'activity' && (
                   <select value={compose.recipientValue} onChange={e=>setCompose(p=>({...p, recipientValue: e.target.value}))} className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-purple-500 outline-none">
                     <option value="active_streak">Active Streak (&gt;7 days)</option>
                     <option value="inactive">Inactive (No login 7 days)</option>
                     <option value="premium">Premium Users Only</option>
                     <option value="free">Free Users Only</option>
                   </select>
                 )}
              </div>

              {/* STEP 2 */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between border-b border-white/5 pb-2">
                   <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400">2. Compose Message</h3>
                 </div>
                 <div className="space-y-3">
                   <input 
                     type="text" placeholder="Subject line..." 
                     value={compose.subject} onChange={e=>setCompose(p=>({...p, subject: e.target.value}))}
                     className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:border-cyan-500 outline-none" 
                   />
                   <div className="relative">
                     <textarea 
                       placeholder="Enter your message here..." rows={6} maxLength={500}
                       value={compose.body} onChange={e=>setCompose(p=>({...p, body: e.target.value}))}
                       className="w-full bg-[#050508] border border-white/10 rounded-xl p-4 text-sm text-white/80 focus:border-cyan-500 outline-none resize-none leading-relaxed" 
                     />
                     <div className="absolute bottom-3 right-3 text-[10px] text-white/30 font-mono">{compose.body.length}/500</div>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={()=>setCompose(p=>({...p, body: p.body + '{{name}}'}))} className="px-2 py-1 rounded bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">+ Name</button>
                     <button onClick={()=>setCompose(p=>({...p, body: p.body + '{{streak}}'}))} className="px-2 py-1 rounded bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">+ Streak</button>
                     <button onClick={()=>setCompose(p=>({...p, body: p.body + '{{target_role}}'}))} className="px-2 py-1 rounded bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">+ Role</button>
                   </div>
                 </div>
              </div>

              {/* STEP 3 */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between border-b border-white/5 pb-2">
                   <h3 className="text-xs font-black uppercase tracking-widest text-green-400">3. Delivery Channels</h3>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer bg-white/[0.02] border-white/5 hover:border-white/20">
                      <input type="checkbox" checked={compose.sendVia.includes('inapp')} onChange={()=>toggleChannel('inapp')} className="accent-green-500 w-4 h-4" />
                      <Bell size={16} className={compose.sendVia.includes('inapp') ? 'text-green-500' : 'text-white/40'} />
                      <div className="flex-1 text-sm font-medium text-white/80">In-App Notification</div>
                      <span className="text-[9px] font-bold uppercase text-white/30">Instant</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer bg-white/[0.02] border-white/5 hover:border-white/20">
                      <input type="checkbox" checked={compose.sendVia.includes('email')} onChange={()=>toggleChannel('email')} className="accent-green-500 w-4 h-4" />
                      <Mail size={16} className={compose.sendVia.includes('email') ? 'text-green-500' : 'text-white/40'} />
                      <div className="flex-1 text-sm font-medium text-white/80">Email Blast</div>
                      <span className="text-[9px] font-bold uppercase text-white/30 text-green-500">Configured</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer bg-white/[0.02] border-white/5 hover:border-white/20">
                      <input type="checkbox" checked={compose.sendVia.includes('push')} onChange={()=>toggleChannel('push')} className="accent-green-500 w-4 h-4" />
                      <Smartphone size={16} className={compose.sendVia.includes('push') ? 'text-green-500' : 'text-white/40'} />
                      <div className="flex-1 text-sm font-medium text-white/80">Push Notification</div>
                      <span className="text-[9px] font-bold uppercase text-white/30 text-green-500">Configured</span>
                    </label>
                 </div>
              </div>

              <Button 
                fullWidth 
                size="lg" 
                onClick={() => setShowConfirm(true)}
                disabled={!compose.subject || !compose.body}
                className="h-14 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(108,99,255,0.3)] hover:shadow-[0_0_40px_rgba(108,99,255,0.5)] transition-all"
              >
                Review & Send &rarr;
              </Button>
           </div>
        </div>
      </div>

      {/* RIGHT PANEL: HISTORY */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Sent Messages 📬</h2>
          <div className="flex bg-[#0D0D16] border border-white/5 rounded-xl p-1">
             {['all', 'inapp', 'email', 'push'].map(tab => (
               <button key={tab} onClick={()=>setActiveFilter(tab)} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeFilter === tab ? "bg-white/10 text-white" : "text-white/40 hover:text-white")}>
                 {tab}
               </button>
             ))}
          </div>
        </div>

        <div className="flex-1 bg-[#0D0D16] border border-white/5 rounded-[2.5rem] shadow-2xl p-6 overflow-y-auto hide-scrollbar relative">
           <div className="space-y-4">
              {filteredMessages.map(msg => (
                <div key={msg.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors group">
                   <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1 pr-4">
                         <h3 className="font-bold text-white text-base truncate">{msg.subject}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">To: {msg.recipient_type}</span>
                            <span className="text-[10px] text-white/30">•</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{formatDistanceToNow(new Date(msg.sent_at), {addSuffix: true})}</span>
                         </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                         {msg.send_via?.includes('inapp') && <div className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center"><Bell size={12}/></div>}
                         {msg.send_via?.includes('email') && <div className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center"><Mail size={12}/></div>}
                         {msg.send_via?.includes('push') && <div className="w-6 h-6 rounded bg-green-500/20 text-green-400 flex items-center justify-center"><Smartphone size={12}/></div>}
                      </div>
                   </div>
                   
                   <p className="text-sm text-white/50 line-clamp-2 leading-relaxed mb-4">{msg.message_body}</p>
                   
                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex gap-4">
                         <div className="flex items-center gap-1.5 text-xs text-white/60"><Send size={14} className="text-white/30"/> {msg.recipient_count || 0} sent</div>
                         <div className="flex items-center gap-1.5 text-xs text-green-400"><Eye size={14} className="text-green-500/50"/> {Math.floor((msg.recipient_count||0) * 0.42)} opened</div>
                      </div>
                      <button className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                         Resend
                      </button>
                   </div>
                </div>
              ))}
              {filteredMessages.length === 0 && (
                <div className="text-center py-20 text-white/30 italic font-medium">No messages found for this channel.</div>
              )}
           </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowConfirm(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} className="bg-[#0D0D16] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full relative z-10 shadow-2xl">
               <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                 <AlertTriangle size={32} className="text-red-500" />
               </div>
               <h3 className="text-2xl font-black text-center text-white mb-2">Confirm Broadcast</h3>
               <p className="text-center text-white/60 text-sm mb-6 leading-relaxed">
                 You are about to send this message to <strong className="text-white">{compose.recipientType === 'all' ? stats.totalUsers : 'selected'} users</strong> via {compose.sendVia.join(', ')}.
               </p>
               <div className="bg-[#050508] border border-white/5 rounded-xl p-4 mb-8">
                  <p className="text-xs font-bold text-white mb-1">{compose.subject}</p>
                  <p className="text-xs text-white/50 line-clamp-2 italic">&quot;{compose.body}&quot;</p>
               </div>
               <div className="flex gap-3">
                  <Button variant="ghost" onClick={()=>setShowConfirm(false)} className="flex-1 text-white/40">Cancel</Button>
                  <Button isLoading={isSending} onClick={handleSend} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/20">
                     Confirm Send
                  </Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RecipientCard({ icon: Icon, title, desc, selected, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl border transition-all cursor-pointer group",
        selected ? "bg-purple-500/10 border-purple-500/30" : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/20"
      )}
    >
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors", selected ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(108,99,255,0.4)]" : "bg-white/5 text-white/40 group-hover:text-white/80")}>
         <Icon size={16} />
      </div>
      <h4 className={cn("text-sm font-bold tracking-tight mb-1", selected ? "text-purple-400" : "text-white")}>{title}</h4>
      <p className="text-[10px] font-medium text-white/40 leading-tight">{desc}</p>
    </div>
  )
}
