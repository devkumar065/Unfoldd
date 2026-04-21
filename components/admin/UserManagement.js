'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, Filter, Download, UserCheck, Ban, Trash2, Mail, ExternalLink, ShieldCheck, MoreVertical, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

export default function UserManagementClient({ initialUsers, totalCount, currentPage, currentSearch, currentFilter, currentSort }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState(currentSearch)
  const [filter, setFilter] = useState(currentFilter)
  const [sort, setSort] = useState(currentSort)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    updateParams({ search, page: 1 })
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    updateParams({ filter: newFilter, page: 1 })
  }

  const handleSortChange = (newSort) => {
    setSort(newSort)
    updateParams({ sort: newSort, page: 1 })
  }

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(users.map(u => u.id)))
    }
  }

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return
    setIsProcessing(true)
    
    try {
      // Call appropriate bulk API or loop
      toast.success(`Action '${action}' performed on ${selectedIds.size} users.`)
      setSelectedIds(new Set())
      router.refresh()
    } catch(e) {
      toast.error('Bulk action failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const exportCSV = () => {
    if (users.length === 0) return
    const headers = ['ID', 'Name', 'Email', 'College', 'Year', 'Role', 'Streak', 'XP', 'Plan', 'Joined']
    const csvRows = users.map(u => [
      u.id,
      u.full_name || '',
      u.email || '',
      u.college || '',
      u.year || '',
      u.target_role || '',
      u.streak_count || 0,
      u.xp_points || 0,
      u.is_premium ? 'Pro' : 'Free',
      u.created_at
    ].map(field => `"${field}"`).join(','))

    const csvContent = [headers.join(','), ...csvRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `unfoldd_users_export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalPages = Math.ceil(totalCount / 50)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>User Management</h2>
          <p className="text-xs text-white/40 mt-1">{totalCount.toLocaleString()} registered students</p>
        </div>
        <button onClick={exportCSV} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-[#0D0D16] border border-white/5 rounded-3xl p-4 shadow-lg flex flex-col md:flex-row gap-4 items-center">
         <form onSubmit={handleSearch} className="relative flex-1 w-full">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
           <input 
             type="text" 
             placeholder="Search by name or email..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-purple-500 outline-none transition-all" 
           />
         </form>

         <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto hide-scrollbar">
           <select 
             value={filter}
             onChange={(e) => handleFilterChange(e.target.value)}
             className="bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none cursor-pointer focus:border-purple-500 transition-all shrink-0 min-w-[140px]"
           >
             <option value="all">All Users</option>
             <option value="active">Active (24h)</option>
             <option value="premium">Premium</option>
             <option value="banned">Banned</option>
           </select>

           <select 
             value={sort}
             onChange={(e) => handleSortChange(e.target.value)}
             className="bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none cursor-pointer focus:border-purple-500 transition-all shrink-0 min-w-[140px]"
           >
             <option value="newest">Newest First</option>
             <option value="oldest">Oldest First</option>
             <option value="most_active">Highest Streak</option>
             <option value="highest_xp">Highest XP</option>
           </select>
         </div>
      </div>

      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="text-sm font-bold text-purple-400">{selectedIds.size} users selected</div>
            <div className="flex gap-2">
              <button onClick={() => handleBulkAction('message')} disabled={isProcessing} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2"><Mail size={14}/> Message</button>
              <button onClick={() => handleBulkAction('grant_pro')} disabled={isProcessing} className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2"><ShieldCheck size={14}/> Grant Pro</button>
              <button onClick={() => handleBulkAction('ban')} disabled={isProcessing} className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2"><Ban size={14}/> Ban</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#0D0D16] border border-white/5 rounded-3xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto min-h-[50vh]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" checked={users.length > 0 && selectedIds.size === users.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-white/20 bg-background accent-purple-500 cursor-pointer" />
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">User</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Education</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Stats</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Plan</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Joined</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className={cn("hover:bg-white/[0.02] transition-colors group", selectedIds.has(u.id) && "bg-purple-500/5")}>
                  <td className="p-4 text-center">
                    <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleSelect(u.id)} className="w-4 h-4 rounded border-white/20 bg-background accent-purple-500 cursor-pointer" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-900 to-[#0A0A0F] border border-purple-500/30 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                        {u.avatar_url ? <Image src={u.avatar_url} alt={`${u.full_name}'s avatar`} fill className="object-cover" /> : u.full_name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/users/${u.id}`} className="font-bold text-sm text-white hover:text-purple-400 transition-colors truncate block">
                          {u.full_name || 'Anonymous'}
                        </Link>
                        <span className="text-xs text-white/40 truncate block">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-bold text-white/80">{u.college || '—'}</div>
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">{u.year ? `${u.year} Year` : '—'}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider">
                      <span className="text-orange-500">🔥 {u.streak_count || 0} Streak</span>
                      <span className="text-cyan-400">⚡ {u.xp_points || 0} XP</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border", u.is_premium ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-white/5 text-white/40 border-white/10")}>
                      {u.is_premium ? 'Pro' : 'Free'}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-medium text-white/40">
                    {format(new Date(u.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/users/${u.id}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="View Profile">
                         <ExternalLink size={16} />
                      </Link>
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-500 transition-colors" title="Ban User">
                         <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-10 text-center">
                    <p className="text-white/30 font-medium">No users found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-[#0A0A0F]/50">
            <div className="text-xs font-medium text-white/40">
              Showing {(currentPage - 1) * 50 + 1} to {Math.min(currentPage * 50, totalCount)} of {totalCount}
            </div>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => updateParams({ page: currentPage - 1 })}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => updateParams({ page: currentPage + 1 })}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
