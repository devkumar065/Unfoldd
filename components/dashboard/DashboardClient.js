'use client'

import { useState, useEffect, useCallback } 
  from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import HeroGreeting from './HeroGreeting'
import MissionCard from './MissionCard'
import StatsRow from './StatsRow'
import SkillsGrid from './SkillsGrid'
import ActivityFeed from './ActivityFeed'
import InternshipWidget from './InternshipWidget'
import BadgesSection from './BadgesSection'
import StreakCard from './StreakCard'
import { RefreshCw } from 'lucide-react'

export default function DashboardClient({
  initialProfile,
  initialRoadmap,
  initialMission,
  initialSkills,
  initialNotifications,
  initialBadges,
  initialStats,
  userId,
  needsMissionGeneration
}) {
  const [mission, setMission] = useState(initialMission)
  const [stats, setStats] = useState(initialStats)
  const [skills, setSkills] = useState(initialSkills)
  const [badges, setBadges] = useState(initialBadges)
  const [generating, setGenerating] = useState(false)
  const [profile] = useState(initialProfile)

  // Auto-generate mission if needed
  useEffect(() => {
    if (needsMissionGeneration && !mission) {
      generateMission()
    }
  }, [needsMissionGeneration])

  const generateMission = useCallback(async () => {
    if (generating) return
    setGenerating(true)
    
    try {
      const res = await fetch(
        '/api/mission/generate-next',
        { method: 'POST' }
      )
      const data = await res.json()
      
      if (data.success && data.mission) {
        setMission(data.mission)
        toast.success(
          `Day ${data.dayNumber} mission ready!`)
      } else {
        console.error('Mission generation failed:', 
          data.error)
        toast.error(
          'Could not generate mission. Try refreshing.')
      }
    } catch(e) {
      console.error('Mission generation error:', e)
      toast.error('Connection error. Try refreshing.')
    } finally {
      setGenerating(false)
    }
  }, [generating])

  return (
    <div className="p-4 md:p-6 space-y-6 
      max-w-7xl mx-auto">

      {/* Hero greeting */}
      <HeroGreeting
        profile={profile}
        currentDay={stats.currentDay}
        totalDays={stats.totalDays}
        streak={stats.streak}
        xp={stats.xp}
      />

      {/* Mission card */}
      {generating ? (
        <MissionGenerating />
      ) : mission ? (
        <MissionCard
          initialMission={mission}
          onComplete={() => {
            // After completion generate next
            setTimeout(generateMission, 2000)
          }}
        />
      ) : (
        <NoMissionCard
          hasRoadmap={!!initialRoadmap}
          onGenerate={generateMission}
        />
      )}

      {/* Stats row */}
      <StatsRow stats={stats} />

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 
        gap-6">

        {/* Left — Skills */}
        <div className="lg:col-span-2 space-y-6">
          <SkillsGrid
            initialSkills={skills}
            userId={userId}
          />
          <BadgesSection earnedBadges={badges} />
        </div>

        {/* Right — Activity + Internships */}
        <div className="space-y-6">
          <StreakCard
            streak={stats.streak}
            longestStreak={stats.longestStreak}
          />
          <InternshipWidget userId={userId} />
          <ActivityFeed userId={userId} />
        </div>
      </div>
    </div>
  )
}

// Mission generating loading state
function MissionGenerating() {
  return (
    <div className="bg-[#12121A] border 
      border-purple-500/20 rounded-2xl p-8 
      text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
        className="w-10 h-10 rounded-full 
          border-2 border-purple-500 
          border-t-transparent mx-auto mb-4"
      />
      <h3 className="text-white font-bold text-lg mb-1"
        style={{ fontFamily: 'Space Grotesk' }}>
        Building Your Mission...
      </h3>
      <p className="text-white/40 text-sm">
        AI is creating your personalized 
        Day 1 mission. Just a moment.
      </p>
    </div>
  )
}

// No mission state
function NoMissionCard({ hasRoadmap, onGenerate }) {
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    await onGenerate()
    setLoading(false)
  }

  if (!hasRoadmap) {
    return (
      <div className="bg-[#12121A] border 
        border-white/10 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-2xl 
          bg-purple-500/10 flex items-center 
          justify-center mx-auto mb-4">
          <RefreshCw size={24} 
            className="text-purple-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">
          Complete Onboarding First
        </h3>
        <p className="text-white/40 text-sm mb-4">
          Set up your profile to get your 
          personalized roadmap.
        </p>
        <a href="/onboarding"
          className="inline-block px-6 py-2.5 
            bg-purple-600 text-white rounded-xl 
            font-semibold text-sm hover:bg-purple-500
            transition-colors">
          Complete Setup
        </a>
      </div>
    )
  }

  return (
    <div className="bg-[#12121A] border 
      border-white/10 rounded-2xl p-8 text-center">
      <div className="w-12 h-12 rounded-2xl 
        bg-purple-500/10 flex items-center 
        justify-center mx-auto mb-4">
        <RefreshCw size={24} 
          className="text-purple-400" />
      </div>
      <h3 className="text-white font-bold text-lg mb-2">
        Ready for Your First Mission?
      </h3>
      <p className="text-white/40 text-sm mb-4">
        Click below to generate your 
        personalized Day 1 mission.
      </p>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-6 py-2.5 bg-gradient-to-r 
          from-purple-600 to-cyan-600
          text-white rounded-xl font-semibold 
          text-sm disabled:opacity-50
          hover:opacity-90 transition-opacity"
      >
        {loading ? 'Generating...' : 'Generate Day 1 Mission'}
      </button>
    </div>
  )
}
