'use client'

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
    build: mission.status === 'completed' || mission.build_completed,
    apply: mission.status === 'completed' || mission.apply_completed
  })
  const [isCompleting, setIsCompleting] = useState(false)
  const isAllComplete = (tasks.learn && tasks.build && tasks.apply) || mission.status === 'completed'

  const toggleTask = async (taskType, currentVal) => {
    if (mission.status === 'completed') return;
    const newVal = !currentVal;
    
    // Optimistic UI update
    setTasks(prev => ({ ...prev, [taskType]: newVal }));
    
    try {
      const body = {
        build_completed: taskType === 'build' ? newVal : tasks.build,
        apply_completed: taskType === 'apply' ? newVal : tasks.apply
      };



      const res = await fetch(`/api/missions/${mission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();


      if (!res.ok) throw new Error(data.error || 'Failed to update task');
    } catch(err) {
      console.error('[Persistence Error]', err);
      toast.error('Failed to sync task state');
      // Rollback on error
      setTasks(prev => ({ ...prev, [taskType]: currentVal }));
    }
  }

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
            <button 
              onClick={() => toggleTask('build', tasks.build)} 
              disabled={mission.status === 'completed'}
              className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed", tasks.build ? "bg-green border-green text-black" : "border-text-muted text-transparent hover:border-white")}
            >
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
          <Button 
            variant={tasks.build ? "secondary" : "outline"} 
            onClick={() => toggleTask('build', tasks.build)} 
            disabled={mission.status === 'completed'}
            className={cn("w-full sm:w-auto", tasks.build && "bg-green/10 text-green border-green/20")}
          >
            {tasks.build ? "Marked as Done ✓" : "Mark as Done"}
          </Button>
        </div>

        <div className="glass p-6 rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Mail className="text-orange-500" /> Apply</h2>
            <button 
              onClick={() => toggleTask('apply', tasks.apply)} 
              disabled={mission.status === 'completed'}
              className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed", tasks.apply ? "bg-green border-green text-black" : "border-text-muted text-transparent hover:border-white")}
            >
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
            <Button 
              variant={tasks.apply ? "secondary" : "outline"} 
              onClick={() => toggleTask('apply', tasks.apply)} 
              disabled={mission.status === 'completed'}
              className={cn("", tasks.apply && "bg-green/10 text-green border-green/20")}
            >
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
