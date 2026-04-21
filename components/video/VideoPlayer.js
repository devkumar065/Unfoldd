'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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

  const saveProgressToDB = useCallback(async (currentTime, duration, completed = false) => {
    if (!missionId) return
    // Note: Removed isSaving check from here and using a functional approach if needed, 
    // or just let it fire as it's debounced/throttled by the caller
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
    }
  }, [videoId, missionId])

  const triggerSkipWarning = useCallback(() => {
    setShowSkipWarning(true)
    setTimeout(() => setShowSkipWarning(false), 2000)
    if (onSkipAttempt) onSkipAttempt()
  }, [onSkipAttempt])

  const onPlayerStateChange = useCallback((event) => {
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
  }, [onProgress, saveProgressToDB, triggerSkipWarning, onComplete])

  const initPlayer = useCallback(() => {
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
  }, [videoId, startAt, onPlayerStateChange])

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
  }, [initPlayer, saveProgressToDB])

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
