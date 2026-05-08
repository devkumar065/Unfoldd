'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, CheckCircle, Clock, 
  Plus, Search 
} from 'lucide-react'
import { createClientComponentClient }
  from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

export default function SkillsGrid({ 
  initialSkills = [], 
  userId 
}) {
  const [skills, setSkills] = useState(initialSkills)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [examModal, setExamModal] = useState(null)
  const [generatingExam, setGeneratingExam] = 
    useState(null)

  // Update when props change
  useEffect(() => {
    setSkills(initialSkills)
  }, [initialSkills])

  async function generateExam(skill) {
    setGeneratingExam(skill.id)
    try {
      const res = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: skill.id,
          skillName: skill.skill_name
        })
      })
      const data = await res.json()
      if (data.success) {
        setExamModal({
          skill,
          examLink: data.examLink,
          expiresAt: data.expiresAt
        })
      } else {
        toast.error(data.error || 'Failed to generate exam')
      }
    } catch(e) {
      toast.error('Error generating exam')
    } finally {
      setGeneratingExam(null)
    }
  }

  const filtered = skills.filter(skill => {
    const matchesFilter = filter === 'all' ||
      (filter === 'learned' && skill.is_learned) ||
      (filter === 'verified' && skill.is_verified)
    const matchesSearch = !search || 
      skill.skill_name.toLowerCase()
        .includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'learned', label: 'Learned' },
    { value: 'verified', label: 'Verified' },
  ]

  return (
    <div className="bg-[#12121A] border border-white/5 
      rounded-2xl p-5">

      {/* Header */}
      <div className="flex items-center justify-between 
        mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg 
            bg-purple-500/10 flex items-center 
            justify-center">
            <Star size={14} className="text-purple-400" />
          </div>
          <h3 className="text-white font-bold text-sm">
            My Skills
          </h3>
          <span className="text-white/30 text-xs">
            {skills.length}
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg 
                text-xs font-medium transition-colors
                ${filter === f.value
                  ? 'bg-purple-600 text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-2xl 
            bg-purple-500/10 flex items-center 
            justify-center mx-auto mb-3">
            <Star size={24} 
              className="text-purple-400/50" />
          </div>
          <p className="text-white/50 text-sm 
            font-medium mb-1">
            {filter === 'all' 
              ? 'No skills yet'
              : `No ${filter} skills yet`}
          </p>
          <p className="text-white/25 text-xs">
            {filter === 'all'
              ? 'Complete daily missions to earn skills'
              : `Complete missions to add ${filter} skills`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 
          gap-3">
          {filtered.map((skill, i) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`relative p-3 rounded-xl 
                border transition-all duration-200
                ${skill.is_verified
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-white/5 bg-white/3 hover:bg-white/5'}`}
            >
              {/* Skill name */}
              <p className="text-white text-xs 
                font-semibold mb-1 truncate">
                {skill.skill_name}
              </p>

              {/* Category */}
              {skill.category && (
                <p className="text-white/30 text-[10px] 
                  mb-2 capitalize truncate">
                  {skill.category.replace(/_/g, ' ')}
                </p>
              )}

              {/* Status */}
              {skill.is_verified ? (
                <div className="flex items-center gap-1">
                  <CheckCircle size={11} 
                    className="text-green-400" />
                  <span className="text-green-400 
                    text-[10px] font-medium">
                    Verified
                  </span>
                </div>
              ) : skill.is_learned ? (
                <button
                  onClick={() => generateExam(skill)}
                  disabled={generatingExam === skill.id}
                  className="flex items-center gap-1
                    text-purple-400 hover:text-purple-300
                    transition-colors"
                >
                  <Clock size={11} />
                  <span className="text-[10px] font-medium">
                    {generatingExam === skill.id
                      ? 'Generating...'
                      : 'Verify Now'}
                  </span>
                </button>
              ) : null}
            </motion.div>
          ))}
        </div>
      )}

      {/* Exam modal */}
      {examModal && (
        <ExamLinkModal
          skill={examModal.skill}
          examLink={examModal.examLink}
          expiresAt={examModal.expiresAt}
          onClose={() => setExamModal(null)}
        />
      )}
    </div>
  )
}

function ExamLinkModal({ skill, examLink, 
  expiresAt, onClose }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(examLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 
      backdrop-blur-sm z-50 flex items-center 
      justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0D0D16] border border-white/10
          rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center 
          justify-between mb-5">
          <div>
            <h3 className="text-white font-bold">
              Exam Ready
            </h3>
            <p className="text-white/40 text-sm">
              {skill.skill_name}
            </p>
          </div>
          <button onClick={onClose}
            className="text-white/30 hover:text-white
              text-xl leading-none transition-colors">
            ×
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border 
          border-blue-500/20 rounded-xl p-4 mb-4">
          <p className="text-blue-400 text-xs 
            leading-relaxed">
            Open this link on your laptop. 
            Camera access required. 
            Link expires in 1 hour.
          </p>
        </div>

        {/* Link */}
        <div className="bg-[#0A0A0F] border 
          border-white/10 rounded-xl p-3 mb-4
          flex items-center gap-3">
          <p className="text-white/60 text-xs 
            flex-1 truncate font-mono">
            {examLink}
          </p>
          <button
            onClick={copyLink}
            className="text-xs px-3 py-1.5 
              bg-purple-600 text-white rounded-lg
              hover:bg-purple-500 transition-colors
              flex-shrink-0"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* QR Code */}
        <div className="text-center mb-4">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(examLink)}`}
            alt="QR Code"
            className="w-32 h-32 mx-auto rounded-xl"
          />
          <p className="text-white/30 text-xs mt-2">
            Scan on your laptop/desktop
          </p>
        </div>

        <button onClick={onClose}
          className="w-full py-2.5 border 
            border-white/10 text-white/50 
            rounded-xl text-sm hover:text-white
            transition-colors">
          Close
        </button>
      </motion.div>
    </div>
  )
}
