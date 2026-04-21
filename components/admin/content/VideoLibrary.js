'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Edit2, Trash2, Play, Globe, Lock, Shield, 
  FileInput, ChevronRight, Eye, MoreVertical, CheckCircle2, AlertTriangle, X 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'
import VideoPreviewModal from './VideoPreviewModal'

export default function VideoLibrary({ initialVideos, totalCount, coverage, currentPage, currentRole }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [videos, setVideos] = useState(initialVideos)
  const [search, setSearch] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [previewVideo, setPreviewVideo] = useState(null)
  const [editingVideo, setEditingVideo] = useState(null)

  const roles = [
    { id: 'all', name: 'All Roles' },
    { id: 'fullstack', name: 'Full Stack' },
    { id: 'sde', name: 'SDE' },
    { id: 'cybersecurity', name: 'Cyber' },
    { id: 'data_science', name: 'Data Sci' },
    { id: 'devops', name: 'DevOps' },
    { id: 'uiux', name: 'UI/UX' }
  ]

  const handleRoleChange = (roleId) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('role', roleId)
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return
    
    try {
      const { error } = await supabase.from('topic_videos').delete().eq('id', id)
      if (error) throw error
      setVideos(prev => prev.filter(v => v.id !== id))
      toast.success('Video removed from library')
    } catch(e) {
      toast.error('Failed to delete: students might have progress')
    }
  }

  const getStatus = (v) => {
    if (!v.youtube_video_id) return { label: 'Missing Video', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: X }
    const questionsCount = v.topic_tests?.[0]?.test_questions?.[0]?.count || 0
    if (questionsCount < 15) return { label: 'Needs Questions', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', icon: AlertTriangle }
    return { label: 'Ready', color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle2 }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Video Library 🎬</h2>
          <p className="text-white/40 text-sm mt-1">{totalCount} videos across all career tracks.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="border-white/10 text-white hover:bg-white/5 font-bold px-6 rounded-xl flex items-center gap-2">
            <FileInput size={18} /> Bulk Import
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-black px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20">
            <Plus size={18} /> Add Video
          </Button>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex bg-[#0D0D16] border border-white/5 rounded-[1.5rem] p-1.5 overflow-x-auto hide-scrollbar shadow-lg">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => handleRoleChange(role.id)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shrink-0 whitespace-nowrap",
              currentRole === role.id ? "bg-white/10 text-white shadow-sm" : "text-white/30 hover:text-white hover:bg-white/5"
            )}
          >
            {role.name}
            {role.id !== 'all' && (
              <span className={cn("px-1.5 py-0.5 rounded-md text-[9px] font-black", currentRole === role.id ? "bg-purple-500 text-white" : "bg-white/5 text-white/20")}>
                {coverage[role.id] || 0}/90
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0D0D16] border border-white/5 rounded-3xl p-4 shadow-lg flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
           <input 
             type="text" 
             placeholder="Search by topic title..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full bg-[#050508] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-purple-500 outline-none transition-all font-medium" 
           />
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
           <select className="bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-white/70 outline-none cursor-pointer focus:border-purple-500 transition-all shrink-0 min-w-[160px]">
             <option>All Content</option>
             <option>Has Video</option>
             <option>Missing Video</option>
           </select>
         </div>
      </div>

      {/* Video Table */}
      <div className="bg-[#0D0D16] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto min-h-[60vh]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30 w-16">Day</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Topic</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Thumbnail</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Engagement</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Assessment</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {videos.filter(v => v.topic_title.toLowerCase().includes(search.toLowerCase())).map((v) => {
                const status = getStatus(v)
                const StatusIcon = status.icon

                return (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                       <span className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-mono font-black text-sm">
                         {v.day_number}
                       </span>
                    </td>
                    <td className="p-6">
                       <div className="max-w-xs">
                          <div className="font-bold text-white text-sm tracking-tight mb-1">{v.topic_title}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-white/20">{v.role} • {v.difficulty}</div>
                       </div>
                    </td>
                    <td className="p-6">
                       <div 
                         onClick={() => setPreviewVideo(v)}
                         className="w-24 aspect-video rounded-lg bg-black border border-white/10 overflow-hidden relative cursor-pointer group/thumb shadow-lg"
                       >
                          {v.youtube_video_id ? (
                            <>
                              <Image src={`https://img.youtube.com/vi/${v.youtube_video_id}/mqdefault.jpg`} fill className="object-cover opacity-60 group-hover/thumb:opacity-40 transition-opacity" alt="" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                <Play size={16} className="text-white" fill="currentColor" />
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full text-white/10 font-black text-[10px] uppercase">No Video</div>
                          )}
                       </div>
                    </td>
                    <td className="p-6">
                       <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                             <Eye size={12}/> 1.2k views
                          </div>
                          <div className="w-24">
                             <div className="flex justify-between text-[8px] font-black text-white/30 uppercase mb-1">
                               <span>Completion</span>
                               <span>82%</span>
                             </div>
                             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: '82%' }} />
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="p-6">
                       <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                             <div className="flex gap-0.5">
                                {[1,2,3].map(i => <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i <= (v.topic_tests?.[0]?.test_questions?.[0]?.count || 0) / 5 ? "bg-purple-500" : "bg-white/10")} />)}
                             </div>
                             <span className="text-[10px] font-bold text-white/40 uppercase">MCQ Pool</span>
                          </div>
                          <button onClick={() => router.push(`/admin/content/questions?testId=${v.topic_tests?.[0]?.id}`)} className="text-[10px] font-black uppercase text-purple-400 hover:underline text-left">Manage Pool &rarr;</button>
                       </div>
                    </td>
                    <td className="p-6">
                       <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit", status.color)}>
                         <StatusIcon size={10} strokeWidth={3}/> {status.label}
                       </span>
                    </td>
                    <td className="p-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Edit2 size={16}/></button>
                          <button onClick={() => handleDelete(v.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                       </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {previewVideo && (
        <VideoPreviewModal 
          video={previewVideo} 
          onClose={() => setPreviewVideo(null)} 
        />
      )}
    </div>
  )
}
