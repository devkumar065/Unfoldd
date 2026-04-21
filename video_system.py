import os

base = '/home/ajay/Downloads/Private/projects/Unfoldd/unfoldd'

files = {}

files['app/missions/[day]/video/page.js'] = r"""import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { VideoLearningClient } from '@/components/video/VideoLearningClient'

export const dynamic = 'force-dynamic'

export default async function VideoPage({ params }) {
  const dayNumber = parseInt(params.day, 10)
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const { data: roadmap } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .single()

  if (roadmap && dayNumber > roadmap.current_day) {
    redirect('/dashboard?error=Complete+previous+days+first')
  }

  const { data: mission } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('day_number', dayNumber)
    .single()

  let video = null
  let progress = null

  if (mission) {
    const { data: videoData } = await supabase
      .from('topic_videos')
      .select('*')
      .eq('role', profile?.target_role || '')
      .eq('day_number', dayNumber)
      .single()
      
    video = videoData || null

    if (video) {
      const { data: progressData } = await supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('video_id', video.id)
        .single()
      progress = progressData || null
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 pb-24">
      <VideoLearningClient 
        mission={mission} 
        video={video} 
        existingProgress={progress} 
        dayNumber={dayNumber} 
      />
    </div>
  )
}
""

files['components/video/VideoLearningClient.js'] = r"""'use client'

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] glass p-10 rounded-3xl border border-border text-center max-w-2xl mx-auto mt-12">
        <BrainCircuit size={64} className="text-purple mb-6" />
        <h2 className="text-3xl font-display font-bold text-white mb-4">Video Coming Soon</h2>
        <p className="text-text-secondary mb-8">
          The video lesson for Day {dayNumber} is currently being produced. You can still skip ahead to take the AI-generated test to prove your skills.
        </p>
        <Button size="lg" onClick={() => router.push(`/missions/${dayNumber}/test`)} className="bg-purple hover:bg-purple-light text-white font-bold px-8">
          Skip to Test →
        </Button>
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
"""

files['components/video/VideoPlayer.js'] = r"""'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export function VideoPlayer({ videoId, startAt = 0, missionId, onProgress, onComplete, onSkipAttempt }) {
  const playerRef = useRef(null)
  const [showSkipWarning, setShowSkipWarning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [showResumePrompt, setShowResumePrompt] = useState(startAt > 0)
  
  const lastValidTimeRef = useRef(startAt || 0)
  const isCompletedRef = useRef(false)
  const trackingIntervalRef = useRef(null)

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = initPlayer
    } else if (window.YT && window.YT.Player) {
      initPlayer()
    }

    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current)
      if (playerRef.current) {
         try {
           const t = playerRef.current.getCurrentTime()
           const d = playerRef.current.getDuration()
           if (t > 0 && d > 0) {
             saveProgressToDB(t, d, false)
           }
         } catch(e) {}
         playerRef.current.destroy()
      }
    }
  }, [])

  const initPlayer = () => {
    if (!document.getElementById('youtube-player')) return
    playerRef.current = new window.YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        start: startAt > 0 ? Math.floor(startAt) : 0
      },
      events: {
        onReady: (e) => {
          if (startAt > 0) {
             e.target.pauseVideo()
          }
        },
        onStateChange: onPlayerStateChange
      }
    })
  }

  const saveProgressToDB = async (currentTime, duration, completed = false) => {
    if (isSaving || !missionId) return
    setIsSaving(true)
    try {
      await fetch('/api/video/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          missionId,
          watchedSeconds: Math.floor(currentTime),
          totalSeconds: Math.floor(duration),
          completionPercentage: Math.floor((currentTime / duration) * 100),
          completed
        })
      })
    } catch(e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const triggerSkipWarning = () => {
    setShowSkipWarning(true)
    setTimeout(() => setShowSkipWarning(false), 2000)
    if (onSkipAttempt) onSkipAttempt()
  }

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setHasStarted(true)
      setIsPaused(false)
      setShowResumePrompt(false)
      
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current)
      
      trackingIntervalRef.current = setInterval(() => {
        if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return
        
        const currentTime = playerRef.current.getCurrentTime()
        const duration = playerRef.current.getDuration()
        
        if (currentTime > lastValidTimeRef.current + 3) {
          playerRef.current.seekTo(lastValidTimeRef.current, true)
          triggerSkipWarning()
          return
        }
        
        lastValidTimeRef.current = currentTime
        if (onProgress) onProgress(currentTime, duration)
        
        if (Math.floor(currentTime) % 5 === 0) {
          saveProgressToDB(currentTime, duration, false)
        }
        
        if (currentTime / duration >= 0.99 && !isCompletedRef.current) {
          isCompletedRef.current = true
          clearInterval(trackingIntervalRef.current)
          saveProgressToDB(duration, duration, true)
          if (onComplete) onComplete()
        }
      }, 1000)
    }
    
    if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
      setIsPaused(true)
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current)
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const t = playerRef.current.getCurrentTime()
        const d = playerRef.current.getDuration()
        if (t > 0 && d > 0) saveProgressToDB(t, d, isCompletedRef.current)
      }
      if (event.data === window.YT.PlayerState.ENDED && !isCompletedRef.current) {
         isCompletedRef.current = true
         saveProgressToDB(playerRef.current.getDuration(), playerRef.current.getDuration(), true)
         if (onComplete) onComplete()
      }
    }
  }

  const playVideo = () => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      playerRef.current.playVideo()
    }
  }

  const restartVideo = () => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(0, true)
      lastValidTimeRef.current = 0
      playerRef.current.playVideo()
      setShowResumePrompt(false)
    }
  }

  return (
    <div className="relative w-full pb-[56.25%] h-0 bg-black overflow-hidden group">
      <div id="youtube-player" className="absolute top-0 left-0 w-full h-full" />
      
      <div 
        className="absolute top-0 left-0 w-full h-[85%] z-10 cursor-default"
        onContextMenu={(e) => e.preventDefault()}
      />
      
      <AnimatePresence>
        {showSkipWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500/30 z-20 flex items-center justify-center backdrop-blur-sm"
          >
            <div className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2">
              ⚠️ You cannot skip ahead. Watch completely to unlock the test.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResumePrompt && startAt > 0 && !hasStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center backdrop-blur-sm"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Resume from where you left off?</h3>
            <div className="flex gap-4">
              <button onClick={playVideo} className="bg-purple hover:bg-purple-light text-white px-6 py-3 rounded-xl font-bold transition-colors">
                Resume ({Math.floor(startAt / 60)}:{Math.floor(startAt % 60).toString().padStart(2, '0')})
              </button>
              <button onClick={restartVideo} className="bg-card hover:bg-border border border-border text-white px-6 py-3 rounded-xl font-bold transition-colors">
                Start from beginning
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaused && !hasStarted && !showResumePrompt && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center"
          >
            <button onClick={playVideo} className="w-20 h-20 rounded-full bg-purple/90 hover:bg-purple text-white flex items-center justify-center shadow-[0_0_30px_rgba(108,99,255,0.5)] transition-transform hover:scale-110 backdrop-blur-md">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isPaused && hasStarted && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 z-20 flex items-center justify-center group-hover:bg-black/40 transition-colors cursor-pointer"
            onClick={playVideo}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
"""

files['components/video/VideoProgressBar.js'] = r"""'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { formatTime } from '@/lib/youtube/utils'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function VideoProgressBar({ watchedSeconds = 0, totalSeconds = 1, isCompleted }) {
  const { width, height } = useWindowSize()
  const pct = Math.min(100, Math.max(0, (watchedSeconds / totalSeconds) * 100))
  
  return (
    <div className="w-full flex flex-col gap-3 relative">
      {isCompleted && (
         <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
           <Confetti width={300} height={100} recycle={false} numberOfPieces={50} gravity={0.2} style={{position: 'absolute', top: '-50px'}} />
         </div>
      )}
      <div className="flex justify-between text-sm font-medium text-text-secondary">
        <span>Watched: {formatTime(watchedSeconds)}</span>
        <span>{formatTime(totalSeconds - watchedSeconds)} remaining</span>
      </div>
      
      <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border relative">
        <motion.div 
          className={cn("h-full rounded-full transition-colors duration-500", isCompleted ? "bg-green shadow-[0_0_10px_rgba(0,245,160,0.8)]" : "bg-gradient-to-r from-purple to-cyan")}
          style={{ width: `${pct}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center h-6">
        <span className="text-xs font-bold text-text-muted">{Math.floor(pct)}% complete</span>
        <AnimatePresence>
          {isCompleted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-bold text-green flex items-center gap-1 drop-shadow-[0_0_8px_rgba(0,245,160,0.5)]"
            >
              <CheckCircle2 size={14} /> Video Complete! Test is unlocked.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
"""

files['components/video/TopicInfoPanel.js'] = r"""'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Lock, CheckCircle2, ExternalLink, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { formatDuration } from '@/lib/youtube/utils'
import { cn } from '@/lib/utils/cn'

export function TopicInfoPanel({ mission, video, isVideoCompleted, dayNumber }) {
  const router = useRouter()
  const [resourcesOpen, setResourcesOpen] = useState(false)

  const handleTakeTest = async () => {
    try {
      const res = await fetch('/api/video/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id, missionId: mission.id, dayNumber })
      })
      if (!res.ok) throw new Error('Failed to unlock test')
      router.push(`/missions/${dayNumber}/test`)
    } catch(e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass p-6 rounded-3xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-purple/10 text-purple-light border border-purple/20">
            Day {dayNumber}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-background border border-border text-text-muted">
            {video.difficulty}
          </span>
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-2">{video.topic_title}</h2>
        <p className="text-sm font-medium text-text-secondary">{formatDuration(video.duration_seconds)} video</p>
      </div>

      <div className={cn("glass p-6 rounded-3xl border transition-all duration-500 flex flex-col items-center text-center", isVideoCompleted ? "border-green/50 bg-green/5 shadow-[0_0_30px_rgba(0,245,160,0.1)]" : "border-border bg-card")}>
        {!isVideoCompleted ? (
          <>
            <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-text-muted mb-4">
              <Lock size={20} />
            </div>
            <h3 className="font-bold text-white mb-1">Complete video to unlock</h3>
            <p className="text-xs text-text-secondary">You must watch 100% to take the test</p>
          </>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green/20 border border-green/30 flex items-center justify-center text-green mb-4 shadow-[0_0_15px_rgba(0,245,160,0.3)]">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-green mb-4 text-lg">Test is Ready! 🎉</h3>
            <Button fullWidth onClick={handleTakeTest} className="bg-gradient-to-r from-purple to-cyan text-white border-0 shadow-[0_0_15px_rgba(108,99,255,0.4)] animate-pulse">
              Take the Test →
            </Button>
          </motion.div>
        )}
      </div>

      {video.what_you_will_learn && video.what_you_will_learn.length > 0 && (
        <div className="glass p-6 rounded-3xl border border-border bg-card">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">What you will learn</h3>
          <ul className="space-y-3">
            {video.what_you_will_learn.map((item, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-3 text-sm text-text-secondary">
                <CheckCircle2 size={16} className="text-purple shrink-0 mt-0.5" />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      <div className="glass p-6 rounded-3xl border border-border bg-card">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Today&apos;s Tasks</h3>
        <div className="space-y-3">
          <div className="p-3 bg-background border border-border rounded-xl">
            <p className="text-xs font-bold text-blue-500 mb-1">LEARN</p>
            <p className="text-sm text-white font-medium">{mission?.learn_task?.title}</p>
          </div>
          <div className="p-3 bg-background border border-border rounded-xl">
            <p className="text-xs font-bold text-green mb-1">BUILD</p>
            <p className="text-sm text-white font-medium">{mission?.build_task?.title}</p>
          </div>
          <div className="p-3 bg-background border border-border rounded-xl">
            <p className="text-xs font-bold text-orange-500 mb-1">APPLY</p>
            <p className="text-sm text-white font-medium">{mission?.apply_task?.company}</p>
          </div>
        </div>
      </div>

      {mission?.learn_task?.resources && mission.learn_task.resources.length > 0 && (
        <div className="glass rounded-3xl border border-border bg-card overflow-hidden">
          <button onClick={() => setResourcesOpen(!resourcesOpen)} className="w-full flex items-center justify-between p-6 text-sm font-bold text-white uppercase tracking-wider">
            Additional Resources {resourcesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {resourcesOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-6 pb-6 space-y-2">
                  {mission.learn_task.resources.map((r, i) => (
                    <a key={i} href={r} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-background border border-border rounded-xl hover:border-purple transition-colors text-sm text-text-secondary hover:text-white">
                      <span className="truncate pr-4">{r}</span>
                      <ExternalLink size={14} className="shrink-0 text-text-muted" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
"""

files['lib/youtube/utils.js'] = r"""export function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/v\/)([^&\n?#]+)/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getThumbnailUrl(videoId, quality='hq') {
  if (!videoId) return '';
  const qualities = {
    'default': 'default',
    'mq': 'mqdefault',
    'hq': 'hqdefault',
    'sd': 'sddefault',
    'maxres': 'maxresdefault'
  }
  return `https://img.youtube.com/vi/${videoId}/${qualities[quality] || 'hqdefault'}.jpg`
}

export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0 min"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) return `${mins} min`
  return `${mins} min ${secs} sec`
}

export function getTimeRemaining(watchedSeconds, totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds)) return ''
  const remaining = totalSeconds - watchedSeconds
  if (remaining <= 0) return 'Complete!'
  const mins = Math.floor(remaining / 60)
  if (mins === 0) return 'Less than 1 min left'
  return `${mins} min remaining`
}
"""

files['app/api/video/progress/route.js'] = r"""import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { videoId, missionId, watchedSeconds, totalSeconds, completionPercentage, completed } = await request.json()

  const { error } = await supabase
    .from('video_progress')
    .upsert({
      user_id: user.id,
      video_id: videoId,
      mission_id: missionId,
      watched_seconds: watchedSeconds,
      total_seconds: totalSeconds,
      completion_percentage: completionPercentage,
      completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
      last_watched_at: new Date().toISOString()
    }, { 
      onConflict: 'user_id,video_id',
      ignoreDuplicates: false 
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (completed) {
    await supabase.from('daily_missions')
      .update({ video_completed: true, status: 'video_done' })
      .eq('id', missionId)
      .eq('user_id', user.id)

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'video_complete',
      event_data: { video_id: videoId, mission_id: missionId }
    })

    try {
      await supabase.rpc('increment_video_views', { vid_id: videoId })
    } catch(e) {}
  }

  return NextResponse.json({ success: true })
}
"""

files['app/api/video/complete/route.js'] = r"""import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { videoId, missionId, dayNumber } = await request.json()

  await supabase.from('video_progress')
    .update({ completed: true, completed_at: new Date().toISOString(), completion_percentage: 100 })
    .eq('user_id', user.id)
    .eq('video_id', videoId)

  await supabase.from('daily_missions')
    .update({ video_completed: true, status: 'video_done' })
    .eq('id', missionId)
    .eq('user_id', user.id)

  const { data: existingTest } = await supabase
    .from('topic_tests')
    .select('id')
    .eq('video_id', videoId)
    .single()

  if (!existingTest) {
    const { data: video } = await supabase
      .from('topic_videos')
      .select('topic_title, role, day_number')
      .eq('id', videoId)
      .single()

    if (video) {
      await supabase.from('topic_tests').insert({
        video_id: videoId,
        topic_title: video.topic_title,
        role: video.role,
        day_number: video.day_number,
        total_questions: 15,
        passing_score: 80
      })
    }
  }

  await supabase.from('notifications').insert({
    user_id: user.id,
    title: 'Video Complete! 🎉',
    body: 'Test is now unlocked. Take it to verify your skill.',
    type: 'mission',
    action_url: `/missions/${dayNumber}/test`
  })

  return NextResponse.json({ success: true, testUnlocked: true })
}
"""

files['components/video/WatchHistoryCard.js'] = r"""'use client'

