'use client'

import { useState, useEffect } from 'react'
import { TestEntry } from './TestEntry'
import { QuestionFlow } from './QuestionFlow'
import { LevelResult } from './LevelResult'
import { TestComplete } from './TestComplete'
import { AnimatePresence } from 'framer-motion'

export function TestEngineClient({ mission, test, existingAttempt, dayNumber, userId }) {
  const [currentScreen, setCurrentScreen] = useState('entry') // entry | easy | medium | hard | result | complete
  const [attempt, setAttempt] = useState(existingAttempt || null)
  const [currentLevel, setCurrentLevel] = useState('easy')
  const [levelResultData, setLevelResultData] = useState(null)
  
  useEffect(() => {
    if (existingAttempt) {
      if (existingAttempt.status === 'passed' || existingAttempt.all_passed) {
        setCurrentScreen('complete')
      } else if (existingAttempt.status === 'failed') {
        setCurrentScreen('entry')
      } else if (existingAttempt.status === 'in_progress') {
        if (existingAttempt.easy_passed && existingAttempt.medium_passed) {
          setCurrentLevel('hard')
        } else if (existingAttempt.easy_passed) {
          setCurrentLevel('medium')
        } else {
          setCurrentLevel('easy')
        }
        setCurrentScreen('entry')
      }
    }
  }, [existingAttempt])

  const handleStartLevel = (level) => {
    setCurrentLevel(level)
    setCurrentScreen(level)
  }

  const handleLevelComplete = async (score, passed, allPassed, updatedAttemptId) => {
    if (updatedAttemptId && !attempt?.id) {
      setAttempt(prev => ({ ...prev, id: updatedAttemptId }))
    }

    let nextLevel = null
    if (passed && !allPassed) {
      if (currentLevel === 'easy') nextLevel = 'medium'
      if (currentLevel === 'medium') nextLevel = 'hard'
    }

    setLevelResultData({
      level: currentLevel,
      score,
      passed,
      nextLevel
    })

    if (allPassed) {
      setCurrentScreen('complete')
    } else {
      setCurrentScreen('result')
    }
  }

  const handleNextLevel = () => {
    if (levelResultData?.nextLevel) {
      setCurrentLevel(levelResultData.nextLevel)
      setCurrentScreen(levelResultData.nextLevel)
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {currentScreen === 'entry' && (
          <TestEntry 
            key="entry"
            test={test}
            existingAttempt={attempt}
            onStartLevel={handleStartLevel}
            dayNumber={dayNumber}
            currentLevel={currentLevel}
          />
        )}
        
        {(currentScreen === 'easy' || currentScreen === 'medium' || currentScreen === 'hard') && (
          <QuestionFlow 
            key={`flow-${currentScreen}`}
            testId={test.id}
            videoId={test.video_id}
            missionId={mission.id}
            level={currentScreen}
            timerMinutes={currentScreen === 'hard' ? 15 : 10}
            onComplete={handleLevelComplete}
            attemptId={attempt?.id}
          />
        )}

        {currentScreen === 'result' && levelResultData && (
          <LevelResult 
            key="result"
            {...levelResultData}
            dayNumber={dayNumber}
            onNextLevel={handleNextLevel}
            testId={test.id}
            videoId={test.video_id}
            missionId={mission.id}
            attemptId={attempt?.id}
          />
        )}

        {currentScreen === 'complete' && (
          <TestComplete 
            key="complete"
            test={test}
            dayNumber={dayNumber}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
