'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Play, Globe, Lock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

export default function VideoLibraryClient({ initialVideos }) {
  const [videos, setVideos] = useState(initialVideos)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)

  const filteredVideos = videos.filter(v => 
    v.topic_title.toLowerCase().includes(search.toLowerCase()) || 
    v.role.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return
    
    try {
      const { error } = await supabase.from('topic_videos').delete().eq('id', id)
      if (error) throw error
      setVideos(prev => prev.filter(v => v.id !== id))
      toast.success('Video deleted')
    } catch(e) {
      toast.error('Failed to delete video')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Video Library 🎬</h2>
          <p className="text-xs text-white/40 mt-1">Manage all lesson videos across roadmaps.</p>
        </div>
        <Button onClick={() => { setEditingVideo(null); setIsModalOpen(true); }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 rounded-xl flex items-center gap-2">
          <Plus size={18} /> Add Video
        </Button>
      </div>

      <div className="bg-[#0D0D16] border border-white/5 rounded-3xl p-4 shadow-lg flex items-center gap-4">
         <Search size={18} className="text-white/20 ml-2" />
         <input 
           type="text" 
           placeholder="Search by title or role..." 
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="bg-transparent border-none outline-none text-sm text-white w-full" 
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div key={video.id} className="bg-[#0D0D16] border border-white/5 rounded-3xl overflow-hidden group hover:border-purple-500/30 transition-all shadow-xl">
             <div className="aspect-video bg-black relative flex items-center justify-center">
                <Image src={`https://img.youtube.com/vi/${video.youtube_video_id}/mqdefault.jpg`} fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg">
                      <Play size={20} fill="currentColor" />
                   </div>
                </div>
                <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-white/70">
                   {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded bg-purple-600 text-[10px] font-black uppercase tracking-widest text-white">
                   Day {video.day_number}
                </div>
             </div>
             
             <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-white text-lg tracking-tight line-clamp-1">{video.topic_title}</h3>
                </div>
                <div className="flex items-center gap-2 mb-4">
                   <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">{video.role}</span>
                   <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{video.difficulty}</span>
                </div>
                <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-6 h-8">{video.topic_description}</p>
                
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                   <div className="flex gap-2">
                      <button onClick={() => { setEditingVideo(video); setIsModalOpen(true); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(video.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                   </div>
                   <button className="text-[10px] font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1 hover:underline">
                      View Stats <Globe size={12} />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Mock Modal for Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0D0D16] border border-white/10 rounded-[2.5rem] w-full max-w-lg p-8 relative shadow-2xl overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-cyan-500" />
               <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">{editingVideo ? 'Edit Video' : 'Add New Video'}</h2>
               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Topic Title</label>
                    <input type="text" className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500" placeholder="e.g. Introduction to React" defaultValue={editingVideo?.topic_title} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">YouTube Video ID</label>
                    <input type="text" className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500" placeholder="e.g. dQw4w9WgXcQ" defaultValue={editingVideo?.youtube_video_id} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Target Role</label>
                      <select className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white outline-none appearance-none" defaultValue={editingVideo?.role || 'fullstack'}>
                        <option value="fullstack">Full Stack</option>
                        <option value="sde">SDE</option>
                        <option value="cyber">Cybersecurity</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Day Number</label>
                      <input type="number" className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white outline-none" placeholder="1-90" defaultValue={editingVideo?.day_number} />
                    </div>
                  </div>
               </div>
               <div className="mt-8 flex gap-3">
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 text-white/40">Cancel</Button>
                  <Button onClick={() => { setIsModalOpen(false); toast.success('Action simulated'); }} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold">Save Video</Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