import { motion } from 'framer-motion'
import { getThumbnailUrl } from '@/lib/youtube/utils'
import { PlayCircle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

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
        <img src={thumbUrl} alt={video.topic_title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
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
"""

files['app/missions/page.js'] = r"""import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MissionList } from '@/components/missions/MissionList'

export const dynamic = 'force-dynamic'

export default async function MissionsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  const { data: roadmap } = await supabase.from('roadmaps').select('*').eq('user_id', session.user.id).eq('is_active', true).single()
  const { data: missions } = await supabase.from('daily_missions').select('*, video_id(*)').eq('user_id', session.user.id).order('day_number', { ascending: true })

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6 pt-6 px-4 sm:px-6">
      <div className="glass p-8 rounded-3xl border border-border bg-card">
        <h1 className="text-3xl font-display font-bold text-white mb-2">My Journey 🗺️</h1>
        <p className="text-text-secondary">Track your 90-day progress and access past missions.</p>
        
        <div className="flex gap-4 mt-6">
          <div className="bg-background px-4 py-2 rounded-xl border border-border flex items-center gap-2">
            <span className="text-purple font-bold">{missions?.filter(m => m.status==='completed').length || 0} / {roadmap?.total_days || 90}</span>
            <span className="text-xs text-text-muted uppercase">Complete</span>
          </div>
          <div className="bg-background px-4 py-2 rounded-xl border border-border flex items-center gap-2">
            <span className="text-orange-500 font-bold">{profile?.streak_count || 0} 🔥</span>
            <span className="text-xs text-text-muted uppercase">Streak</span>
          </div>
        </div>
      </div>
      <MissionList missions={missions} roadmap={roadmap} />
    </div>
  )
}
"""

files['components/missions/MissionList.js'] = r"""'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Lock, Target, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

