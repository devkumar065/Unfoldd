'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className="text-8xl mb-6"
        >
          😵
        </motion.div>
        
        <h1 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Space Grotesk' }}>
          Something Went Wrong
        </h1>
        
        <p className="text-white/50 mb-8 font-medium leading-relaxed">
          We hit an unexpected error. Don&apos;t worry — your progress is saved. Try refreshing the page.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 text-left overflow-x-auto">
            <code className="text-red-400 text-xs font-mono">
              {error.message}
            </code>
          </div>
        )}
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20"
          >
            Try Again
          </button>
          <a href="/dashboard" className="px-8 py-3 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
