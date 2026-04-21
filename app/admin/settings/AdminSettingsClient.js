'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Users, Bell, Wrench, Plus, Edit2, Trash2, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

export default function AdminSettingsClient({ currentAdmin, allAdmins }) {
  const [activeTab, setActiveTab] = useState('team')
  const [admins, setAdmins] = useState(allAdmins)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2" style={{ fontFamily: 'Space Grotesk' }}>System Settings ⚙️</h2>
          <p className="text-white/40 text-sm">Manage the admin team, platform configurations, and security.</p>
        </div>
      </div>

      <div className="flex bg-[#0D0D16] border border-white/5 rounded-2xl p-1.5 overflow-x-auto hide-scrollbar w-max shadow-lg">
        {[
          { id: 'team', label: 'Admin Team', icon: Users },
          { id: 'platform', label: 'Platform Config', icon: Wrench },
          { id: 'security', label: 'Security & Auth', icon: Shield },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0",
              activeTab === tab.id ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'team' && (
          <motion.div key="team" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-bold text-white tracking-tight">Admin Users</h3>
               <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 h-10 rounded-xl flex items-center gap-2 text-xs">
                 <Plus size={16} /> Add Team Member
               </Button>
            </div>

            <div className="bg-[#0D0D16] border border-white/5 rounded-[2.5rem] shadow-lg overflow-hidden">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-white/5 bg-white/[0.02]">
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Admin Member</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Role</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Last Login</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {admins.map(admin => (
                     <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group">
                       <td className="p-6">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-900 to-[#0A0A0F] border border-purple-500/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
                             {admin.full_name?.charAt(0)}
                           </div>
                           <div>
                             <div className="text-sm font-bold text-white">{admin.full_name}</div>
                             <div className="text-xs text-white/40">{admin.email}</div>
                           </div>
                         </div>
                       </td>
                       <td className="p-6">
                         <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", admin.role === 'superadmin' ? "bg-red-500/10 text-red-500 border-red-500/20" : admin.role === 'moderator' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-white/5 text-white/40 border-white/10")}>
                           {admin.role}
                         </span>
                       </td>
                       <td className="p-6 text-xs text-white/40 font-medium">
                         {admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
                       </td>
                       <td className="p-6 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Edit2 size={16} /></button>
                           <button disabled={admin.id === currentAdmin.id} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-colors disabled:opacity-20"><Trash2 size={16} /></button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'platform' && (
          <motion.div key="platform" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl space-y-8">
            <div className="bg-[#0D0D16] border border-white/5 rounded-3xl p-8 space-y-6 shadow-lg">
               <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Mission Configuration</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                     <div>
                        <p className="text-sm font-bold text-white">Maintenance Mode</p>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Disables all student interaction</p>
                     </div>
                     <div className="w-12 h-6 rounded-full bg-white/10 relative cursor-pointer"><div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white/30" /></div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                     <div>
                        <p className="text-sm font-bold text-white">Automatic Verification</p>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Auto-verify skills if score {'>'} 95%</p>
                     </div>
                     <div className="w-12 h-6 rounded-full bg-green-500 relative cursor-pointer shadow-[0_0_10px_rgba(34,197,94,0.5)]"><div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" /></div>
                  </div>
               </div>
               <Button fullWidth className="bg-purple-600 text-white font-bold h-12 rounded-xl mt-4">Save Platform Changes</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
