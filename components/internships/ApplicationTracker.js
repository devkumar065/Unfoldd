'use client'

import { motion } from 'framer-motion'
import { ExternalLink, CheckCircle2, Eye, MapPin, Building2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

export function ApplicationTracker({ applications = [] }) {
  const stats = {
    total: applications.length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    responseRate: applications.length > 0 ? Math.round((applications.filter(a => a.status !== 'applied').length / applications.length) * 100) : 0
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'applied': return 'bg-white/5 text-text-muted border-white/10'
      case 'viewed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'shortlisted': return 'bg-green/10 text-green border-green/20'
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'hired': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.3)]'
      default: return 'bg-white/5 text-text-muted border-white/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="glass p-4 rounded-2xl border border-border bg-card/40 flex flex-col items-center text-center">
           <p className="text-2xl font-bold text-white mb-1">{stats.total}</p>
           <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Total Applications</p>
         </div>
         <div className="glass p-4 rounded-2xl border border-border bg-card/40 flex flex-col items-center text-center">
           <p className="text-2xl font-bold text-green mb-1">{stats.shortlisted}</p>
           <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Shortlisted</p>
         </div>
         <div className="glass p-4 rounded-2xl border border-border bg-card/40 flex flex-col items-center text-center">
           <p className="text-2xl font-bold text-cyan mb-1">{stats.responseRate}%</p>
           <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Response Rate</p>
         </div>
      </div>

      <div className="glass rounded-3xl border border-border bg-card/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/80 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Internship</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Applied On</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Match</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-secondary text-sm">
                     You haven&apos;t applied to any internships yet.
                  </td>
                </tr>
              ) : (
                applications.map((app, i) => (
                  <motion.tr 
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center font-bold text-purple-light text-xs shrink-0 uppercase">
                          {app.internships?.company_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{app.internships?.role}</p>
                          <p className="text-xs text-text-muted truncate">{app.internships?.company_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-secondary font-medium">
                      {format(new Date(app.applied_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-cyan bg-cyan/5 px-2 py-0.5 rounded border border-cyan/20">
                        {app.match_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border shadow-sm", getStatusStyle(app.status))}>
                         {app.status === 'viewed' ? 'Viewed by company 👁️' : 
                          app.status === 'shortlisted' ? 'Shortlisted 🎯' : 
                          app.status === 'hired' ? 'Hired! 🎉' :
                          app.status === 'rejected' ? 'Not Selected' : 'Applied'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-4">
                        <a href={`/internships/${app.internship_id}`} className="text-xs font-bold text-purple hover:text-purple-light transition-colors flex items-center gap-1">
                          View <ExternalLink size={14}/>
                        </a>
                        {app.status === 'applied' && (
                          <button className="text-text-muted hover:text-red-500 transition-colors">
                            <Trash2 size={16}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
