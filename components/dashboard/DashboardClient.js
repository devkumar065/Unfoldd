'use client'

import { useState, useEffect } from 'react'
import { HeroGreeting } from './HeroGreeting'
import MissionCard from './MissionCard'
import { StatsRow } from './StatsRow'
import { RoadmapTimeline } from './RoadmapTimeline'
import { SkillsGrid } from './SkillsGrid'
import { ActivityFeed } from './ActivityFeed'
import { InternshipWidget } from './InternshipWidget'
import { BadgesSection } from './BadgesSection'
import { StreakCard } from './StreakCard'
import { toast } from 'sonner'

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
          <RoadmapTimeline roadmap={roadmap} currentDay={roadmap?.current_day} />
          <SkillsGrid skills={skills || []} />
          <BadgesSection badges={badges || []} />
        </div>
        
        <div className="space-y-6">
          <StreakCard profile={profile} mission={currentMission} />
          <InternshipWidget internships={internships || []} />
          <ActivityFeed activities={activities || []} />
        </div>
      </div>
    </div>
  )
}
