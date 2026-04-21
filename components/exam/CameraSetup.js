'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Camera, User, Sun, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import * as faceapi from 'face-api.js'

export function CameraSetup({ exam, onComplete }) {
  const [step, setStep] = useState(1)
  const [stream, setStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [faceDetected, setFaceDetected] = useState(null) 
  const [lightingOk, setLightingOk] = useState(null)
  const [agreed, setAgreed] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    setTimeout(() => setStep(2), 1000)
  }, [])

  const requestCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setCameraError(null)
      setStep(3)
      runDetectionChecks(mediaStream)
    } catch (err) {
      setCameraError('Camera access denied. Camera is required for this exam. Please allow camera access and refresh the page.')
    }
  }

  const runDetectionChecks = async (mediaStream) => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models')
      ])

      const video = videoRef.current
      if (!video) return

      video.onloadedmetadata = async () => {
        video.play()
        const checkInterval = setInterval(async () => {
          if (!video || video.paused || video.ended) return

          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          if (detections.length === 1) {
            setFaceDetected('ok')
          } else if (detections.length === 0) {
            setFaceDetected('none')
          } else {
            setFaceDetected('multiple')
          }

          const canvas = canvasRef.current
          if (canvas && video.videoWidth > 0) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data
            let colorSum = 0
            for(let x = 0, len = data.length; x < len; x+=4) {
              colorSum += Math.floor((data[x]+data[x+1]+data[x+2])/3)
            }
            const brightness = Math.floor(colorSum / (video.videoWidth * video.videoHeight))
            
            if (brightness < 30) setLightingOk('dark')
            else if (brightness > 220) setLightingOk('bright')
            else setLightingOk('ok')
          }

          if (detections.length === 1 && (lightingOk === 'ok' || lightingOk === null)) {
            setStep(5)
            clearInterval(checkInterval)
          }

        }, 1000)
      }
    } catch(e) {
      console.error(e)
    }
  }

  const handleBegin = async () => {
    if (!agreed) return toast.error('You must agree to the rules')
    setIsValidating(true)
    try {
      const res = await fetch('/api/exam/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: exam.exam_link_token })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onComplete(stream)
    } catch(e) {
      toast.error(e.message)
      setIsValidating(false)
    }
  }

  const StepItem = ({ num, title, icon: Icon, currentStep, passed, error }) => (
    <div className={`flex items-start gap-4 p-4 rounded-2xl border ${passed ? 'bg-green/10 border-green/30' : currentStep === num ? 'bg-purple/10 border-purple/30' : 'bg-background border-border opacity-50'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${passed ? 'bg-green text-black' : currentStep === num ? 'bg-purple text-white animate-pulse' : 'bg-card text-text-muted'}`}>
        {passed ? <CheckCircle2 size={16} /> : <Icon size={16} />}
      </div>
      <div>
        <h4 className={`font-bold ${passed ? 'text-green' : currentStep === num ? 'text-white' : 'text-text-muted'}`}>{title}</h4>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">System Check</h1>
            <p className="text-text-secondary">We need to verify your testing environment before you begin.</p>
          </div>

          <div className="space-y-3">
            <StepItem num={1} title="Desktop Detected" icon={Monitor} currentStep={step} passed={step > 1} />
            
            <div className={`p-4 rounded-2xl border ${step > 2 ? 'bg-green/10 border-green/30' : step === 2 ? 'bg-purple/10 border-purple/30' : 'bg-background border-border opacity-50'}`}>
              <div className="flex items-start gap-4 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step > 2 ? 'bg-green text-black' : step === 2 ? 'bg-purple text-white animate-pulse' : 'bg-card text-text-muted'}`}>
                  {step > 2 ? <CheckCircle2 size={16} /> : <Camera size={16} />}
                </div>
                <div>
                  <h4 className={`font-bold ${step > 2 ? 'text-green' : step === 2 ? 'text-white' : 'text-text-muted'}`}>Camera Permission</h4>
                  {cameraError && <p className="text-xs text-red-500 mt-1">{cameraError}</p>}
                </div>
              </div>
              {step === 2 && !stream && (
                <Button onClick={requestCamera} className="ml-12 bg-purple hover:bg-purple-light text-white">Enable Camera</Button>
              )}
            </div>

            <StepItem num={3} title="Face Detected" icon={User} currentStep={step} passed={faceDetected === 'ok' || step === 5} error={faceDetected === 'none' ? 'No face detected' : faceDetected === 'multiple' ? 'Multiple faces detected' : null} />
            <StepItem num={4} title="Lighting Check" icon={Sun} currentStep={step} passed={lightingOk === 'ok' || step === 5} error={lightingOk === 'dark' ? 'Too dark' : lightingOk === 'bright' ? 'Too bright' : null} />
            <StepItem num={5} title="Ready to Begin" icon={CheckCircle2} currentStep={step} passed={step === 5} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-4 rounded-3xl border border-border bg-card">
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative border border-border">
              <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1]" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              {!stream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
                  <Camera size={48} className="mb-2 opacity-20" />
                  <span className="text-sm">Camera preview</span>
                </div>
              )}
              {stream && (
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-mono flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE
                </div>
              )}
            </div>
            <p className="text-center text-xs text-text-secondary mt-3">This is what the proctor sees</p>
          </div>

          {step === 5 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-3xl border border-purple/30 bg-purple/5">
              <h3 className="font-bold text-white mb-4">Exam Rules</h3>
              <ol className="list-decimal list-inside text-sm text-text-secondary space-y-2 mb-6">
                <li>Stay in fullscreen at all times</li>
                <li>Keep your face visible in camera</li>
                <li>No other person should be in frame</li>
                <li>No mobile phones near the camera</li>
                <li>All shortcuts are disabled</li>
                <li>Exam auto-submits when time runs out</li>
              </ol>
              
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 rounded border-border bg-background checked:bg-purple focus:ring-purple focus:ring-offset-background" />
                <span className="text-sm text-white font-medium">I understand and agree to these rules</span>
              </label>

              <Button size="lg" fullWidth disabled={!agreed || isValidating} isLoading={isValidating} onClick={handleBegin} className="h-14 text-lg font-bold bg-gradient-to-r from-purple to-cyan text-white border-0 shadow-[0_0_20px_rgba(108,99,255,0.3)]">
                Begin Exam &rarr;
              </Button>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  )
}
