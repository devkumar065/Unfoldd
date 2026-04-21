'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Globe, Mail, CheckCircle2, Lock, ArrowRight, ShieldCheck, Zap, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

export default function CompanyRegister() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const LOGO_URL = "https://srklrlzewvozsvebzgvm.supabase.co/storage/v1/object/public/avatars/icon.png"
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    industry: '',
    size: 'small',
    password: '',
    plan: 'free'
  })

  const PLANS = [
    { id: 'free', name: 'Free', price: '₹0', icon: Zap, features: ['View 5 student profiles/month', '1 active job posting', 'Limited filters'], color: 'from-gray-400 to-gray-600' },
    { id: 'starter', name: 'Starter', price: '₹5,000', icon: Rocket, features: ['50 student profiles/month', '5 active job postings', 'Direct messaging', 'Bulk shortlisting'], color: 'from-purple to-purple-dark', popular: true },
    { id: 'growth', name: 'Growth', price: '₹15,000', icon: ShieldCheck, features: ['Unlimited profiles', 'Unlimited job postings', 'Direct messaging + email', 'Priority placement'], color: 'from-cyan to-blue-600' }
  ]

  const handleRegister = async () => {
    setIsLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { company_name: formData.name } }
      })

      if (authError) throw authError

      const { error: companyError } = await supabase.from('companies').insert({
        id: authData.user.id,
        company_name: formData.name,
        email: formData.email,
        website: formData.website,
        industry: formData.industry,
        size: formData.size,
        plan: formData.plan,
        profile_views_remaining: formData.plan === 'free' ? 5 : formData.plan === 'starter' ? 50 : 999999
      })

      if (companyError) throw companyError

      toast.success('Registration successful! Welcome to Unfoldd.')
      router.push('/company')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 py-20 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan/5 rounded-full blur-3xl" />

      <div className="w-full max-w-4xl relative z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl mb-6">
            <Image src={LOGO_URL} width={40} height={40} className="object-contain" alt="logo" />
          </div>
          <h1 className="text-4xl font-display font-black text-white mb-2 text-center">Hire the Top 1% of Verified Students</h1>
          <p className="text-text-secondary text-lg">Join 500+ companies hiring from Unfoldd</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all", step >= s ? "bg-purple border-purple text-white" : "border-border text-text-muted")}>
                 {step > s ? <CheckCircle2 size={20}/> : s}
              </div>
              {s < 3 && <div className={cn("w-12 h-1 rounded-full", step > s ? "bg-purple" : "bg-border")} />}
            </div>
          ))}
        </div>

        <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-border bg-card/60 backdrop-blur-2xl shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase px-1">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full h-14 bg-background border border-border rounded-2xl pl-12 pr-4 text-white focus:border-purple outline-none" placeholder="Unfoldd Inc." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase px-1">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} className="w-full h-14 bg-background border border-border rounded-2xl pl-12 pr-4 text-white focus:border-purple outline-none" placeholder="hiring@company.com" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase px-1">Website URL</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input type="url" value={formData.website} onChange={e=>setFormData({...formData, website:e.target.value})} className="w-full h-14 bg-background border border-border rounded-2xl pl-12 pr-4 text-white focus:border-purple outline-none" placeholder="https://unfoldd.me" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase px-1">Industry</label>
                    <select value={formData.industry} onChange={e=>setFormData({...formData, industry:e.target.value})} className="w-full h-14 bg-background border border-border rounded-2xl px-4 text-white focus:border-purple outline-none appearance-none">
                      <option value="">Select Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="E-commerce">E-commerce</option>
                    </select>
                  </div>
                </div>
                <Button size="lg" fullWidth onClick={() => setStep(2)} className="h-14 bg-white text-black font-bold text-lg hover:bg-gray-200 mt-6">Continue &rarr;</Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PLANS.map(plan => (
                    <div key={plan.id} onClick={() => setFormData({...formData, plan: plan.id})} className={cn("p-6 rounded-[2rem] border-2 cursor-pointer transition-all relative overflow-hidden flex flex-col h-full", formData.plan === plan.id ? "bg-purple/10 border-purple shadow-[0_0_30px_rgba(108,99,255,0.2)]" : "bg-background/40 border-border hover:border-purple/30")}>
                      {plan.popular && <div className="absolute top-0 right-0 bg-purple text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">Popular</div>}
                      <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6", plan.color)}>
                        <plan.icon size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                      <p className="text-2xl font-black text-white mb-6">{plan.price}<span className="text-xs font-normal text-text-muted">/month</span></p>
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map(f => (
                          <li key={f} className="text-xs text-text-secondary flex items-start gap-2">
                             {f.startsWith('❌') ? <span className="opacity-50">{f}</span> : <><CheckCircle2 size={14} className="text-purple shrink-0 mt-0.5" /> <span>{f}</span></>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <Button variant="ghost" className="h-14 px-8 text-text-muted" onClick={() => setStep(1)}>Back</Button>
                  <Button size="lg" fullWidth onClick={() => setStep(3)} className="h-14 bg-white text-black font-bold text-lg hover:bg-gray-200">Confirm Plan &rarr;</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
               <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-text-muted uppercase px-1">Choose Password</label>
                     <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                       <input type="password" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} className="w-full h-14 bg-background border border-border rounded-2xl pl-12 pr-4 text-white focus:border-purple outline-none" placeholder="••••••••" />
                     </div>
                   </div>
                 </div>
                 <div className="p-4 bg-background border border-border rounded-2xl text-xs text-text-muted leading-relaxed">
                   By creating an account, you agree to Unfoldd&apos;s Terms of Service and Privacy Policy. We will verify your company domain before granting access to student profiles.
                 </div>
                 <Button size="lg" fullWidth isLoading={isLoading} onClick={handleRegister} className="h-14 bg-gradient-to-r from-purple to-purple-dark text-white font-bold text-lg border-0 shadow-lg">Create Business Account</Button>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
