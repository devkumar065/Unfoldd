'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMissionStore from '@/store/missionStore'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'
import { toast } from 'sonner'

export default function MissionCard({ initialMission }) {
  const { user } = useUser()
  const {
    currentMission,
    taskCompletion,
    isSaving,
    initMission,
    toggleTask,
    setMission
  } = useMissionStore()

  // Initialize store with server-fetched mission
  useEffect(() => {
    if (initialMission) {
      setMission(initialMission)
    }
    if (user?.id) {
      initMission(user.id)
    }
  }, [user?.id, initialMission, setMission, initMission])

  const mission = currentMission || initialMission
  if (!mission) return <MissionCardEmpty />

  const isCompleted = mission.status === 'completed'
  const tasksCompleted = Object.values(taskCompletion).filter(Boolean).length

  async function handleTaskToggle(taskType) {
    if (!user?.id || isCompleted) return
    
    try {
      await toggleTask(taskType, user.id)
    } catch(e) {
      toast.error('Failed to save. Try again.')
    }
  }

  const tasks = [
    { type: 'learn', label: 'LEARN', color: 'bg-blue-500/20 text-blue-400', data: mission.learn_task, icon: '📚' },
    { type: 'build', label: 'BUILD', color: 'bg-green-500/20 text-green-400', data: mission.build_task, icon: '🛠️' },
    { type: 'apply', label: 'APPLY', color: 'bg-orange-500/20 text-orange-400', data: mission.apply_task, icon: '📩' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-6 border transition-all duration-500 ${
        isCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-purple-500/20'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-3 py-1 rounded-full">
            Day {mission.day_number} Mission
          </span>
          {isSaving && (
            <span className="text-xs text-white/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
              Saving...
            </span>
          )}
        </div>
        <MissionCountdown />
      </div>

      <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Space Grotesk' }}>
        {mission.topic_title}
      </h3>
      {mission.learn_task?.description && (
        <p className="text-white/40 text-sm mb-5 line-clamp-2">{mission.learn_task.description}</p>
      )}

      <div className="space-y-3 mb-5">
        {tasks.map((task) => (
          <TaskRow
            key={task.type}
            task={task}
            isChecked={taskCompletion[task.type]}
            isCompleted={isCompleted}
            isSaving={isSaving}
            onToggle={() => handleTaskToggle(task.type)}
            dayNumber={mission.day_number}
          />
        ))}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/40 mb-1.5">
          <span>{tasksCompleted}/3 tasks complete</span>
          <span>{Math.round((tasksCompleted/3)*100)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${(tasksCompleted/3)*100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-cyan-500'
            }`}
          />
        </div>
      </div>

      {isCompleted ? (
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <span className="text-green-400 font-semibold">✅ Mission Complete!</span>
        </div>
      ) : (
        <Link href={`/missions/${mission.day_number}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold text-sm"
          >
            {tasksCompleted === 0 ? 'Start Mission →' : 'Continue Mission →'}
          </motion.button>
        </Link>
      )}
    </motion.div>
  )
}

function TaskRow({ task, isChecked, isCompleted, isSaving, onToggle, dayNumber }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      isChecked ? 'border-green-500/20 bg-green-500/5' : 'border-white/5 bg-white/3'
    }`}>
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={onToggle}
          disabled={isSaving || isCompleted}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            isChecked ? 'bg-purple-500 border-purple-500 scale-110' : 'border-white/20 hover:border-purple-400'
          } ${(isSaving || isCompleted) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <AnimatePresence>
            {isChecked && (
              <motion.svg initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>

        <span className={`text-xs font-bold px-2 py-0.5 rounded ${task.color}`}>{task.icon} {task.label}</span>
        <span className={`text-sm flex-1 ${isChecked ? 'line-through text-white/30' : 'text-white/80'}`}>
          {task.data?.title || `${task.label} task`}
        </span>
        {task.data?.estimated_minutes && <span className="text-white/30 text-xs flex-shrink-0">~{task.data.estimated_minutes}m</span>}
        <button onClick={() => setExpanded(!expanded)} className="text-white/20 hover:text-white/50 transition-colors text-xs ml-1">
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 pt-1 border-t border-white/5">
              {task.data?.description && <p className="text-white/50 text-xs leading-relaxed mb-2">{task.data.description}</p>}
              {task.type === 'learn' && task.data?.resources?.length > 0 && (
                <div className="space-y-1">
                  {task.data.resources.slice(0, 3).map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300">
                      🔗 {r.title}
                    </a>
                  ))}
                </div>
              )}
              {task.type === 'apply' && task.data?.link && (
                <a href={task.data.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-lg hover:bg-orange-500/30 transition-colors mt-1">
                  Apply at {task.data.company} →
                </a>
              )}
              <div className="mt-2">
                <Link href={`/missions/${dayNumber}`} className="text-xs text-white/30 hover:text-white/50 transition-colors">
                  View full mission details →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MissionCountdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight - now
      const hours = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      setTimeLeft(`${hours}h ${mins}m left`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  return <span className="text-xs text-white/30">{timeLeft}</span>
}

function MissionCardEmpty() {
  return (
    <div className="glass rounded-2xl p-8 text-center border border-white/5">
      <div className="text-4xl mb-3">🎯</div>
      <h3 className="text-white font-bold mb-2">No Mission Yet</h3>
      <p className="text-white/40 text-sm">Complete your previous mission to unlock the next one.</p>
    </div>
  )
}