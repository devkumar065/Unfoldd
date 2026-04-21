'use client'

import { useEffect, useState } from 'react'
import useMissionStore from '@/store/missionStore'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

export default function MissionDetailPage({ params }) {
  const { day } = params
  const { user } = useUser()
  const {
    currentMission,
    taskCompletion,
    isSaving,
    initMission,
    toggleTask
  } = useMissionStore()

  const [mission, setMission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMission() {
      if (!user?.id) return
      
      // Initialize the shared store
      await initMission(user.id)
      
      // Also fetch this specific day's mission
      const { data } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('day_number', parseInt(day))
        .single()

      setMission(data)
      setLoading(false)
    }
    
    loadMission()
  }, [user?.id, day, initMission])

  // Use store data if this is the current mission
  // Otherwise use directly fetched data
  const isCurrentDay = currentMission?.day_number === parseInt(day)
  const displayMission = isCurrentDay ? currentMission : mission
  const displayCompletion = isCurrentDay 
    ? taskCompletion 
    : mission?.task_completion || { learn: false, build: false, apply: false }

  if (loading) return <MissionDetailSkeleton />
  if (!displayMission) return <MissionNotFound day={day} />

  async function handleToggle(taskType) {
    if (!user?.id) return
    
    // If this is current mission use store
    if (isCurrentDay) {
      try {
        await toggleTask(taskType, user.id)
      } catch(e) {
        toast.error('Failed to save progress')
      }
    } else {
      // For past/completed missions update directly (read-only view)
      toast.info('This mission is already completed')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      
      {/* Mission header */}
      <div className="glass rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-purple-500/20 text-purple-400 text-sm font-bold px-3 py-1 rounded-full">
            Day {displayMission.day_number}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            displayMission.status === 'completed'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {displayMission.status === 'completed' ? '✅ Completed' : '🔄 In Progress'}
          </span>
          {isSaving && (
            <span className="text-xs text-white/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
              Saving...
            </span>
          )}
        </div>
        
        <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
          {displayMission.topic_title}
        </h1>
        {displayMission.learn_task?.description && (
          <p className="text-white/50 mt-2 text-sm leading-relaxed">
            {displayMission.learn_task.description}
          </p>
        )}
      </div>

      <FullTaskCard
        type="learn"
        label="📚 Learn"
        color="blue"
        data={displayMission.learn_task}
        isChecked={displayCompletion.learn}
        isSaving={isSaving}
        onToggle={() => handleToggle('learn')}
        isCompleted={displayMission.status === 'completed'}
      />

      <FullTaskCard
        type="build"
        label="🛠️ Build"
        color="green"
        data={displayMission.build_task}
        isChecked={displayCompletion.build}
        isSaving={isSaving}
        onToggle={() => handleToggle('build')}
        isCompleted={displayMission.status === 'completed'}
      />

      <FullTaskCard
        type="apply"
        label="📩 Apply"
        color="orange"
        data={displayMission.apply_task}
        isChecked={displayCompletion.apply}
        isSaving={isSaving}
        onToggle={() => handleToggle('apply')}
        isCompleted={displayMission.status === 'completed'}
      />

      {displayMission.video_id && (
        <div className="glass rounded-2xl p-6 border border-cyan-500/20">
          <h3 className="text-white font-bold mb-3">
            📺 Today&apos;s Video Lesson
          </h3>
          <Link href={`/missions/${day}/video`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-semibold text-sm hover:bg-cyan-500/30 transition-colors"
            >
              {displayMission.video_completed ? '✅ Video Watched — Rewatch' : '▶ Watch Video to Unlock Test'}
            </motion.button>
          </Link>
        </div>
      )}

      <div className="flex justify-between gap-4">
        {parseInt(day) > 1 && (
          <Link href={`/missions/${parseInt(day)-1}`} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-center text-sm transition-colors">
            ← Day {parseInt(day)-1}
          </Link>
        )}
        {displayMission.status === 'completed' && (
          <Link href={`/missions/${parseInt(day)+1}`} className="flex-1 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 text-center text-sm hover:bg-purple-500/30 transition-colors">
            Day {parseInt(day)+1} →
          </Link>
        )}
      </div>
    </div>
  )
}

function FullTaskCard({ type, label, color, data, isChecked, isSaving, onToggle, isCompleted }) {
  const colorMap = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400' }
  }
  const c = colorMap[color]

  return (
    <div className={`glass rounded-2xl border transition-all duration-300 ${isChecked ? 'border-green-500/20 bg-green-500/5' : `${c.border} ${c.bg}`}`}>
      <div className="flex items-center gap-4 p-5 border-b border-white/5">
        <button
          onClick={onToggle}
          disabled={isSaving || isCompleted}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
            isChecked ? 'bg-purple-500 border-purple-500' : `border-white/20 hover:${c.border}`
          } ${(isSaving || isCompleted) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}`}
        >
          <AnimatePresence>
            {isChecked && (
              <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} d="M2 7L6 11L12 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.badge}`}>{label}</span>
        <h3 className={`font-bold flex-1 ${isChecked ? 'line-through text-white/30' : 'text-white'}`}>{data?.title}</h3>
        {data?.estimated_minutes && <span className="text-white/30 text-sm flex-shrink-0">~{data.estimated_minutes} min</span>}
      </div>

      <div className="p-5 space-y-4">
        {data?.description && <p className="text-white/60 text-sm leading-relaxed">{data.description}</p>}
        {type === 'learn' && data?.what_to_focus_on?.length > 0 && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Focus on:</p>
            <ul className="space-y-1">
              {data.what_to_focus_on.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                  <span className={`w-1.5 h-1.5 rounded-full bg-${color}-400 flex-shrink-0`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {type === 'build' && data?.steps?.length > 0 && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Steps:</p>
            <ol className="space-y-2">
              {data.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.badge}`}>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
        {type === 'build' && data?.expected_output && (
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Expected Output:</p>
            <p className="text-white/60 text-sm">{data.expected_output}</p>
          </div>
        )}
        {type === 'learn' && data?.resources?.length > 0 && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Resources:</p>
            <div className="space-y-2">
              {data.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-sm ${c.text} hover:opacity-80 transition-opacity`}>
                  <span className="text-xs bg-white/5 px-2 py-0.5 rounded capitalize">{r.type}</span>
                  {r.title}
                  <span className="text-white/20">↗</span>
                </a>
              ))}
            </div>
          </div>
        )}
        {type === 'apply' && data?.link && (
          <div className="space-y-2">
            {data.why_match && <p className="text-white/40 text-xs italic">💡 {data.why_match}</p>}
            <a href={data.link} target="_blank" rel="noopener noreferrer">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full py-3 rounded-xl ${c.badge} font-semibold text-sm hover:opacity-90 transition-opacity`}>
                Apply at {data.company} →
              </motion.button>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function MissionDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl animate-pulse bg-white/5" />)}
    </div>
  )
}

function MissionNotFound({ day }) {
  return (
    <div className="max-w-3xl mx-auto p-6 text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h2 className="text-white font-bold text-xl mb-2">Day {day} Not Available Yet</h2>
      <p className="text-white/50 mb-6">Complete previous missions to unlock this day.</p>
      <Link href="/dashboard" className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold">Back to Dashboard</Link>
    </div>
  )
}