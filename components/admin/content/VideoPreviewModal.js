'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Info, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function VideoPreviewModal({ video, onClose }) {
  const videoId = video.youtube_video_id

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[#0D0D16] border border-white/10 rounded-[2.5rem] w-full max-w-6xl h-full max-h-[85vh] overflow-hidden relative shadow-2xl flex flex-col md:flex-row"
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-20 p-2 rounded-full bg-black/50 text-white/40 hover:text-white transition-colors">
          <X size={24} />
        </button>

        {/* Left: Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
              className="w-full h-full aspect-video"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-10">
               <AlertTriangle size={64} className="mx-auto text-red-500/50 mb-6" />
               <h3 className="text-2xl font-black text-white mb-2">No Video Connected</h3>
               <p className="text-white/40 max-w-xs mx-auto">This lesson topic exists but doesn&apos;t have a YouTube video ID assigned yet.</p>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-[400px] lg:w-[450px] border-l border-white/5 p-8 overflow-y-auto hide-scrollbar bg-white/[0.01]">
           <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest">
                Day {video.day_number}
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 text-white/40 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                {video.role}
              </span>
           </div>

           <h2 className="text-3xl font-black text-white tracking-tight leading-tight mb-4" style={{ fontFamily: 'Space Grotesk' }}>
             {video.topic_title}
           </h2>

           <div className="flex items-center gap-6 mb-8 py-4 border-y border-white/5">
              <div>
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Duration</p>
                 <p className="text-white font-bold">{Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}</p>
              </div>
              <div>
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Difficulty</p>
                 <p className="text-cyan-400 font-bold uppercase text-xs">{video.difficulty}</p>
              </div>
           </div>

           <div className="space-y-8">
              <section>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 flex items-center gap-2">
                   <Info size={14}/> Topic Overview
                 </h4>
                 <p className="text-sm text-white/60 leading-relaxed font-medium">
                   {video.topic_description}
                 </p>
              </section>

              {video.what_you_will_learn && (
                <section>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
                     <CheckCircle2 size={14}/> Key Learning Points
                   </h4>
                   <ul className="space-y-3">
                      {video.what_you_will_learn.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm text-white/70 font-medium">
                           <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                           {item}
                        </li>
                      ))}
                   </ul>
                </section>
              )}
           </div>

           <div className="mt-12 space-y-4">
              <Button fullWidth className="bg-white text-black font-black h-12 rounded-xl">Edit Video Details</Button>
              <Link href={`/missions/${video.day_number}/video`} target="_blank">
                <Button fullWidth variant="ghost" className="text-white/40 hover:text-white font-bold h-12 rounded-xl flex items-center gap-2">
                  View Student Experience <ExternalLink size={16}/>
                </Button>
              </Link>
           </div>
        </div>
      </motion.div>
    </div>
  )
}

function AlertTriangle({size, className}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
}
