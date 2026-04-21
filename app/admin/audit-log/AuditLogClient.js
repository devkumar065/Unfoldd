'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Download, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

export default function AuditLogClient({ initialLogs }) {
  const [logs, setLogs] = useState(initialLogs)
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  const getActionColor = (type) => {
    switch (type) {
      case 'admin_user_update': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'admin_user_ban': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'admin_exam_approve': return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'admin_exam_reject': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'admin_skill_override': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'admin_message_sent': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
      case 'admin_setting_update': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'admin_video_add': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'admin_video_delete': return 'text-red-500 bg-red-500/10 border-red-500/20'
      default: return 'text-white/50 bg-white/5 border-white/10'
    }
  }

  const exportCSV = () => {
    if (!logs || logs.length === 0) return
    const headers = ['Timestamp', 'Admin ID', 'Admin Name', 'Action', 'Target ID', 'Target Type', 'IP Address', 'Details']
    const csvRows = logs.map(log => {
      const data = log.event_data || {}
      return [
        log.created_at,
        data.admin_id || '',
        log.profile?.full_name || '',
        log.event_type,
        data.target_id || '',
        data.target_type || '',
        data.ip || '',
        JSON.stringify(data.details || {}).replace(/"/g, '""')
      ].map(field => `"${field}"`).join(',')
    })

    const csvContent = [headers.join(','), ...csvRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `unfoldd_audit_log_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all' && log.event_type !== filterType) return false
    if (search) {
      const searchTerm = search.toLowerCase()
      const adminName = (log.profile?.full_name || '').toLowerCase()
      const eventType = log.event_type.toLowerCase()
      if (!adminName.includes(searchTerm) && !eventType.includes(searchTerm)) return false
    }
    return true
  })

  // Extract unique event types for filter dropdown
  const uniqueEventTypes = Array.from(new Set(logs.map(l => l.event_type)))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Audit Log 📝</h2>
          <p className="text-xs text-white/40 mt-1">All administrative actions are recorded here.</p>
        </div>
        <button onClick={exportCSV} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-[#0D0D16] border border-white/5 rounded-3xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
           <input 
             type="text" 
             placeholder="Search by admin name or action..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-purple-500 outline-none transition-all" 
           />
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
           <Filter size={16} className="text-white/40" />
           <select 
             value={filterType}
             onChange={(e) => setFilterType(e.target.value)}
             className="flex-1 md:w-48 bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none cursor-pointer focus:border-purple-500 transition-all"
           >
             <option value="all">All Actions</option>
             {uniqueEventTypes.map(type => (
               <option key={type} value={type}>{type.replace('admin_', '')}</option>
             ))}
           </select>
         </div>
      </div>

      <div className="bg-[#0D0D16] border border-white/5 rounded-3xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto min-h-[50vh]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30 w-12"></th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Timestamp</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Admin</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Action</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Target</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map(log => {
                const data = log.event_data || {}
                const isExpanded = expandedId === log.id

                return (
                  <React.Fragment key={log.id}>
                    <tr onClick={() => setExpandedId(isExpanded ? null : log.id)} className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${isExpanded ? 'bg-white/[0.02]' : ''}`}>
                      <td className="p-4">
                        <button className="text-white/30 hover:text-white transition-colors">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-white font-medium">{format(new Date(log.created_at), 'MMM dd, yyyy')}</div>
                        <div className="text-[10px] text-white/40 font-bold tracking-widest uppercase">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-900 to-[#0A0A0F] border border-purple-500/30 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {log.profile?.full_name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-white block">{log.profile?.full_name || 'System Admin'}</span>
                            <span className="text-[10px] text-white/40 tracking-widest font-mono">{data.admin_id?.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getActionColor(log.event_type)}`}>
                          {log.event_type.replace('admin_', '')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-white/80"><span className="text-white/40 text-xs mr-2">{data.target_type}:</span> {data.target_id?.substring(0, 12)}...</div>
                      </td>
                      <td className="p-4 text-xs font-mono text-white/40">{data.ip || 'Unknown'}</td>
                    </tr>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-[#0A0A0F]/50 border-b border-white/5"
                        >
                          <td colSpan="6" className="p-0">
                            <div className="p-6">
                              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#050508] border border-white/10">
                                <FileText className="text-white/20 mt-1 shrink-0" size={20} />
                                <div className="flex-1 w-full overflow-x-auto hide-scrollbar">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Event Details Payload</p>
                                  <pre className="text-xs text-white/70 font-mono leading-relaxed whitespace-pre-wrap break-words">
                                    {JSON.stringify(data.details, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                )
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <p className="text-white/30 font-medium">No audit logs found matching your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
