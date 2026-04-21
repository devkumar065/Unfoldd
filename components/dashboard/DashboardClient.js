'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { HeroGreeting } from './HeroGreeting'
import MissionCard from './MissionCard'
import { StatsRow } from './StatsRow'
import { toast } from 'sonner'

// Lazy load heavy components
const RoadmapTimeline = lazy(() => import('./RoadmapTimeline'))
const BadgesSection = lazy(() => import('./BadgesSection'))
const SkillsGrid = lazy(() => import('./SkillsGrid'))
const ActivityFeed = lazy(() => import('./ActivityFeed'))
const InternshipWidget = lazy(() => import('./InternshipWidget'))
const StreakCard = lazy(() => import('./StreakCard'))

export function DashboardClient({ 
  initialMission, 
  profile, 
  roadmap, 
  skills, 
  internships, 
  badges, 
  activities,
  applicationsCount 
}) {
  const [currentMission, setCurrentMission] = useState(initialMission)
  const [generatingMission, setGeneratingMission] = useState(false)

  // If no mission exists and roadmap isn't complete, auto-generate
  useEffect(() => {
    if (!currentMission && roadmap && roadmap.current_day < 90) {
      generateNextMission()
    }
  }, [currentMission, roadmap])

  async function generateNextMission() {
    setGeneratingMission(true)
    try {
      const res = await fetch('/api/mission/generate-next', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setCurrentMission(data.mission)
        toast.success(`Day ${data.dayNumber} mission ready! 🎯`)
      } else {
        toast.error(data.error || 'Could not generate mission')
      }
    } catch(e) {
      console.error('Mission generation error:', e)
      toast.error('Could not generate mission. Please refresh.')
    } finally {
      setGeneratingMission(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <HeroGreeting profile={profile} roadmap={roadmap} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {generatingMission ? (
            <div className="glass rounded-[2rem] p-12 text-center bg-card border border-purple/20 shadow-[0_0_50px_rgba(108,99,255,0.1)]">
              <div className="inline-block animate-spin text-5xl mb-6">⚙️</div>
              <h3 className="text-white font-black text-2xl mb-3" style={{ fontFamily: 'Space Grotesk' }}>
                Preparing Your Next Mission...
              </h3>
              <p className="text-white/50 text-base max-w-md mx-auto">
                Our AI is analyzing your progress and building a personalized mission for you. Just a moment.
              </p>
            </div>
          ) : (
            <MissionCard mission={currentMission} />
          )}
          
          <StatsRow profile={profile} skills={skills} applicationsCount={applicationsCount || 0} />
          
          <Suspense fallback={<div className="h-32 rounded-2xl skeleton" />}>
            <RoadmapTimeline roadmap={roadmap} currentDay={roadmap?.current_day} />
          </Suspense>

          <Suspense fallback={<div className="h-48 rounded-2xl skeleton" />}>
            <SkillsGrid skills={skills || []} />
          </Suspense>

          <Suspense fallback={<div className="h-48 rounded-2xl skeleton" />}>
            <BadgesSection badges={badges || []} />
          </Suspense>
        </div>
        
        <div className="space-y-6">
          <Suspense fallback={<div className="h-64 rounded-2xl skeleton" />}>
            <StreakCard profile={profile} mission={currentMission} />
          </Suspense>

          <Suspense fallback={<div className="h-64 rounded-2xl skeleton" />}>
            <InternshipWidget internships={internships || []} />
          </Suspense>

          <Suspense fallback={<div className="h-64 rounded-2xl skeleton" />}>
            <ActivityFeed activities={activities || []} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}