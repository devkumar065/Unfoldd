'use client'

import { useEffect, useState } from 'react'
import useMissionStore from '@/store/missionStore'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import { 
  CheckCircle2, 
  RefreshCw, 
  BookOpen, 
  Hammer, 
  Send, 
  Video, 
  Play, 
  Lightbulb, 
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

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
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
            displayMission.status === 'completed'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {displayMission.status === 'completed' 
              ? <><CheckCircle2 size={12} /> Completed</> 
              : <><RefreshCw size={12} className="animate-spin-slow" /> In Progress</>
            }
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
        icon={BookOpen}
        label="Learn"
        color="blue"
        data={displayMission.learn_task}
        isChecked={displayCompletion.learn}
        isSaving={isSaving}
        onToggle={() => handleToggle('learn')}
        isCompleted={displayMission.status === 'completed'}
      />

      <FullTaskCard
        type="build"
        icon={Hammer}
        label="Build"
        color="green"
        data={displayMission.build_task}
        isChecked={displayCompletion.build}
        isSaving={isSaving}
        onToggle={() => handleToggle('build')}
        isCompleted={displayMission.status === 'completed'}
      />

      <FullTaskCard
        type="apply"
        icon={Send}
        label="Apply"
        color="orange"
        data={displayMission.apply_task}
        isChecked={displayCompletion.apply}
        isSaving={isSaving}
        onToggle={() => handleToggle('apply')}
        isCompleted={displayMission.status === 'completed'}
      />

      {displayMission.video_id && (
        <div className="glass rounded-2xl p-6 border border-cyan-500/20">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Video size={18} className="text-cyan-400" /> Today&apos;s Video Lesson
          </h3>
          <Link href={`/missions/${day}/video`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-semibold text-sm hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-2"
            >
              {displayMission.video_completed 
                ? <><CheckCircle2 size={16} /> Video Watched — Rewatch</> 
                : <><Play size={16} /> Watch Video to Unlock Test</>
              }
            </motion.button>
          </Link>
        </div>
      )}

      <div className="flex justify-between gap-4">
        {parseInt(day) > 1 && (
          <Link href={`/missions/${parseInt(day)-1}`} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-center text-sm transition-colors flex items-center justify-center gap-2">
            <ChevronLeft size={16} /> Day {parseInt(day)-1}
          </Link>
        )}
        {displayMission.status === 'completed' && (
          <Link href={`/missions/${parseInt(day)+1}`} className="flex-1 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 text-center text-sm hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2">
            Day {parseInt(day)+1} <ChevronRight size={16} />
          </Link>
        )}
      </div>
    </div>
  )
}

function FullTaskCard({ type, icon: Icon, label, color, data, isChecked, isSaving, onToggle, isCompleted }) {
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
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${c.badge}`}>
          <Icon size={12} />
          {label.toUpperCase()}
        </div>
        <h3 className={`font-bold flex-1 text-sm ${isChecked ? 'line-through text-white/30' : 'text-white'}`}>{data?.title}</h3>
        {data?.estimated_minutes && <span className="text-white/30 text-xs flex-shrink-0 font-medium">~{data.estimated_minutes} min</span>}
      </div>

      <div className="p-5 space-y-4">
        {data?.description && <p className="text-white/60 text-sm leading-relaxed">{data.description}</p>}
        {type === 'learn' && data?.what_to_focus_on?.length > 0 && (
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-black mb-3">What to focus on:</p>
            <ul className="space-y-2">
              {data.what_to_focus_on.map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-white/70 group">
                  <div className={`w-1.5 h-1.5 rounded-full ${c.text} bg-current flex-shrink-0 group-hover:scale-125 transition-transform`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {type === 'build' && data?.steps?.length > 0 && (
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-black mb-3">Implementation Steps:</p>
            <ol className="space-y-3">
              {data.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-4 text-sm text-white/70">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${c.badge}`}>{i + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {type === 'build' && data?.expected_output && (
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-black mb-2">Expected Output:</p>
            <p className="text-white/60 text-sm leading-relaxed">{data.expected_output}</p>
          </div>
        )}
        {type === 'learn' && data?.resources?.length > 0 && (
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-black mb-3">Resources & Documentation:</p>
            <div className="grid grid-cols-1 gap-2">
              {data.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-${color}-500/30 transition-all group`}>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md capitalize font-bold text-white/40">{r.type}</span>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{r.title}</span>
                  </div>
                  <Send size={12} className={`text-white/20 group-hover:${c.text} -rotate-45 transition-all`} />
                </a>
              ))}
            </div>
          </div>
        )}
        {type === 'apply' && data?.link && (
          <div className="space-y-3">
            {data.why_match && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <Lightbulb size={16} className="text-purple-400 shrink-0 mt-0.5" />
                <p className="text-white/60 text-xs leading-relaxed">
                  <span className="text-purple-300 font-bold">Why you matched:</span> {data.why_match}
                </p>
              </div>
            )}
            <a href={data.link} target="_blank" rel="noopener noreferrer">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className={`w-full py-4 rounded-xl ${c.badge} font-black text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-black/20`}>
                <Send size={16} /> Apply at {data.company}
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
    <div className="max-w-3xl mx-auto p-6 text-center py-20">
      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
        <Lock size={40} className="text-white/20" />
      </div>
      <h2 className="text-white font-black text-2xl mb-2">Day {day} Not Available Yet</h2>
      <p className="text-white/40 mb-8 max-w-xs mx-auto">Complete your current missions to unlock the next steps in your journey.</p>
      <Link href="/dashboard">
        <button className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20">
          Back to Dashboard
        </button>
      </Link>
    </div>
  )
}
