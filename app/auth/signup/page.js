'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

import Image from 'next/image'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const LOGO_URL = "https://srklrlzewvozsvebzgvm.supabase.co/storage/v1/object/public/avatars/icon.png"

function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particles = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const numParticles = Math.floor((canvas.width * canvas.height) / 15000)
      for (let i = 0; i < Math.min(numParticles, 80); i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? '#6C63FF' : '#00D4FF'
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(108, 99, 255, ${1 - dist / 100})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    resize()
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
    />
  )
}

function ProgressCard() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => (s + 1) % 4)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const milestones = [
    { day: "Day 1", title: "Start Mission" },
    { day: "Day 30", title: "First Project" },
    { day: "Day 90", title: "Job Ready" }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass p-6 rounded-2xl w-full max-w-sm mt-12 border-purple/20 shadow-xl"
    >
      <div className="flex flex-col gap-6 relative">
        <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-border z-0" />
        {milestones.map((m, i) => (
          <div key={i} className="flex items-center gap-4 relative z-10">
            <motion.div 
              className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                step > i ? "bg-green text-black border-green" : 
                step === i ? "bg-purple text-white border-purple animate-pulse" : 
                "bg-card border-border text-text-muted"
              )}
            >
              {step > i ? <CheckCircle2 size={20} /> : <span className="text-xs font-bold">{i+1}</span>}
            </motion.div>
            <div className="flex-1">
              <p className={cn("text-sm font-bold", step >= i ? "text-white" : "text-text-muted")}>{m.day}</p>
              <p className={cn("text-xs", step >= i ? "text-cyan" : "text-text-muted")}>{m.title}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function Signup() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema)
  })

  const passwordValue = watch('password', '')

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const getPasswordStrength = (pass) => {
    let score = 0
    if (!pass) return { score: 0, label: 'Too short', color: 'bg-border' }
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score === 2 || score === 3) return { score, label: 'Fair', color: 'bg-yellow-500' }
    return { score, label: 'Strong', color: 'bg-green' }
  }

  const strength = getPasswordStrength(passwordValue)

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create initial profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          onboarding_completed: false
        })
        
        if (profileError) throw profileError
      }

      toast.success('Account created successfully!')
      router.push('/onboarding')
    } catch (error) {
      toast.error(error.message || 'Failed to create account')
      triggerShake()
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen flex bg-background flex-col-reverse lg:flex-row">
      {/* Left Panel - Signup Form */}
      <motion.div 
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
        className="w-full lg:w-[40%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative bg-card py-12 lg:py-0 min-h-screen lg:min-h-0 overflow-y-auto"
      >
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <Image src={LOGO_URL} width={32} height={32} alt="Unfoldd" className="rounded-lg shadow-[0_0_15px_rgba(108,99,255,0.5)] object-contain bg-white/5 p-1" />
          <span className="text-xl flex items-center" style={{ fontFamily: 'Space Grotesk' }}>
            <span className="text-white font-black">Unfol</span>
            <span style={{
              background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900
            }}>
              dd
            </span>
          </span>
        </div>

        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto pt-12 lg:pt-0"
        >
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-white mb-3">Join Unfoldd</h2>
            <p className="text-text-secondary">Start your journey today</p>
          </div>

          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition-colors mb-6"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-text-muted text-sm">or with email</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1 relative group pt-2">
              <input
                {...register('fullName')}
                type="text"
                id="fullName"
                className="w-full h-14 bg-background border border-border rounded-xl px-4 text-white outline-none focus:border-purple focus:ring-1 focus:ring-purple/50 transition-all peer pt-5 pb-1"
                placeholder=" "
              />
              <label 
                htmlFor="fullName"
                className="absolute left-4 top-[calc(50%+4px)] -translate-y-1/2 text-text-muted text-sm transition-all peer-focus:top-4 peer-focus:text-[11px] peer-focus:text-purple peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:-translate-y-0 pointer-events-none"
              >
                Full Name
              </label>
              <AnimatePresence>
                {errors.fullName && (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-xs pl-1 absolute -bottom-5">
                    {errors.fullName.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email */}
            <div className="space-y-1 relative group pt-2">
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full h-14 bg-background border border-border rounded-xl px-4 text-white outline-none focus:border-purple focus:ring-1 focus:ring-purple/50 transition-all peer pt-5 pb-1"
                placeholder=" "
              />
              <label 
                htmlFor="email"
                className="absolute left-4 top-[calc(50%+4px)] -translate-y-1/2 text-text-muted text-sm transition-all peer-focus:top-4 peer-focus:text-[11px] peer-focus:text-purple peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:-translate-y-0 pointer-events-none"
              >
                Email address
              </label>
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-xs pl-1 absolute -bottom-5">
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div className="space-y-1 relative group pt-2">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="w-full h-14 bg-background border border-border rounded-xl px-4 text-white outline-none focus:border-purple focus:ring-1 focus:ring-purple/50 transition-all peer pt-5 pb-1 pr-12"
                placeholder=" "
              />
              <label 
                htmlFor="password"
                className="absolute left-4 top-[calc(50%+4px)] -translate-y-1/2 text-text-muted text-sm transition-all peer-focus:top-4 peer-focus:text-[11px] peer-focus:text-purple peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:-translate-y-0 pointer-events-none"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[18px] text-text-muted hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              
              {/* Strength Indicator */}
              {passwordValue.length > 0 && (
                <div className="pt-2">
                  <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-background">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div 
                        key={i} 
                        className={cn("flex-1", i <= strength.score ? strength.color : 'bg-border')}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                  <p className={cn("text-xs mt-1 text-right", strength.color.replace('bg-', 'text-'))}>{strength.label}</p>
                </div>
              )}
              
              <AnimatePresence>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-xs pl-1">
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 relative group pt-2">
              <input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="w-full h-14 bg-background border border-border rounded-xl px-4 text-white outline-none focus:border-purple focus:ring-1 focus:ring-purple/50 transition-all peer pt-5 pb-1"
                placeholder=" "
              />
              <label 
                htmlFor="confirmPassword"
                className="absolute left-4 top-[calc(50%+4px)] -translate-y-1/2 text-text-muted text-sm transition-all peer-focus:top-4 peer-focus:text-[11px] peer-focus:text-purple peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:-translate-y-0 pointer-events-none"
              >
                Confirm Password
              </label>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-xs pl-1 absolute -bottom-5">
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Terms */}
            <div className="pt-4 flex items-start gap-2">
              <input
                {...register('terms')}
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border-border bg-background checked:bg-purple checked:border-purple focus:ring-purple focus:ring-offset-background"
              />
              <label htmlFor="terms" className="text-sm text-text-secondary">
                I agree to the <Link href="/terms" className="text-purple hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-purple hover:underline">Privacy Policy</Link>
              </label>
            </div>
            <AnimatePresence>
              {errors.terms && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-xs pl-1">
                  {errors.terms.message}
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="bg-gradient-to-r from-purple to-purple-dark text-white shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:shadow-[0_0_25px_rgba(108,99,255,0.5)] transition-all border-0 h-12 mt-2"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center mt-6 text-text-secondary text-sm pb-8 lg:pb-0">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* Right Panel - Hidden on mobile */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="hidden lg:flex w-[60%] relative flex-col justify-center items-center overflow-hidden border-l border-border bg-[#07070A]"
      >
        <ParticleBackground />
        
        <div className="absolute top-8 right-8 flex items-center gap-2">
          <span className="text-xl flex items-center" style={{ fontFamily: 'Space Grotesk' }}>
            <span className="text-white font-black">Unfol</span>
            <span style={{
              background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900
            }}>
              dd
            </span>
          </span>
          <Image src="/logo.png" width={32} height={32} alt="Unfoldd" className="rounded-lg shadow-[0_0_15px_rgba(108,99,255,0.5)] object-contain bg-white/5 p-1" />
        </div>

        <div className="relative z-10 max-w-xl px-12 text-center flex flex-col items-center">
        <h1 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
            Start Unfolding Today
          </h1>
          <motion.p
            className="text-text-secondary text-lg mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Transform your future with AI-guided learning
          </motion.p>
          
          <ProgressCard />
        </div>
      </motion.div>
    </div>
  )
}
