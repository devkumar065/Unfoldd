'use client'

import { motion } from 'framer-motion'
import { Award, ChevronRight, Share2, Flame, Briefcase } from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useUser } from '@/hooks/useUser'

export function TestComplete({ test, dayNumber }) {
  const router = useRouter()
  const { width, height } = useWindowSize()
  const { profile } = useUser()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen fixed inset-0 z-50 bg-[#0A0A0F] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <Confetti width={width} height={height} recycle={true} numberOfPieces={200} gravity={0.1} colors={['#6C63FF', '#00D4FF', '#00F5A0', '#FFFFFF']} />
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple/20 via-background to-background pointer-events-none" />

      <motion.div 
        initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-2xl glass p-8 sm:p-12 rounded-[2.5rem] border border-purple/30 bg-card/80 backdrop-blur-2xl shadow-[0_0_50px_rgba(108,99,255,0.15)] relative z-10 flex flex-col items-center text-center mt-10 mb-10"
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(234,179,8,0.4)] border-4 border-yellow-200">
          <Award size={64} className="text-yellow-900" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-2 tracking-tight">Topic Mastered! 🏆</h1>
        <p className="text-lg sm:text-xl text-text-secondary mb-8">{test.topic_title}</p>

        <div className="flex flex-wrap justify-center gap-3 mb-10 w-full">
          {['Easy', 'Medium', 'Hard'].map((lvl, i) => (
            <motion.div key={lvl} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + (i*0.1) }} className="bg-green/10 border border-green/30 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-green-500">{lvl}</span>
              <span className="font-bold text-white">Passed ✅</span>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="w-full bg-cyan/5 border border-cyan/20 rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan/20 blur-3xl rounded-full" />
          <h3 className="text-4xl font-bold text-cyan mb-1">+225 XP</h3>
          <p className="text-sm font-medium text-cyan/70 uppercase tracking-widest">Added to your profile</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="w-full bg-purple/10 border border-purple/20 rounded-2xl p-4 mb-10 flex items-start gap-4 text-left">
          <div className="p-3 bg-purple/20 rounded-xl text-purple-light shrink-0">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-white font-medium mb-1"><span className="font-bold text-purple-light">&apos;{test.topic_title}&apos;</span> has been added to your portfolio as a verified skill.</p>
            <button onClick={() => router.push('/portfolio/edit')} className="text-sm font-bold text-purple hover:text-purple-light hover:underline inline-flex items-center">
              View Portfolio <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>

        {profile?.streak_count > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="flex items-center gap-2 text-orange-500 font-bold mb-8 bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">
            <Flame size={18} /> Streak: {profile.streak_count} days
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="flex flex-col sm:flex-row gap-4 w-full">
          <Button size="lg" onClick={() => router.push(`/dashboard`)} className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-purple to-cyan text-white border-0 shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:shadow-[0_0_30px_rgba(108,99,255,0.5)]">
            Continue to Day {dayNumber + 1} <ChevronRight className="ml-2" />
          </Button>
          <Button size="lg" variant="secondary" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just mastered ${test.topic_title} on Unfoldd! Day ${dayNumber} of my 90-day journey 🚀 #Unfoldd`)}`, '_blank')} className="sm:w-auto h-14 px-6 border-border hover:bg-white hover:text-black">
            <Share2 size={20} />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
