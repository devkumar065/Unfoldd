'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ChevronRight, ChevronLeft, CheckCircle2, Calendar as CalendarIcon, Clock, Briefcase, Code, Shield, Brain, Zap, Palette, Trash2, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

const STEPS = [
  { id: 1, title: 'Profile', icon: '👤' },
  { id: 2, title: 'Schedule', icon: '📅' },
  { id: 3, title: 'Exams', icon: '📝' },
  { id: 4, title: 'Role', icon: '🎯' },
  { id: 5, title: 'Time', icon: '⏱️' }
]

const ROLES = [
  { id: 'fullstack', icon: Code, title: 'Full Stack Developer', desc: 'Build complete web applications', salary: '₹8-20 LPA', demand: 'High Demand 🔥' },
  { id: 'sde', icon: Briefcase, title: 'Software Engineer (SDE)', desc: 'Core programming & algorithms', salary: '₹10-25 LPA', demand: 'Very High Demand 🚀' },
  { id: 'cybersecurity', icon: Shield, title: 'Cybersecurity Analyst', desc: 'Protect systems & hunt threats', salary: '₹6-18 LPA', demand: 'Growing Fast 📈' },
  { id: 'data_science', icon: Brain, title: 'Data Science / ML', desc: 'Build AI models & analyze data', salary: '₹10-30 LPA', demand: 'Highest Demand 💎' },
  { id: 'devops', icon: Zap, title: 'DevOps / Cloud', desc: 'Automate & scale infrastructure', salary: '₹8-22 LPA', demand: 'High Demand 🔥' },
  { id: 'uiux', icon: Palette, title: 'UI/UX Designer', desc: 'Design beautiful experiences', salary: '₹5-15 LPA', demand: 'Steady Demand ✨' }
]

const TIME_OPTIONS = [
  { id: 30, label: '30 Minutes', desc: 'Quick learner — basics + 1 task', pace: '🏃 Light pace | Ready in 6 months', recommended: false },
  { id: 60, label: '1 Hour', desc: 'Balanced — theory + practice daily', pace: '⚡ Steady pace | Ready in 3 months', recommended: true },
  { id: 90, label: '1.5 Hours', desc: 'Dedicated — deep dives + projects', pace: '🔥 Fast pace | Ready in 2 months', recommended: false },
  { id: 120, label: '2+ Hours', desc: 'Intensive — full stack daily grind', pace: '🚀 Rocket pace | Ready in 6 weeks', recommended: false }
]