export function MissionList({ missions = [], roadmap }) {
  const router = useRouter()
  const [view, setView] = useState('timeline')

  const currentDay = roadmap?.current_day || 1
  const totalDays = roadmap?.total_days || 90

  const allDays = Array.from({ length: totalDays }).map((_, i) => {
    const day = i + 1
    const mission = missions.find(m => m.day_number === day)
    return {
      day,
      mission,
      isCompleted: mission?.status === 'completed',
      isCurrent: day === currentDay,
      isLocked: day > currentDay
    }
  })

  const weeks = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  return (
    <div className="space-y-6">
      <div className="flex bg-card border border-border rounded-lg p-1 w-max">
        <button onClick={() => setView('timeline')} className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", view === 'timeline' ? "bg-purple text-white shadow-sm" : "text-text-muted hover:text-white")}>Timeline</button>
        <button onClick={() => setView('calendar')} className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", view === 'calendar' ? "bg-purple text-white shadow-sm" : "text-text-muted hover:text-white")}>Calendar</button>
      </div>

      {view === 'timeline' && (
        <div className="space-y-12">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="space-y-4">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider pl-4 border-l-2 border-purple-light">Week {wIdx + 1}</h3>
              <div className="space-y-3">
                {week.map(({ day, mission, isCompleted, isCurrent, isLocked }) => (
                  <motion.div 
                    key={day}
                    onClick={() => !isLocked && router.push(`/missions/${day}`)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                      isLocked ? "bg-background border-border/50 opacity-50 cursor-not-allowed" : "bg-card border-border hover:border-purple/50 cursor-pointer glass"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2",
                      isCompleted ? "bg-green/10 border-green text-green" : isCurrent ? "bg-purple/10 border-purple text-purple animate-pulse" : "bg-background border-border text-text-muted"
                    )}>
                      {isCompleted ? <CheckCircle2 size={18} /> : isCurrent ? <Target size={18} /> : <Lock size={18} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-text-muted uppercase mb-1">Day {day}</p>
                      <p className={cn("font-bold truncate text-base", isCompleted ? "text-white" : isCurrent ? "text-white" : "text-text-secondary")}>
                        {mission?.topic_title || `Topic ${day}`}
                      </p>
                    </div>

                    <div className="hidden sm:block">
                      {isCompleted ? (
                        <span className="text-xs font-bold text-green bg-green/10 px-3 py-1 rounded-full border border-green/20">Completed</span>
                      ) : isCurrent ? (
                        <button className="text-xs font-bold text-white bg-purple hover:bg-purple-light px-4 py-1.5 rounded-full transition-colors flex items-center gap-1">
                          Continue <ChevronRight size={14} />
                        </button>
                      ) : (
                        <span className="text-xs text-text-muted">Unlocks after Day {day - 1}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'calendar' && (
        <div className="glass p-6 rounded-3xl border border-border bg-card">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-xs font-bold text-text-muted uppercase pb-2">{d}</div>
            ))}
            {allDays.map(({ day, isCompleted, isCurrent, isLocked }) => (
              <div 
                key={day}
                onClick={() => !isLocked && router.push(`/missions/${day}`)}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all border cursor-pointer",
                  isCompleted ? "bg-green/20 text-green border-green/30 hover:bg-green/30" :
                  isCurrent ? "bg-purple text-white border-purple-light shadow-[0_0_15px_rgba(108,99,255,0.4)]" :
                  isLocked ? "bg-background border-border text-text-muted opacity-30 cursor-not-allowed" :
                  "bg-card border-border text-text-secondary hover:border-purple/50 hover:text-white"
                )}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
"""

files['app/missions/[day]/page.js'] = r"""import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { MissionDetail } from '@/components/missions/MissionDetail'

export const dynamic = 'force-dynamic'

export default async function SingleMissionPage({ params }) {
  const dayNumber = parseInt(params.day, 10)
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const { data: roadmap } = await supabase.from('roadmaps').select('*').eq('user_id', session.user.id).eq('is_active', true).single()

  if (roadmap && dayNumber > roadmap.current_day) {
    redirect('/dashboard')
  }

  const { data: mission } = await supabase.from('daily_missions').select('*').eq('user_id', session.user.id).eq('day_number', dayNumber).single()

  if (!mission) {
    return <div className="p-8 text-center text-white">Mission not found for Day {dayNumber}</div>
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 pt-6 px-4 sm:px-6">
      <MissionDetail mission={mission} dayNumber={dayNumber} />
    </div>
  )
}
"""

files['components/missions/MissionDetail.js'] = r"""'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, PlayCircle, ExternalLink, ChevronLeft, ChevronRight, BookOpen, Wrench, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export function MissionDetail({ mission, dayNumber }) {
  const router = useRouter()
  const [tasks, setTasks] = useState({
    learn: mission.status === 'completed' || mission.video_completed,
    build: mission.status === 'completed',
    apply: mission.status === 'completed'
  })
  const [isCompleting, setIsCompleting] = useState(false)
  const isAllComplete = (tasks.learn && tasks.build && tasks.apply) || mission.status === 'completed'

  const handleComplete = async () => {
    if (!isAllComplete && Object.values(tasks).filter(Boolean).length < 3) return
    setIsCompleting(true)
    try {
      const res = await fetch('/api/missions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: mission.id, completedTasks: tasks })
      })
      if (!res.ok) throw new Error('Failed to complete mission')
      toast.success('Mission Complete! +100 XP 🎉')
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch(e) {
      toast.error(e.message)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/missions')} className="text-text-muted hover:text-white flex items-center gap-1 text-sm font-bold transition-colors">
          <ChevronLeft size={16} /> All Missions
        </button>
        {mission.status === 'completed' && <span className="bg-green/10 text-green border border-green/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 size={14}/> Completed</span>}
      </div>

      <div className="glass p-8 rounded-3xl border border-border bg-card">
        <span className="text-sm font-bold text-purple-light uppercase tracking-wider mb-2 block">Day {dayNumber}</span>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">{mission.topic_title}</h1>
      </div>

      <div className="grid gap-6">
        <div className="glass p-6 rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><BookOpen className="text-blue-500" /> Learn</h2>
            <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", tasks.learn ? "bg-green border-green text-black" : "border-border text-transparent")}>
              <CheckCircle2 size={14} strokeWidth={3} className={tasks.learn ? "opacity-100" : "opacity-0"} />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{mission.learn_task?.title}</h3>
          <p className="text-text-secondary mb-6 leading-relaxed">{mission.learn_task?.description}</p>
          <Button onClick={() => router.push(`/missions/${dayNumber}/video`)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold w-full sm:w-auto">
            <PlayCircle size={18} className="mr-2" /> Watch Video Lesson
          </Button>
          {mission.video_completed && <p className="text-green text-sm font-bold mt-3">✅ Video watched and test passed</p>}
        </div>

        <div className="glass p-6 rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Wrench className="text-green" /> Build</h2>
            <button onClick={() => setTasks(p => ({...p, build: !p.build}))} className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer", tasks.build ? "bg-green border-green text-black" : "border-text-muted text-transparent hover:border-white")}>
              <CheckCircle2 size={14} strokeWidth={3} className={tasks.build ? "opacity-100" : "opacity-0"} />
            </button>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{mission.build_task?.title}</h3>
          <p className="text-text-secondary mb-4 leading-relaxed">{mission.build_task?.description}</p>
          <div className="bg-background p-4 rounded-xl border border-border mb-4">
            <span className="text-xs font-bold text-text-muted uppercase block mb-1">Expected Output</span>
            <span className="text-sm text-white">{mission.build_task?.expected_output}</span>
          </div>
          <textarea placeholder="Paste your code link, GitHub repo, or notes here..." className="w-full h-24 bg-background border border-border rounded-xl p-3 text-sm text-white outline-none focus:border-purple focus:ring-1 focus:ring-purple/50 resize-none mb-4" />
          <Button variant={tasks.build ? "secondary" : "outline"} onClick={() => setTasks(p => ({...p, build: true}))} className={cn("w-full sm:w-auto", tasks.build && "bg-green/10 text-green border-green/20")}>
            {tasks.build ? "Marked as Done ✓" : "Mark as Done"}
          </Button>
        </div>

        <div className="glass p-6 rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Mail className="text-orange-500" /> Apply</h2>
            <button onClick={() => setTasks(p => ({...p, apply: !p.apply}))} className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer", tasks.apply ? "bg-green border-green text-black" : "border-text-muted text-transparent hover:border-white")}>
              <CheckCircle2 size={14} strokeWidth={3} className={tasks.apply ? "opacity-100" : "opacity-0"} />
            </button>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">{mission.apply_task?.role}</h3>
          <p className="text-text-secondary mb-4">at {mission.apply_task?.company}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {mission.apply_task?.link && (
              <a href={mission.apply_task.link} target="_blank" rel="noreferrer" className="flex items-center justify-center h-10 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors">
                Go to Application <ExternalLink size={16} className="ml-2" />
              </a>
            )}
            <Button variant={tasks.apply ? "secondary" : "outline"} onClick={() => setTasks(p => ({...p, apply: true}))} className={cn("", tasks.apply && "bg-green/10 text-green border-green/20")}>
              {tasks.apply ? "Applied ✓" : "Mark as Applied"}
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] p-4 md:p-6 bg-background/80 backdrop-blur-md border-t border-border z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="hidden sm:block">
             <span className="text-sm font-bold text-white">Progress: {Object.values(tasks).filter(Boolean).length}/3</span>
          </div>
          <Button 
            size="lg" 
            isLoading={isCompleting}
            disabled={!isAllComplete && Object.values(tasks).filter(Boolean).length < 3}
            onClick={handleComplete}
            className={cn("w-full sm:w-auto px-8 font-bold transition-all", (isAllComplete || Object.values(tasks).filter(Boolean).length === 3) ? "bg-gradient-to-r from-purple to-cyan text-white shadow-[0_0_20px_rgba(108,99,255,0.4)]" : "bg-card border border-border text-text-muted cursor-not-allowed")}
          >
            {mission.status === 'completed' ? 'Mission Already Completed' : 'All done? Complete Mission'}
          </Button>
        </div>
      </div>
    </div>
  )
}
"""

files['supabase_functions.sql'] = r"""
CREATE OR REPLACE FUNCTION increment_video_views(vid_id uuid)
RETURNS void AS $$
  UPDATE topic_videos 
  SET view_count = view_count + 1
  WHERE id = vid_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment(x int, row_id uuid)
RETURNS int AS $$
  UPDATE profiles 
  SET xp_points = xp_points + x
  WHERE id = row_id
  RETURNING xp_points;
$$ LANGUAGE sql SECURITY DEFINER;
"""

for k, v in files.items():
    p = os.path.join(base, k)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w') as f:
        f.write(v)

print("Video system generated successfully.")
