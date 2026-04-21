'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Lock, CheckCircle2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
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
              Take the Test &rarr;
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
