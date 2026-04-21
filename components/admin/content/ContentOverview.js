'use client'

import { motion } from 'framer-motion'
import { Video, HelpCircle, Briefcase, Plus, FileInput, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export default function ContentOverviewClient({ stats }) {
  const roles = [
    { id: 'fullstack', name: 'Full Stack Development' },
    { id: 'sde', name: 'Software Engineering (SDE)' },
    { id: 'cybersecurity', name: 'Cybersecurity' },
    { id: 'data_science', name: 'Data Science' },
    { id: 'devops', name: 'DevOps & Cloud' },
    { id: 'uiux', name: 'UI/UX Design' }
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Content Management 🎬</h2>
        <p className="text-white/40 mt-1">Manage all platform lessons, assessments, and opportunities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Video} 
          label="Videos" 
          value={stats.videos.total} 
          subValue={`${stats.videos.missing} need links`}
          color="text-purple-500"
          warning={stats.videos.missing > 0}
        />
        <StatCard 
          icon={HelpCircle} 
          label="Questions" 
          value={stats.questions.total} 
          subValue={`${stats.questions.admin} admin · ${stats.questions.ai} AI`}
          color="text-cyan-500"
        />
        <StatCard 
          icon={Briefcase} 
          label="Internships" 
          value={stats.internships.active} 
          subValue={`${stats.internships.expiring} expiring soon`}
          color="text-green-500"
          warning={stats.internships.expiring > 0}
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Roles Ready" 
          value={`${stats.rolesCovered}/6`} 
          subValue="90-day coverage"
          color="text-yellow-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/admin/content/videos?action=add">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95">
            <Plus size={18} /> Add Video
          </Button>
        </Link>
        <Link href="/admin/content/questions?action=add">
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-12 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95">
            <Plus size={18} /> Add Questions
          </Button>
        </Link>
        <Link href="/admin/internships?action=add">
          <Button className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all active:scale-95">
            <Plus size={18} /> Post Internship
          </Button>
        </Link>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 font-bold h-12 px-6 rounded-xl flex items-center gap-2 transition-all active:scale-95">
          <FileInput size={18} /> Bulk Import
        </Button>
      </div>

      {/* Health Check */}
      <div className="bg-[#0D0D16] border border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-xl font-bold text-white tracking-tight">Curriculum Health Check</h3>
          <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-black">90-Day Roadmap Coverage</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Career Role</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Days Covered</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Progress</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {roles.map((role) => {
                const covered = stats.coverage[role.id] || 0
                const percent = Math.min((covered / 90) * 100, 100)
                const status = percent >= 100 ? 'Complete' : percent >= 66 ? 'Almost' : 'Incomplete'
                const statusColor = percent >= 100 ? 'text-green-500 bg-green-500/10 border-green-500/20' : percent >= 66 ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'

                return (
                  <tr key={role.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                       <span className="text-sm font-bold text-white">{role.name}</span>
                       <p className="text-[10px] text-white/30 font-mono mt-1 uppercase">{role.id}</p>
                    </td>
                    <td className="p-6 font-mono text-white/70">{covered}/90 days</td>
                    <td className="p-6 w-48">
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn("h-full rounded-full", percent >= 100 ? "bg-green-500" : percent >= 66 ? "bg-yellow-500" : "bg-red-500")}
                          />
                       </div>
                    </td>
                    <td className="p-6">
                       <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", statusColor)}>
                         {status}
                       </span>
                    </td>
                    <td className="p-6 text-right">
                       <Link href={`/admin/content/videos?role=${role.id}`}>
                         <button className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1 group/btn">
                           Fix Missing <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                         </button>
                       </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, subValue, color, warning }) {
  return (
    <div className="bg-[#0D0D16] border border-white/5 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-colors pointer-events-none" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${color}`}>
          <Icon size={20} />
        </div>
        {warning && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
            <AlertCircle size={12} /> Needs Link
          </div>
        )}
      </div>
      <div className="relative z-10">
        <h4 className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>{value}</h4>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">{label}</p>
        <p className="text-xs text-white/50 mt-4 font-medium">{subValue}</p>
      </div>
    </div>
  )
}
