'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, Mail, MessageSquare, CreditCard, Shield, Bell, HardDrive, RefreshCw, Eye, EyeOff, Save, CheckCircle2, XCircle, Cpu, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export default function IntegrationsPanel({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}))
  const [visibleKeys, setVisibleKeys] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isTestingPush, setIsTestingPush] = useState(false)
  const [firebaseStatus, setFirebaseStatus] = useState({ checked: false, connected: false })

  const toggleVisibility = (key) => {
    setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async (category) => {
    setIsSaving(true)
    try {
      const updates = Object.keys(settings)
        .filter(k => k.startsWith(category))
        .map(k => ({ key: k, value: settings[k], category, is_encrypted: k.includes('secret') || k.includes('password') || k.includes('key') }))

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updates })
      })

      if (!res.ok) throw new Error('Failed to save settings')
      toast.success(`${category} settings saved successfully`)
    } catch(e) {
      toast.error(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const testGroq = async () => {
    setIsTesting(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', service: 'groq' })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error("Test failed: " + e.message)
    } finally {
      setIsTesting(false)
    }
  }

  const testFirebase = async () => {
    setIsTestingPush(true)
    try {
      const res = await fetch('/api/admin/test-firebase')
      const data = await res.json()
      setFirebaseStatus({ checked: true, connected: data.connected })
      if (data.connected) {
        toast.success("Firebase Admin connected via service account!")
      } else {
        toast.error(data.error || "Service account not found")
      }
    } catch (e) {
      toast.error("Firebase test failed")
    } finally {
      setIsTestingPush(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Integrations & API Keys 🔧</h2>
          <p className="text-white/40 text-sm mt-1">Configure third-party services and platform limits.</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
          <Shield size={16} className="text-red-500" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Changes apply instantly. Handle with care.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* RAZORPAY */}
         <IntegrationCard 
           title="Payment Gateway (Razorpay)" icon={CreditCard} status="connected" color="bg-blue-500"
           onSave={() => handleSave('razorpay')}
         >
            <InputField label="Key ID" val={settings['razorpay_key_id']} onChange={(v)=>handleChange('razorpay_key_id', v)} visible={visibleKeys['rzp_id']} onToggle={()=>toggleVisibility('rzp_id')} />
            <InputField label="Key Secret" val={settings['razorpay_key_secret']} onChange={(v)=>handleChange('razorpay_key_secret', v)} visible={visibleKeys['rzp_secret']} onToggle={()=>toggleVisibility('rzp_secret')} isPassword />
            <div className="grid grid-cols-2 gap-4 mt-4">
               <div>
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1 block">Pro Plan Price (₹)</label>
                  <input type="number" value={settings['pro_price_inr'] || 199} onChange={e=>handleChange('pro_price_inr', e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-blue-500" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1 block">Premium Plan Price (₹)</label>
                  <input type="number" value={settings['premium_price_inr'] || 499} onChange={e=>handleChange('premium_price_inr', e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-blue-500" />
               </div>
            </div>
         </IntegrationCard>

         {/* GROQ AI */}
         <IntegrationCard 
           title="AI Engine (Groq)" icon={Cpu} status={settings['groq_api_key'] ? "connected" : "disconnected"} color="bg-purple-500"
           onSave={() => handleSave('groq')}
         >
            <InputField 
              label="Groq API Key" 
              val={settings['groq_api_key']} 
              onChange={(v)=>handleChange('groq_api_key', v)} 
              visible={visibleKeys['ai_key']} 
              onToggle={()=>toggleVisibility('ai_key')} 
              isPassword 
            />
            <div className="text-[10px] text-white/30 mt-1">Get free key at: <a href="https://console.groq.com" target="_blank" className="text-purple-400 hover:underline">console.groq.com</a></div>
            
            <div className="space-y-4 mt-6">
              <div>
                <label className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2 block">Default Model for Missions</label>
                <select 
                  value={settings['groq_model_smart'] || 'llama-3.3-70b-versatile'} 
                  onChange={e=>handleChange('groq_model_smart', e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Smart)</option>
                  <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fast)</option>
                  <option value="llama3-70b-8192">llama3-70b-8192 (Code)</option>
                  <option value="gemma2-9b-it">gemma2-9b-it (Fallback)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2 block">Default Model for Questions</label>
                <select 
                  value={settings['groq_model_fast'] || 'llama-3.1-8b-instant'} 
                  onChange={e=>handleChange('groq_model_fast', e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Smart)</option>
                  <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fast)</option>
                  <option value="llama3-70b-8192">llama3-70b-8192 (Code)</option>
                  <option value="gemma2-9b-it">gemma2-9b-it (Fallback)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
               <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Estimated Cost: FREE (Free Tier)</span>
               <button 
                onClick={testGroq} 
                disabled={isTesting}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-2"
               >
                 {isTesting ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                 Test Connection
               </button>
            </div>
         </IntegrationCard>

         {/* FIREBASE PUSH */}
         <IntegrationCard 
           title="Push Notifications (Firebase)" icon={Bell} status={firebaseStatus.connected ? "connected" : "disconnected"} color="bg-yellow-500"
           onSave={() => handleSave('firebase')}
         >
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Service Account Status</span>
                {firebaseStatus.connected ? (
                  <span className="text-[10px] font-bold text-green-500 flex items-center gap-1"><CheckCircle2 size={12}/> Connected</span>
                ) : (
                  <span className="text-[10px] font-bold text-red-500 flex items-center gap-1"><XCircle size={12}/> Not Found</span>
                )}
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">
                Place service account JSON at <code className="text-yellow-500/80">/service-account/firebase-service-account.json</code> or set <code className="text-yellow-500/80">FIREBASE_SERVICE_ACCOUNT_JSON</code> env var.
              </p>
            </div>

            <InputField label="Firebase Project ID" val={settings['firebase_project_id']} onChange={(v)=>handleChange('firebase_project_id', v)} visible={visibleKeys['fb_id']} onToggle={()=>toggleVisibility('fb_id')} />
            
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
               <button 
                onClick={testFirebase} 
                disabled={isTestingPush}
                className="text-xs font-bold text-yellow-500 hover:text-yellow-400 flex items-center gap-2"
               >
                 {isTestingPush ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                 Check Connection
               </button>
            </div>
         </IntegrationCard>

         {/* SMTP EMAIL */}
         <IntegrationCard 
           title="Email Service (SMTP)" icon={Mail} status="disconnected" color="bg-cyan-500"
           onSave={() => handleSave('smtp')}
         >
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1 block">SMTP Host</label>
                  <input type="text" value={settings['smtp_host'] || ''} onChange={e=>handleChange('smtp_host', e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-cyan-500" placeholder="smtp.gmail.com" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1 block">SMTP Port</label>
                  <input type="number" value={settings['smtp_port'] || 587} onChange={e=>handleChange('smtp_port', e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-cyan-500" />
               </div>
            </div>
            <InputField label="Username" val={settings['smtp_user']} onChange={(v)=>handleChange('smtp_user', v)} visible={visibleKeys['smtp_u']} onToggle={()=>toggleVisibility('smtp_u')} />
            <InputField label="Password" val={settings['smtp_password']} onChange={(v)=>handleChange('smtp_password', v)} visible={visibleKeys['smtp_p']} onToggle={()=>toggleVisibility('smtp_p')} isPassword />
         </IntegrationCard>
      </div>

      {/* PLATFORM LIMITS */}
      <div className="bg-[#0D0D16] border border-white/5 rounded-[2.5rem] shadow-2xl p-8">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <HardDrive className="text-green-500" /> Platform Limits
            </h3>
            <Button onClick={() => handleSave('limits')} className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl h-10 px-6">Save Limits</Button>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
               <label className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2 block">Free Verifications/Mo</label>
               <input type="number" value={settings['free_verifications_per_month'] || 3} onChange={e=>handleChange('free_verifications_per_month', e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl p-4 text-xl text-white font-black outline-none focus:border-green-500 text-center" />
            </div>
            <div>
               <label className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2 block">Exam Attempts/Day</label>
               <input type="number" value={settings['max_exam_attempts'] || 3} onChange={e=>handleChange('max_exam_attempts', e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl p-4 text-xl text-white font-black outline-none focus:border-green-500 text-center" />
            </div>
            <div>
               <label className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2 block">Free Matches/Week</label>
               <input type="number" value={settings['free_matches_per_week'] || 5} onChange={e=>handleChange('free_matches_per_week', e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl p-4 text-xl text-white font-black outline-none focus:border-green-500 text-center" />
            </div>
            <div>
               <label className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2 block">Exam Expiry (Hours)</label>
               <input type="number" value={settings['exam_expiry_hours'] || 1} onChange={e=>handleChange('exam_expiry_hours', e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl p-4 text-xl text-white font-black outline-none focus:border-green-500 text-center" />
            </div>
         </div>
      </div>
    </div>
  )
}

function IntegrationCard({ title, icon: Icon, status, color, children, onSave }) {
  return (
    <div className="bg-[#0D0D16] border border-white/5 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col">
       <div className={`absolute top-0 right-0 w-48 h-48 ${color}/5 blur-[80px] rounded-full pointer-events-none`} />
       
       <div className="p-8 border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
             <div className={cn(`w-12 h-12 rounded-2xl ${color}/10 border flex items-center justify-center`, `border-${color.replace('bg-', '')}/20`)}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
             </div>
             <h3 className="font-bold text-white text-lg tracking-tight">{title}</h3>
          </div>
          {status === 'connected' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-black uppercase tracking-widest">
              <CheckCircle2 size={12}/> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-white/40 border border-white/10 text-[10px] font-black uppercase tracking-widest">
              <XCircle size={12}/> Not Configured
            </span>
          )}
       </div>

       <div className="p-8 space-y-4 relative z-10 flex-1">
          {children}
       </div>

       <div className="p-6 border-t border-white/5 bg-white/[0.01] relative z-10">
          <Button fullWidth onClick={onSave} className="bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-xl transition-all shadow-sm">
            Save {title.split('(')[1]?.replace(')', '') || 'AI'} Settings
          </Button>
       </div>
    </div>
  )
}

function InputField({ label, val, onChange, visible, onToggle, isPassword }) {
  return (
    <div className="space-y-1 mt-4">
      <label className="text-[10px] font-black uppercase text-white/30 tracking-widest block">{label}</label>
      <div className="relative">
        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
        <input 
          type={isPassword && !visible ? 'password' : 'text'} 
          value={val || ''} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#050508] border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-white font-mono outline-none transition-colors focus:border-white/30" 
          placeholder={isPassword ? '••••••••••••••••' : ''}
        />
        {isPassword && (
          <button onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
            {visible ? <EyeOff size={16}/> : <Eye size={16}/>}
          </button>
        )}
      </div>
    </div>
  )
}
