'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function InternshipWidget({ userId }) {
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)

  useEffect(() => {
    if (!userId) return
    fetchInternships()
  }, [userId])

  async function fetchInternships() {
    try {
      const res = await fetch('/api/internships/match')
      const data = await res.json()
      setInternships(
        (data.internships || []).slice(0, 3))
    } catch(e) {
      console.error('Internship fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleApply(internship) {
    setApplying(internship.id)
    try {
      const res = await fetch('/api/internships/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internshipId: internship.id,
          matchPercentage: internship.match_percentage || 0
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Application sent!')
        setInternships(prev => prev.map(i =>
          i.id === internship.id 
            ? { ...i, applied: true } : i
        ))
      } else {
        toast.error(data.error || 'Failed to apply')
      }
    } catch(e) {
      toast.error('Error applying')
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="bg-[#12121A] border border-white/5 
      rounded-2xl p-5">
      <div className="flex items-center justify-between 
        mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg 
            bg-cyan-500/10 flex items-center 
            justify-center">
            <Briefcase size={14} 
              className="text-cyan-400" />
          </div>
          <h3 className="text-white font-bold text-sm">
            Matched For You
          </h3>
        </div>
        <Link href="/internships">
          <span className="text-purple-400 text-xs 
            hover:text-purple-300 transition-colors
            flex items-center gap-1">
            View All
            <ArrowRight size={12} />
          </span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} 
              className="h-16 rounded-xl bg-white/5 
                animate-pulse" />
          ))}
        </div>
      ) : internships.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-10 h-10 rounded-xl 
            bg-white/5 flex items-center 
            justify-center mx-auto mb-3">
            <Briefcase size={18} 
              className="text-white/20" />
          </div>
          <p className="text-white/30 text-xs">
            Complete more missions to unlock 
            internship matches
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {internships.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-xl bg-white/3 
                border border-white/5 
                hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start 
                justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-white text-xs 
                    font-semibold truncate">
                    {job.company_name}
                  </p>
                  <p className="text-white/40 
                    text-[10px] truncate">
                    {job.role}
                  </p>
                </div>
                <span className={`text-[10px] 
                  font-bold px-2 py-0.5 rounded-full
                  flex-shrink-0
                  ${(job.match_percentage || 0) >= 80
                    ? 'bg-green-500/20 text-green-400'
                    : (job.match_percentage || 0) >= 60
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-white/10 text-white/40'}`}>
                  {job.match_percentage || 0}%
                </span>
              </div>

              <div className="flex items-center 
                justify-between">
                <span className="text-white/30 
                  text-[10px]">
                  {job.is_remote ? 'Remote' : job.location}
                  {job.stipend_min && job.stipend_max
                    ? ` · ₹${Math.round(job.stipend_min/1000)}k`
                    : ''}
                </span>
                <button
                  onClick={() => handleApply(job)}
                  disabled={applying === job.id 
                    || job.applied}
                  className={`text-[10px] font-medium
                    px-2.5 py-1 rounded-lg 
                    transition-colors
                    ${job.applied
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                    }
                    disabled:opacity-50`}
                >
                  {job.applied 
                    ? 'Applied' 
                    : applying === job.id 
                    ? '...' 
                    : 'Apply'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
