'use client'

import { motion } from 'framer-motion'
import { getThumbnailUrl } from '@/lib/youtube/utils'
import { PlayCircle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

import Image from 'next/image'

export function WatchHistoryCard({ videoProgress, video, mission }) {
  const router = useRouter()
  if (!video || !mission) return null
  
  const thumbUrl = getThumbnailUrl(video.youtube_video_id, 'hq')
  const pct = videoProgress?.completion_percentage || 0
  const isComplete = videoProgress?.completed

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/missions/${mission.day_number}/video`)}
      className="glass rounded-2xl overflow-hidden border border-border bg-card cursor-pointer group"
    >
      <div className="relative w-full aspect-video bg-black overflow-hidden">
        <Image src={thumbUrl} alt={video.topic_title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
          <PlayCircle size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-border">
          <div className="h-full bg-purple" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-purple-light transition-colors">{video.topic_title}</h4>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold px-2 py-1 rounded bg-background border border-border text-text-muted flex items-center gap-1">
            {isComplete ? <><CheckCircle2 size={12} className="text-green" /> Complete</> : <><PlayCircle size={12} /> {pct}%</>}
          </span>
          <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
            {videoProgress?.last_watched_at ? formatDistanceToNow(new Date(videoProgress.last_watched_at), { addSuffix: true }) : 'Never'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
