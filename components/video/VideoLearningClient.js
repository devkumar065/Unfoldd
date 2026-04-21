'use client'

import { useState } from 'react'
import { VideoPlayer } from './VideoPlayer'
import { TopicInfoPanel } from './TopicInfoPanel'
import { VideoProgressBar } from './VideoProgressBar'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { BrainCircuit } from 'lucide-react'

export function VideoLearningClient({ mission, video, existingProgress, dayNumber }) {
  const router = useRouter()
  const [watchedSeconds, setWatchedSeconds] = useState(existingProgress?.watched_seconds || 0)
  const [totalSeconds, setTotalSeconds] = useState(existingProgress?.total_seconds || 1)
  const [isCompleted, setIsCompleted] = useState(existingProgress?.completed || false)

  const handleProgress = (current, total) => {
    setWatchedSeconds(current)
    if (total > 0) setTotalSeconds(total)
  }

  const handleComplete = async () => {
    setIsCompleted(true)
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-4xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 md:p-16 rounded-[3rem] border border-border text-center w-full relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple via-cyan to-purple animate-gradient-x" />
          <div className="w-24 h-24 bg-purple/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <BrainCircuit size={48} className="text-purple" />
          </div>
          <h2 className="text-4xl font-display font-black text-white mb-6 tracking-tight">Interactive Lesson Mode</h2>
          <p className="text-text-secondary text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
            The video component for <span className="text-white font-bold">Day {dayNumber}</span> is being finalized. You can skip the video and jump straight into the <span className="text-purple-light font-bold">AI Skill Assessment</span> to verify your current knowledge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => router.push(`/missions/${dayNumber}/test`)} className="bg-gradient-to-r from-purple to-cyan text-white font-black px-12 h-16 rounded-2xl text-xl shadow-[0_0_30px_rgba(108,99,255,0.4)] hover:shadow-purple/60 transition-all hover:scale-105 active:scale-95 group">
              Start Skill Test <span className="group-hover:translate-x-2 transition-transform ml-2">&rarr;</span>
            </Button>
          </div>
          <p className="mt-8 text-xs text-text-muted font-bold uppercase tracking-widest">Unlocks next mission upon completion</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto pt-6">
      <div className="w-full lg:w-[68%] flex flex-col gap-6">
        <div className="glass rounded-3xl overflow-hidden border border-border shadow-xl bg-card">
          <VideoPlayer 
            videoId={video.youtube_video_id}
            startAt={existingProgress?.watched_seconds || 0}
            missionId={mission?.id}
            onProgress={handleProgress}
            onComplete={handleComplete}
          />
          <div className="p-6 border-t border-border">
            <h1 className="text-2xl font-bold text-white mb-2">{video.topic_title}</h1>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">{video.topic_description}</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[32%] flex flex-col gap-6">
        <div className="sticky top-6 flex flex-col gap-6">
          <div className="glass p-6 rounded-3xl border border-border bg-card shadow-lg">
            <VideoProgressBar 
              watchedSeconds={watchedSeconds} 
              totalSeconds={totalSeconds} 
              isCompleted={isCompleted} 
            />
          </div>
          <TopicInfoPanel 
            mission={mission} 
            video={video} 
            isVideoCompleted={isCompleted} 
            dayNumber={dayNumber}
          />
        </div>
      </div>
    </div>
  )
}
