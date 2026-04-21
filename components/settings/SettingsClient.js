'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Bell, Shield, Palette, CreditCard, AlertTriangle, CheckCircle2, ChevronRight, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils/cn'

export default function SettingsClient({ user, profile, portfolio }) {
  const [activeTab, setActiveTab] = useState('account')
  const [isSaving, setIsSaving] = useState(false)
  const { theme, setTheme } = useTheme()

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'profile', label: 'Profile', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: 'text-red-500' }
  ]

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Settings updated successfully!')
    setIsSaving(false)
  }

  const handleExport = () => {
    toast.success('Your data export has started. You will receive an email shortly.')
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-160px)]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0">
         <h1 className="text-3xl font-display font-black text-white mb-8">Settings</h1>
         <nav className="flex flex-col space-y-2">
            {tabs.map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm",
                    active ? "bg-purple/10 text-purple border border-purple/20 shadow-[0_0_15px_rgba(108,99,255,0.1)]" : "bg-transparent text-text-muted border border-transparent hover:bg-card hover:border-border hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <tab.icon size={18} className={cn(tab.color, active && "animate-pulse")} />
                    <span className={cn(tab.color)}>{tab.label}</span>
                  </span>
                  {active && <ChevronRight size={16} />}
                </button>
              )
            })}
         </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 glass rounded-[3rem] border border-border bg-card/40 p-8 md:p-12 relative overflow-hidden shadow-2xl">
         <AnimatePresence mode="wait">
            
            {activeTab === 'account' && (
              <motion.div key="account" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-10 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Account Details</h2>
                  <p className="text-text-secondary text-sm">Manage your basic account information.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                    <input disabled type="email" value={user?.email || ''} className="w-full bg-background border border-border rounded-2xl p-4 text-sm text-text-secondary outline-none cursor-not-allowed font-medium" />
                    <p className="text-[10px] text-text-muted ml-1">Contact support to change your email.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" defaultValue={profile?.full_name || ''} className="w-full bg-background border border-border rounded-2xl p-4 text-sm text-white focus:border-purple focus:ring-1 focus:ring-purple/50 outline-none transition-all font-bold" />
                  </div>
                  <div className="pt-6 border-t border-border">
                     <Button variant="outline" className="border-border text-white hover:bg-white/5 font-bold h-12 px-6 rounded-xl">Change Password</Button>
                  </div>
                </div>
                <Button isLoading={isSaving} onClick={handleSave} className="bg-purple text-white font-black h-12 px-8 rounded-xl shadow-[0_0_20px_rgba(108,99,255,0.3)]">Save Changes</Button>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-10 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Public Profile</h2>
                  <p className="text-text-secondary text-sm">This information is visible to companies on the platform.</p>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">College/University</label>
                       <input type="text" defaultValue={profile?.college || ''} className="w-full bg-background border border-border rounded-2xl p-4 text-sm text-white focus:border-purple outline-none transition-all font-bold" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Current Year</label>
                       <select defaultValue={profile?.year || '3rd'} className="w-full bg-background border border-border rounded-2xl px-4 py-4 text-sm text-white focus:border-purple outline-none appearance-none font-bold">
                         <option value="1st">1st Year</option>
                         <option value="2nd">2nd Year</option>
                         <option value="3rd">3rd Year</option>
                         <option value="4th">4th Year</option>
                       </select>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Target Role</label>
                     <select defaultValue={profile?.target_role || 'fullstack'} className="w-full bg-background border border-border rounded-2xl px-4 py-4 text-sm text-white focus:border-purple outline-none appearance-none font-bold">
                       <option value="fullstack">Full Stack Developer</option>
                       <option value="sde">Software Development Engineer</option>
                       <option value="cybersecurity">Cybersecurity Analyst</option>
                       <option value="data_science">Data Scientist</option>
                       <option value="devops">DevOps Engineer</option>
                       <option value="uiux">UI/UX Designer</option>
                     </select>
                  </div>
                  <div className="p-5 rounded-2xl bg-purple/5 border border-purple/10 flex items-start gap-4">
                     <Shield size={20} className="text-purple shrink-0 mt-0.5" />
                     <p className="text-[11px] text-text-muted leading-relaxed font-medium">Your target role dictates your daily missions and the specific skills you&apos;ll be verified on. Changing it will update your roadmap.</p>
                  </div>
                </div>
                <Button isLoading={isSaving} onClick={handleSave} className="bg-purple text-white font-black h-12 px-8 rounded-xl shadow-[0_0_20px_rgba(108,99,255,0.3)]">Update Profile</Button>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-10 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Notification Preferences</h2>
                  <p className="text-text-secondary text-sm">Control how and when we contact you.</p>
                </div>
                <div className="space-y-8">
                   <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase text-purple-light tracking-widest">Push Notifications</h3>
                      <div className="space-y-4 p-6 rounded-3xl bg-background border border-border">
                         <ToggleItem label="Morning Mission Reminder" desc="Receive a daily push at 8 AM" defaultChecked />
                         <ToggleItem label="Streak Alerts" desc="Urgent reminders when streak is at risk" defaultChecked />
                         <ToggleItem label="Application Updates" desc="When a company views or shortlists you" defaultChecked />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase text-cyan tracking-widest">Email Notifications</h3>
                      <div className="space-y-4 p-6 rounded-3xl bg-background border border-border">
                         <ToggleItem label="Weekly Progress Report" desc="Sunday summary of XP and skills" defaultChecked />
                         <ToggleItem label="New Features & Tips" desc="Product updates and career advice" />
                         <ToggleItem label="Marketing Emails" desc="Promotional content from partners" />
                      </div>
                   </div>
                </div>
                <Button isLoading={isSaving} onClick={handleSave} className="bg-purple text-white font-black h-12 px-8 rounded-xl shadow-[0_0_20px_rgba(108,99,255,0.3)]">Save Preferences</Button>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div key="privacy" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-10 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Privacy & Data</h2>
                  <p className="text-text-secondary text-sm">Manage your visibility and download your data.</p>
                </div>
                <div className="space-y-6">
                   <div className="p-6 rounded-3xl bg-background border border-border space-y-6">
                      <ToggleItem label="Public Portfolio" desc="Allow companies to discover your profile" defaultChecked={portfolio?.is_public} />
                      <ToggleItem label="Leaderboard Visibility" desc="Show your name and XP on weekly rankings" defaultChecked />
                   </div>
                   
                   <div className="pt-8 border-t border-border space-y-4">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Export Your Data</h3>
                      <p className="text-xs text-text-muted leading-relaxed">Download a copy of all your personal data, including your resume, portfolio, skill progress, and analytics events in JSON format.</p>
                      <Button variant="outline" onClick={handleExport} className="border-border text-white hover:bg-white/5 font-bold h-12 px-6 rounded-xl mt-2">
                        <Download size={16} className="mr-2"/> Request Data Export
                      </Button>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div key="appearance" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-10 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Appearance</h2>
                  <p className="text-text-secondary text-sm">Customize the look and feel of the platform.</p>
                </div>
                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">System Theme</label>
                      <div className="grid grid-cols-3 gap-4">
                         {['dark', 'light', 'system'].map(t => (
                           <button key={t} onClick={() => setTheme(t)} className={cn("p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all", theme === t ? "border-purple bg-purple/10" : "border-border bg-background hover:border-purple/30")}>
                             <div className={cn("w-6 h-6 rounded-full border-2", t==='dark' ? "bg-[#0A0A0F] border-white/20" : t==='light' ? "bg-white border-gray-300" : "bg-gradient-to-r from-[#0A0A0F] to-white border-gray-500")} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-white">{t}</span>
                           </button>
                         ))}
                      </div>
                      <p className="text-[10px] text-text-muted italic ml-1">Light mode is currently in beta.</p>
                   </div>
                   <div className="space-y-4 pt-6 border-t border-border">
                      <ToggleItem label="Reduce Animations" desc="Disable heavy 3D and particle effects for better performance" />
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'billing' && (
               <motion.div key="billing" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-10 max-w-2xl">
                 <div>
                   <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Billing & Plans</h2>
                   <p className="text-text-secondary text-sm">Manage your subscription and billing history.</p>
                 </div>
                 
                 <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#12121A] to-[#0A0A0F] border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple/10 blur-3xl rounded-full" />
                    <div className="flex justify-between items-start mb-8 relative z-10">
                       <div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Current Plan</div>
                         <div className="text-3xl font-display font-black text-white tracking-tight">{profile?.is_premium ? 'Pro Learner' : 'Free Student'}</div>
                       </div>
                       {!profile?.is_premium && (
                         <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">Basic</div>
                       )}
                    </div>
                    
                    {!profile?.is_premium ? (
                      <div className="space-y-6 relative z-10">
                         <ul className="space-y-3">
                           {['Limited daily missions', 'Basic portfolio template', 'Ads enabled'].map((f, i) => (
                             <li key={i} className="flex items-center gap-3 text-sm text-text-secondary font-medium"><CheckCircle2 size={16} className="text-text-muted"/> {f}</li>
                           ))}
                         </ul>
                         <Button fullWidth className="bg-gradient-to-r from-purple to-cyan text-white font-black h-12 shadow-[0_0_20px_rgba(108,99,255,0.4)]">Upgrade to PRO</Button>
                      </div>
                    ) : (
                      <div className="space-y-6 relative z-10">
                         <div className="flex items-center gap-2 text-sm text-green font-bold bg-green/10 border border-green/20 p-4 rounded-xl">
                            <CheckCircle2 size={18} /> Active subscription. Renews on Oct 24, 2026.
                         </div>
                         <Button variant="outline" className="border-border text-white hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 font-bold h-12 px-6 rounded-xl transition-colors">Cancel Subscription</Button>
                      </div>
                    )}
                 </div>

                 <div className="space-y-4 pt-6 border-t border-border">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Billing History</h3>
                    <div className="p-6 rounded-2xl bg-background border border-border text-center text-sm text-text-muted italic">
                       No prior transactions found.
                    </div>
                 </div>
               </motion.div>
            )}

            {activeTab === 'danger' && (
              <motion.div key="danger" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-10 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-black text-red-500 mb-2 tracking-tight">Danger Zone</h2>
                  <p className="text-text-secondary text-sm">Irreversible and destructive actions.</p>
                </div>
                
                <div className="p-8 rounded-[2rem] border-2 border-red-500/20 bg-red-500/5 space-y-8">
                   <div>
                     <h3 className="text-lg font-bold text-white mb-2">Reset Roadmap Progress</h3>
                     <p className="text-sm text-text-secondary mb-4 leading-relaxed">This will erase your current mission progress, daily streak, and XP. Your verified skills and portfolio will remain intact.</p>
                     <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white font-bold px-6 h-10 transition-colors">Reset Progress</Button>
                   </div>
                   
                   <div className="pt-6 border-t border-red-500/20">
                     <h3 className="text-lg font-bold text-white mb-2">Delete Account</h3>
                     <p className="text-sm text-text-secondary mb-4 leading-relaxed">Permanently remove your account, portfolio, resume, and all associated data. This action cannot be undone.</p>
                     <Button className="bg-red-500 hover:bg-red-600 text-white font-black px-6 h-10 shadow-[0_0_20px_rgba(239,68,68,0.4)]">Delete Account</Button>
                   </div>
                </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  )
}

function ToggleItem({ label, desc, defaultChecked }) {
  const [checked, setChecked] = useState(defaultChecked || false)
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-bold text-white text-sm mb-1">{label}</p>
        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">{desc}</p>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={cn("w-12 h-6 rounded-full transition-all relative shrink-0", checked ? "bg-purple shadow-[0_0_10px_rgba(108,99,255,0.5)]" : "bg-border")}
      >
        <motion.div 
          animate={{ x: checked ? 26 : 4 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" 
        />
      </button>
    </div>
  )
}
