import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

const useMissionStore = create((set, get) => ({
  
  // Current mission data
  currentMission: null,
  taskCompletion: {
    learn: false,
    build: false,
    apply: false
  },
  isSaving: false,
  lastSaved: null,
  isLoading: false,
  realtimeChannel: null,

  // Initialize mission data
  initMission: async (userId) => {
    set({ isLoading: true })
    
    try {
      // Fetch current mission
      const { data: mission } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', userId)
        .in('status', [
          'pending', 'in_progress',
          'video_watching', 'video_done',
          'test_in_progress'
        ])
        .order('day_number', { ascending: false })
        .limit(1)
        .single()

      if (mission) {
        // Load saved task completion from mission data
        const completion = mission.task_completion || {
          learn: false,
          build: false,
          apply: false
        }

        set({
          currentMission: mission,
          taskCompletion: completion,
          isLoading: false
        })

        // Subscribe to real-time changes
        get().subscribeToMission(mission.id, userId)
      } else {
        set({ isLoading: false })
      }
    } catch(error) {
      console.error('Mission init error:', error)
      set({ isLoading: false })
    }
  },

  // Subscribe to real-time mission updates
  subscribeToMission: (missionId, userId) => {
    // Clean up existing subscription
    const existing = get().realtimeChannel
    if (existing) {
      supabase.removeChannel(existing)
    }

    const channel = supabase
      .channel(`mission-${missionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'daily_missions',
        filter: `id=eq.${missionId}`
      }, (payload) => {
        // Update store when DB changes
        const updatedMission = payload.new
        const updatedCompletion = 
          updatedMission.task_completion || {
            learn: false,
            build: false,
            apply: false
          }

        set({
          currentMission: updatedMission,
          taskCompletion: updatedCompletion
        })
      })
      .subscribe()

    set({ realtimeChannel: channel })
  },

  // Toggle task completion
  toggleTask: async (taskType, userId) => {
    const { currentMission, taskCompletion, 
      isSaving } = get()
    
    if (!currentMission || isSaving) return

    // Optimistic update — update UI immediately
    const newCompletion = {
      ...taskCompletion,
      [taskType]: !taskCompletion[taskType]
    }

    set({ 
      taskCompletion: newCompletion,
      isSaving: true 
    })

    try {
      // Determine new mission status
      const allDone = newCompletion.learn && 
        newCompletion.build && 
        newCompletion.apply

      const anyDone = newCompletion.learn || 
        newCompletion.build || 
        newCompletion.apply

      let newStatus = currentMission.status
      if (allDone) {
        newStatus = 'completed'
      } else if (anyDone && currentMission.status === 'pending') {
        newStatus = 'in_progress'
      }

      // Save to Supabase
      const { data: updated, error } = await supabase
        .from('daily_missions')
        .update({
          task_completion: newCompletion,
          status: newStatus,
          ...(allDone && { 
            completed_at: new Date().toISOString() 
          })
        })
        .eq('id', currentMission.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      set({ 
        currentMission: updated,
        taskCompletion: newCompletion,
        isSaving: false,
        lastSaved: new Date()
      })

      // If all tasks done — trigger mission complete
      if (allDone && currentMission.status !== 'completed') {
        get().completeMission(userId)
      }

    } catch(error) {
      console.error('Task toggle error:', error)
      
      // Revert optimistic update on error
      set({ 
        taskCompletion,  // restore original
        isSaving: false 
      })
      
      throw error
    }
  },

  // Complete mission (called when all tasks done)
  completeMission: async (userId) => {
    const { currentMission } = get()
    if (!currentMission) return

    try {
      // Call mission complete API
      await fetch('/api/missions/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          missionId: currentMission.id,
          completedTasks: ['learn', 'build', 'apply']
        })
      })
    } catch(error) {
      console.error('Mission complete error:', error)
    }
  },

  // Update mission from external source
  setMission: (mission) => {
    if (!mission) return
    set({
      currentMission: mission,
      taskCompletion: mission.task_completion || {
        learn: false,
        build: false,
        apply: false
      }
    })
  },

  // Cleanup
  cleanup: () => {
    const { realtimeChannel } = get()
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
    }
    set({
      currentMission: null,
      taskCompletion: { 
        learn: false, build: false, apply: false 
      },
      realtimeChannel: null
    })
  }
}))

export default useMissionStore
