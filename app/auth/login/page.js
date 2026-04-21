'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Brain, Shield, Target } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

import Image from 'next/image'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
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

export default function Login() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) throw error

      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error(error.message || 'Failed to sign in')
      triggerShake()
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
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
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Hidden on mobile */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="hidden lg:flex w-[60%] relative flex-col justify-center items-center overflow-hidden border-r border-border bg-[#07070A]"
      >
        <ParticleBackground />
        
        <div className="absolute top-8 left-8 flex items-center gap-2">
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

        <div className="relative z-10 max-w-xl px-12 text-center">
          <motion.h1 
            className="text-5xl font-display font-bold text-white mb-6 leading-tight"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {['Unfold', 'Your', 'Career,', 'One', 'Mission', 'at', 'a', 'Time.'].map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-3"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-xl text-text-secondary mb-12"
          >
            Join 10,000+ students building real skills daily
          </motion.p>

          <div className="flex justify-center gap-6">
            {[ 
              { icon: Brain, title: "AI Roadmap", delay: 1 },
              { icon: Shield, title: "Verified Skills", delay: 1.2 },
              { icon: Target, title: "Smart Matching", delay: 1.4 }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1, 
                  y: [0, -10, 0],
                  rotate: [0, idx % 2 === 0 ? 2 : -2, 0]
                }}
                transition={{
                  opacity: { delay: feature.delay, duration: 0.5 },
                  y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: feature.delay },
                  rotate: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: feature.delay }
                }}
                className="glass px-6 py-4 rounded-2xl flex flex-col items-center gap-3 border border-purple/20 bg-card/40"
              >
                <div className="p-3 rounded-full bg-purple/10 text-purple-light">
                  <feature.icon size={24} />
                </div>
                <span className="font-medium text-sm text-text-primary whitespace-nowrap">{feature.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div 
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
        className="w-full lg:w-[40%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative bg-card"
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
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-white mb-3">Welcome to Unfoldd</h2>
            <p className="text-text-secondary">Sign in to continue your journey</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition-colors mb-8"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-text-muted text-sm">or continue with email</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1 relative group">
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full h-14 bg-background border border-border rounded-xl px-4 text-white outline-none focus:border-purple focus:ring-1 focus:ring-purple/50 transition-all peer pt-5 pb-1"
                placeholder=" "
              />
              <label 
                htmlFor="email"
                className="absolute left-4 top-4 -translate-y-1/2 text-text-muted text-sm transition-all peer-focus:top-3 peer-focus:text-[11px] peer-focus:text-purple peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:-translate-y-0 pointer-events-none"
              >
                Email address
              </label>
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-xs pl-1">
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1 relative group">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="w-full h-14 bg-background border border-border rounded-xl px-4 text-white outline-none focus:border-purple focus:ring-1 focus:ring-purple/50 transition-all peer pt-5 pb-1 pr-12"
                placeholder=" "
              />
              <label 
                htmlFor="password"
                className="absolute left-4 top-4 -translate-y-1/2 text-text-muted text-sm transition-all peer-focus:top-3 peer-focus:text-[11px] peer-focus:text-purple peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:-translate-y-0 pointer-events-none"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-text-muted hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <AnimatePresence>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-xs pl-1">
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-end">
              <Link href="/auth/reset-password" className="text-sm text-purple hover:text-purple-light transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="bg-gradient-to-r from-purple to-purple-dark text-white shadow-[0_0_20px_rgba(108,99,255,0.3)] hover:shadow-[0_0_25px_rgba(108,99,255,0.5)] transition-all border-0 h-12 mt-4"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center mt-8 text-text-secondary text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-purple font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
