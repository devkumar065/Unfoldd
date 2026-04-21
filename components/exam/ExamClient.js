'use client'

import { useState, useEffect } from 'react'
import { MobileBlockScreen } from './MobileBlockScreen'
import { CameraSetup } from './CameraSetup'
import { ActiveExam } from './ActiveExam'
import { ExamResult } from './ExamResult'

export function ExamClient({ exam, user, token }) {
  const [screen, setScreen] = useState('device_check')
  const [stream, setStream] = useState(null)
  const [resultData, setResultData] = useState(null)

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS/i.test(navigator.userAgent)
    if (isMobile && screen === 'device_check') {
      setScreen('mobile_block')
    } else if (screen === 'device_check') {
      setScreen('camera_setup')
    }
  }, [screen])

  const handleSetupComplete = (cameraStream) => {
    setStream(cameraStream)
    setScreen('active_exam')
  }

  const handleExamSubmit = (data) => {
    setResultData(data)
    setScreen('result')
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
    }
  }

  return (
    <>
      {screen === 'mobile_block' && <MobileBlockScreen expiresAt={exam.expires_at} />}
      {screen === 'camera_setup' && <CameraSetup exam={exam} onComplete={handleSetupComplete} />}
      {screen === 'active_exam' && <ActiveExam exam={exam} stream={stream} onSubmit={handleExamSubmit} />}
      {screen === 'result' && resultData && <ExamResult {...resultData} skillName={exam.skills?.skill_name} />}
    </>
  )
}
