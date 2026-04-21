'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        
        <div className="relative mb-8">
          <div className="text-[120px] md:text-[150px] font-black leading-none select-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Space Grotesk'
            }}>
            404
          </div>
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 right-8 text-4xl"
          >
            🔍
          </motion.div>
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-4 left-8 text-3xl"
          >
            💻
          </motion.div>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
          Page Not Found
        </h1>
        
        <p className="text-white/50 mb-10 text-lg font-medium">
          This page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform">
            Go to Dashboard
          </Link>
          <Link href="/" className="px-8 py-4 bg-white/5 text-white/70 rounded-2xl border border-white/10 hover:text-white hover:bg-white/10 transition-all font-bold">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