export default function Onboarding() {
  const router = useRouter()
  const { user, profile, loading: userLoading } = useUser()
  const { width, height } = useWindowSize()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1) // 1 for right, -1 for left
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const [formData, setFormData] = useState({
    college: '',
    year: '',
    branch: '',
    avatarUrl: null,
    classTimings: [],
    examDates: [],
    targetRole: '',
    dailyTime: 60
  })

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('unfoldd_onboarding')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(parsed.data || {})
        if (parsed.step && parsed.step > 0 && parsed.step <= 5) {
          setStep(parsed.step)
        }
      } catch (e) {
        console.error('Failed to parse saved onboarding state')
      }
    }
  }, [])

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('unfoldd_onboarding', JSON.stringify({ step, data: formData }))
  }, [step, formData])

  // Redirect if already onboarded
  useEffect(() => {
    if (!userLoading && profile?.onboarding_completed) {
      router.push('/dashboard')
    }
  }, [userLoading, profile, router])

  const handleNext = () => {
    if (step === 1 && (!formData.college || !formData.year || !formData.branch)) {
      toast.error('Please fill in all profile details')
      return
    }
    if (step === 4 && !formData.targetRole) {
      toast.error('Please select a target role')
      return
    }
    
    if (step < 5) {
      setDirection(1)
      setStep(s => s + 1)
    } else {
      handleGenerateRoadmap()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1)
      setStep(s => s - 1)
    }
  }

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true)
    setGenerationStep(0)

    const generationSteps = [
      "Analyzing your profile...",
      "Mapping skill requirements...",
      "Building your personalized plan...",
      "Scheduling around your classes...",
      "Your roadmap is ready!"
    ]

    // Simulate generation steps visually
    for (let i = 0; i < generationSteps.length; i++) {
      setGenerationStep(i)
      await new Promise(r => setTimeout(r, 800))
    }

    try {
      const res = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_role: formData.targetRole,
          year: parseInt(formData.year),
          branch: formData.branch,
          college: formData.college,
          daily_time_minutes: formData.dailyTime,
          class_timings: formData.classTimings,
          exam_dates: formData.examDates
        })
      })

      if (!res.ok) {
        throw new Error('Failed to generate roadmap')
      }

      localStorage.removeItem('unfoldd_onboarding')
      setShowConfetti(true)
      
      // Give time for confetti before redirect
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 4000)

    } catch (error) {
      toast.error(error.message)
      setIsGenerating(false)
    }
  }

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    })
  }

  if (userLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-purple h-8 w-8" /></div>
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} />}
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple/20 via-background to-background" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 glass p-10 rounded-3xl max-w-lg w-full flex flex-col items-center text-center border-purple/30 shadow-[0_0_50px_rgba(108,99,255,0.15)]"
        >
          {showConfetti ? (
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
                <div className="w-24 h-24 bg-green/20 rounded-full flex items-center justify-center text-green mx-auto">
                   <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-display font-bold text-white mt-6 mb-2">Your Journey on Unfoldd Begins!</h2>
                <p className="text-text-secondary mb-8">We&apos;ve crafted the perfect plan for you.</p>
                <Button size="lg" onClick={() => router.push('/dashboard')} className="px-8 text-lg font-bold shadow-[0_0_20px_rgba(108,99,255,0.4)] hover:shadow-[0_0_30px_rgba(108,99,255,0.6)] group">
                  Start Day 1 <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
             </motion.div>
          ) : (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="w-24 h-24 mb-8 text-purple-light"
              >
                <Brain size={96} strokeWidth={1} />
              </motion.div>
              
              <h2 className="text-2xl font-display font-bold text-white mb-8">Unfoldd is building your roadmap...</h2>
              
              <div className="w-full space-y-4 text-left">
                {[
                  "Analyzing your profile...",
                  "Mapping skill requirements...",
                  "Building your personalized plan...",
                  "Scheduling around your classes...",
                  "Your roadmap is ready!"
                ].map((text, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: generationStep >= idx ? 1 : 0.3, 
                      x: generationStep >= idx ? 0 : -10 
                    }}
                    className="flex items-center gap-3"
                  >
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 border", 
                      generationStep > idx ? "bg-green border-green text-black" : 
                      generationStep === idx ? "border-purple text-purple animate-pulse" : 
                      "border-border text-border"
                    )}>
                      {generationStep > idx ? <CheckCircle2 size={14} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <span className={cn("font-medium", generationStep >= idx ? "text-white" : "text-text-muted")}>{text}</span>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Progress Bar */}
      <div className="w-full pt-8 px-6 lg:px-24 max-w-5xl mx-auto z-20">
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-border z-0" />
          <motion.div 
            className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-purple z-0 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: (step - 1) / (STEPS.length - 1) }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
          
          {STEPS.map((s, idx) => {
            const isCompleted = step > s.id
            const isCurrent = step === s.id
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                <motion.div 
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted ? '#6C63FF' : isCurrent ? '#12121A' : '#12121A',
                    borderColor: isCompleted || isCurrent ? '#6C63FF' : '#1E1E2E',
                    scale: isCurrent ? 1.2 : 1
                  }}
                  className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors", 
                    isCompleted ? "text-white shadow-[0_0_15px_rgba(108,99,255,0.4)]" : 
                    isCurrent ? "text-purple shadow-[0_0_10px_rgba(108,99,255,0.2)] bg-card glass" : 
                    "text-text-muted bg-card"
                  )}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : s.icon}
                </motion.div>
                <span className={cn("text-xs font-medium absolute -bottom-6 whitespace-nowrap hidden sm:block", isCurrent ? "text-purple" : "text-text-muted")}>
                  {s.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 w-full max-w-4xl mx-auto mt-12 mb-24 px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex-1 flex flex-col justify-center"
          >
            <div className="glass p-6 md:p-10 rounded-3xl border border-border shadow-xl bg-card/60 backdrop-blur-xl">
              {/* --- STEP 1: Profile --- */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">Tell us about yourself 👋</h2>
                    <p className="text-text-secondary">We&apos;ll personalize your entire roadmap based on this.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white ml-1">College/University Name</label>
                      <input 
                        type="text" 
                        value={formData.college}
                        onChange={e => setFormData({...formData, college: e.target.value})}
                        className="w-full h-12 bg-background/50 border border-border rounded-xl px-4 text-white outline-none focus:border-purple focus:ring-1 focus:ring-purple/50 transition-all"
                        placeholder="e.g. VIT Vellore, AKTU Lucknow"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white ml-1">Current Year</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['1st', '2nd', '3rd', '4th'].map(y => (
                          <button
                            key={y}
                            onClick={() => setFormData({...formData, year: y})}
                            className={cn("h-12 rounded-xl font-medium transition-all border", 
                              formData.year === y 
                                ? "bg-purple/10 border-purple text-purple shadow-[0_0_15px_rgba(108,99,255,0.15)]" 
                                : "bg-background/50 border-border text-text-secondary hover:border-border hover:bg-border/50"
                            )}
                          >
                            {y} Year
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white ml-1">Branch/Specialization</label>
                      <select 
                        value={formData.branch}
                        onChange={e => setFormData({...formData, branch: e.target.value})}
                        className="w-full h-12 bg-background/50 border border-border rounded-xl px-4 text-white outline-none focus:border-purple focus:ring-1 focus:ring-purple/50 transition-all appearance-none"
                      >
                        <option value="" disabled hidden>Select your branch</option>
                        <option value="Computer Science">Computer Science / IT</option>
                        <option value="Electronics">Electronics & Comm (ECE)</option>
                        <option value="Electrical">Electrical (EEE)</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* --- STEP 2: Schedule --- */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">When are your classes? 📅</h2>
                    <p className="text-text-secondary">We&apos;ll schedule your daily missions around your timetable.</p>
                  </div>

                  <div className="overflow-x-auto pb-4">
                    <div className="min-w-[600px] border border-border rounded-xl overflow-hidden bg-background/30">
                      <div className="grid grid-cols-[100px_repeat(10,1fr)] border-b border-border bg-card/80">
                        <div className="p-3 text-xs font-bold text-text-muted border-r border-border">Day</div>
                        {['8', '9', '10', '11', '12', '1', '2', '3', '4', '5'].map(h => (
                          <div key={h} className="p-3 text-xs font-bold text-text-muted text-center border-r border-border last:border-0">{h}{parseInt(h) >= 8 && parseInt(h) <= 11 ? 'am' : 'pm'}</div>
                        ))}
                      </div>
                      
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="grid grid-cols-[100px_repeat(10,1fr)] border-b border-border last:border-0">
                          <div className="p-3 text-sm font-medium text-white border-r border-border bg-card/40 flex items-center">{day}</div>
                          {['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'].map(slot => {
                            const isBusy = formData.classTimings.some(t => t.day === day && t.slots.includes(slot))
                            return (
                              <button
                                key={slot}
                                onClick={() => {
                                  const newTimings = [...formData.classTimings]
                                  const dayIndex = newTimings.findIndex(t => t.day === day)
                                  if (dayIndex >= 0) {
                                    if (isBusy) {
                                      newTimings[dayIndex].slots = newTimings[dayIndex].slots.filter(s => s !== slot)
                                    } else {
                                      newTimings[dayIndex].slots.push(slot)
                                    }
                                  } else {
                                    newTimings.push({ day, slots: [slot] })
                                  }
                                  setFormData({...formData, classTimings: newTimings})
                                }}
                                className={cn("h-12 border-r border-border last:border-0 transition-colors duration-200", 
                                  isBusy ? "bg-purple/80 border-purple-light/50" : "hover:bg-border/30"
                                )}
                              />
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-purple/10 border border-purple/20 text-purple-light text-sm font-medium">
                    <Clock size={18} />
                    <span>Select the blocks when you are in class. We&apos;ll use the empty slots for learning.</span>
                  </div>
                </div>
              )}

              {/* --- STEP 3: Exams --- */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">Any upcoming exams? 📝</h2>
                    <p className="text-text-secondary">We automatically reduce your mission load 3 days before any exam.</p>
                  </div>

                  <div className="space-y-4">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault()
                        const sub = e.target.subject.value
                        const date = e.target.date.value
                        if (sub && date) {
                          setFormData({...formData, examDates: [...formData.examDates, { subject: sub, date }]})
                          e.target.reset()
                        }
                      }}
                      className="flex flex-col sm:flex-row gap-3"
                    >
                      <input 
                        name="subject"
                        type="text" 
                        placeholder="Subject name (e.g. Data Structures)"
                        className="flex-1 h-12 bg-background border border-border rounded-xl px-4 text-white outline-none focus:border-purple"
                        required
                      />
                      <input 
                        name="date"
                        type="date" 
                        className="sm:w-48 h-12 bg-background border border-border rounded-xl px-4 text-white outline-none focus:border-purple [color-scheme:dark]"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <Button type="submit" variant="secondary" className="h-12 border-border hover:bg-white hover:text-black hover:border-white transition-colors">
                        Add Exam
                      </Button>
                    </form>

                    <div className="space-y-3 mt-6">
                      <AnimatePresence>
                        {formData.examDates.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="p-8 text-center border-2 border-dashed border-border rounded-2xl text-text-muted"
                          >
                            <CalendarIcon size={32} className="mx-auto mb-3 opacity-50" />
                            <p>No exams added yet. Missions will run at full intensity! 💪</p>
                          </motion.div>
                        ) : (
                          formData.examDates.map((exam, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border glass shadow-sm"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex flex-col items-center justify-center border border-orange-500/20 text-orange-500">
                                  <span className="text-[10px] uppercase font-bold leading-none">{new Date(exam.date).toLocaleString('default', { month: 'short' })}</span>
                                  <span className="text-sm font-bold leading-none mt-0.5">{new Date(exam.date).getDate()}</span>
                                </div>
                                <span className="font-medium text-white">{exam.subject}</span>
                              </div>
                              <button 
                                onClick={() => setFormData({...formData, examDates: formData.examDates.filter((_, idx) => idx !== i)})}
                                className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}

              {/* --- STEP 4: Target Role --- */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">What&apos;s your target role? 🎯</h2>
                    <p className="text-text-secondary">Your entire 90-day roadmap will be built around this single goal.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ROLES.map(role => {
                      const isSelected = formData.targetRole === role.id
                      return (
                        <motion.div
                          key={role.id}
                          whileHover={{ y: -4, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({...formData, targetRole: role.id})}
                          className={cn(
                            "cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden",
                            isSelected 
                              ? "bg-purple/10 border-purple shadow-[0_0_20px_rgba(108,99,255,0.2)]" 
                              : "bg-background/50 border-border hover:border-purple/50 glass"
                          )}
                        >
                          <div className="flex gap-4">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                              isSelected ? "bg-purple text-white border-purple-light" : "bg-card text-text-muted border-border"
                            )}>
                              <role.icon size={24} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-white text-lg mb-1">{role.title}</h3>
                              <p className="text-sm text-text-secondary mb-3 leading-snug">{role.desc}</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs px-2 py-1 rounded bg-card border border-border text-white font-medium">{role.salary}</span>
                                <span className="text-xs px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-500 font-medium">{role.demand}</span>
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute top-4 right-4 text-purple">
                              <CheckCircle2 size={24} className="fill-current text-background" />
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* --- STEP 5: Time --- */}
              {step === 5 && (
                <div className="space-y-8">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">How much time daily? ⏱️</h2>
                    <p className="text-text-secondary">Be honest — consistency beats intensity. You can change this later.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {TIME_OPTIONS.map(opt => {
                      const isSelected = formData.dailyTime === opt.id
                      return (
                        <motion.div
                          key={opt.id}
                          whileHover={{ y: -2 }}
                          onClick={() => setFormData({...formData, dailyTime: opt.id})}
                          className={cn(
                            "cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden",
                            isSelected 
                              ? "bg-purple/10 border-purple shadow-[0_0_20px_rgba(108,99,255,0.2)]" 
                              : "bg-background/50 border-border hover:border-purple/50 glass"
                          )}
                        >
                          {opt.recommended && (
                            <div className="absolute top-0 right-0 bg-purple text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                              Recommended
                            </div>
                          )}
                          <h3 className="font-display font-bold text-2xl text-white mb-1">{opt.label}</h3>
                          <p className="text-sm font-medium text-purple-light mb-2">{opt.desc}</p>
                          <p className="text-xs text-text-secondary">{opt.pace}</p>
                          
                          {isSelected && (
                            <motion.div layoutId="timeSelectIndicator" className="absolute inset-0 border-2 border-purple rounded-2xl pointer-events-none" />
                          )}
                        </motion.div>
                      )
                    })}
                  </div>

                  <motion.div 
                    key={formData.dailyTime}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-cyan/10 to-purple/10 border border-cyan/20 flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="text-cyan animate-pulse" size={24} />
                      <div>
                        <p className="text-sm text-text-secondary">In 90 days you will have:</p>
                        <p className="font-bold text-white text-lg">
                          {formData.dailyTime === 30 ? '15+ Skills & 2 Projects' : 
                           formData.dailyTime === 60 ? '25+ Skills & 4 Projects' : 
                           formData.dailyTime === 90 ? '35+ Skills & 6 Projects' : 'Full Stack Master & 8+ Projects'}
                        </p>
                      </div>
                    </div>
                    <div className="h-10 px-4 rounded-lg bg-card/80 border border-border flex items-center justify-center font-bold text-sm">
                      ~{formData.dailyTime * 90 / 60} hours total
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-md border-t border-border z-30">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className={cn("text-text-secondary hover:text-white", step === 1 && "opacity-0 pointer-events-none")}
          >
            <ChevronLeft className="mr-2" size={18} /> Back
          </Button>

          <Button 
            onClick={handleNext}
            size="lg"
            className={cn(
              "px-8 font-medium transition-all",
              step === 5 
                ? "bg-gradient-to-r from-purple to-purple-dark shadow-[0_0_20px_rgba(108,99,255,0.4)] hover:shadow-[0_0_30px_rgba(108,99,255,0.6)] border-0 text-white" 
                : "bg-white text-black hover:bg-gray-200"
            )}
          >
            {step === 5 ? (
              <>Generate My Roadmap <Sparkles className="ml-2 w-4 h-4" /></>
            ) : (
              <>Continue <ChevronRight className="ml-2 w-4 h-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}