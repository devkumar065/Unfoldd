'use client'

import { useState, useEffect } from 'react'
import { Smartphone, Copy, CheckCircle2 } from 'lucide-react'

import Image from 'next/image'

export function MobileBlockScreen({ expiresAt }) {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState('')
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    setUrl(window.location.href)
    
    const timer = setInterval(() => {
      const remaining = new Date(expiresAt) - new Date()
      if (remaining > 0) {
        const m = Math.floor((remaining / 1000) / 60)
        const s = Math.floor((remaining / 1000) % 60)
        setTimeLeft(`${m}m ${s}s`)
      } else {
        setTimeLeft('Expired')
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6 relative">
        <Smartphone size={40} />
        <div className="absolute top-0 right-0 w-8 h-8 bg-background rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">X</div>
        </div>
      </div>

      <h1 className="text-3xl font-display font-bold text-white mb-4">Desktop Required</h1>
      <p className="text-text-secondary text-lg max-w-md mb-10 leading-relaxed">
        This proctored exam must be taken on a laptop or desktop computer. Mobile devices are not supported for exam security reasons.
      </p>

      <div className="glass p-8 rounded-3xl border border-border w-full max-w-md bg-card mb-8">
        <h3 className="font-bold text-white mb-6 text-left">How to take this exam:</h3>
        <ol className="text-left space-y-4 text-text-secondary text-sm mb-8 list-decimal list-inside">
          <li>Copy the link below</li>
          <li>Open it on your laptop or desktop</li>
          <li>Ensure your camera is working</li>
          <li>Complete the exam within 1 hour</li>
        </ol>

        <div className="bg-background border border-border p-2 rounded-xl flex items-center gap-2 mb-6">
          <div className="flex-1 truncate text-xs text-text-muted px-2 select-all">{url}</div>
          <button onClick={handleCopy} className="h-10 px-4 bg-purple text-white rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-purple-light transition-colors">
            {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>

        <div className="pt-6 border-t border-border flex flex-col items-center">
          <p className="text-xs font-bold text-text-muted uppercase mb-4">Or scan this QR code on your desktop:</p>
          <div className="p-2 bg-white rounded-xl">
            {url && <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`} width={150} height={150} alt="QR Code" unoptimized />}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 font-medium text-sm">
        ⚠️ This link expires in {timeLeft}
      </div>
    </div>
  )
}
