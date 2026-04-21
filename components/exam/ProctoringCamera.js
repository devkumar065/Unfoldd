'use client'

import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

export function ProctoringCamera({ stream, examId, onViolation }) {
  const videoRef = useRef(null)
  const [status, setStatus] = useState('ok')

  useEffect(() => {
    if (!stream || !videoRef.current) return
    videoRef.current.srcObject = stream

    let detectionInterval
    videoRef.current.onloadedmetadata = async () => {
      videoRef.current.play()
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models')

      detectionInterval = setInterval(async () => {
        if (!videoRef.current) return
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        
        if (detections.length === 0) {
          setStatus('face_missing')
          onViolation('face_missing', 'warning')
        } else if (detections.length > 1) {
          setStatus('multiple_faces')
          onViolation('multiple_faces', 'critical')
        } else {
          setStatus('ok')
        }
      }, 3000)
    }

    return () => clearInterval(detectionInterval)
  }, [stream, onViolation])

  return (
    <div className="flex flex-col gap-3">
      <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 transition-colors ${status === 'ok' ? 'border-purple/30' : 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'}`}>
        <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1]" playsInline muted />
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-white flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> REC
        </div>
      </div>
      <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border ${status === 'ok' ? 'bg-green/10 text-green border-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
        <div className={`w-2 h-2 rounded-full ${status === 'ok' ? 'bg-green' : 'bg-red-500'}`} />
        {status === 'ok' ? 'Face detected' : status === 'face_missing' ? 'Face not visible' : 'Multiple people detected'}
      </div>
    </div>
  )
}
