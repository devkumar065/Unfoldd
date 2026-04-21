'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Building2, Shield, Search } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

import Image from 'next/image'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
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

export default function CompanyLogin() {
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

      toast.success('Welcome back to Unfoldd Hiring!')
      router.push('/company')
      router.refresh()
    } catch (error) {
      toast.error(error.message || 'Failed to sign in')
      triggerShake()
    } finally {
      setIsLoading(false)
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
          <span className="font-display font-bold text-xl tracking-tight text-white">Unfoldd</span>
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
            {['Hire', 'the', 'Top', '1%', 'of', 'Verified', 'Students'].map((word, i) => (
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
            Join 500+ companies hiring from our verified talent pool
          </motion.p>

          <div className="flex justify-center gap-6">
            {[ 
              { icon: Search, title: "Find Talent", delay: 1 },
              { icon: Shield, title: "Verified Skills", delay: 1.2 },
              { icon: Building2, title: "Company Dashboard", delay: 1.4 }
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
                className="glass px-6 py-4 rounded-2xl flex flex-col items-center gap-3 border border-cyan/20 bg-card/40"
              >
                <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400">
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
          <span className="font-display font-bold text-xl tracking-tight text-white">Unfoldd</span>
        </div>

        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto mt-12 lg:mt-0"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-white mb-3">Company Login</h2>
            <p className="text-text-secondary">Access your hiring dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1 relative group">
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full h-14 bg-background border border-border rounded-xl px-4 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all peer pt-5 pb-1"
                placeholder=" "
              />
              <label 
                htmlFor="email"
                className="absolute left-4 top-4 -translate-y-1/2 text-text-muted text-sm transition-all peer-focus:top-3 peer-focus:text-[11px] peer-focus:text-cyan-500 peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:-translate-y-0 pointer-events-none"
              >
                Work Email
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
                className="w-full h-14 bg-background border border-border rounded-xl px-4 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all peer pt-5 pb-1 pr-12"
                placeholder=" "
              />
              <label 
                htmlFor="password"
                className="absolute left-4 top-4 -translate-y-1/2 text-text-muted text-sm transition-all peer-focus:top-3 peer-focus:text-[11px] peer-focus:text-cyan-500 peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:-translate-y-0 pointer-events-none"
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
              <Link href="/auth/reset-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] transition-all border-0 h-12 mt-4"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center mt-8 text-text-secondary text-sm">
            Want to hire students?{' '}
            <Link href="/company/register" className="text-cyan-400 font-medium hover:underline">
              Register Company
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
