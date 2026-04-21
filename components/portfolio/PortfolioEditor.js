'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Briefcase, MessageCircle, Globe, MapPin, CheckCircle2, ShieldAlert, Calendar, Flame, Eye, Save, Plus, Trash2, Smartphone, Layout, Upload, ChevronRight, X, Mail, Settings, Lock, EyeOff, Monitor, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PortfolioViewer } from './PortfolioViewer'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

export function PortfolioEditor({ initialPortfolio, profile, skills, badges, roadmap }) {
  const [portfolio, setPortfolio] = useState(initialPortfolio)
  const [activeTab, setActiveTab] = useState('basic')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(new Date().toLocaleTimeString())
  const [viewMode, setViewMode] = useState('desktop')

  const handleSave = useCallback(async (silent = false) => {
    if (isSaving) return
    if (!silent) setIsSaving(true)
    try {
      const res = await fetch('/api/portfolio/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolio)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLastSaved(new Date().toLocaleTimeString())
      if (!silent) toast.success('Portfolio saved successfully')
    } catch(e) {
      if (!silent) toast.error(e.message)
    } finally {
      if (!silent) setIsSaving(false)
    }
  }, [isSaving, portfolio])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSave(true)
    }, 30000)
    return () => clearTimeout(timer)
  }, [handleSave])

  const handleChange = (field, value) => {
    setPortfolio(p => ({ ...p, [field]: value }))
  }

  const handleAddProject = () => {
    const newProj = { title: 'New Project', description: '', tech_stack: [], github_link: '', live_link: '' }
    setPortfolio(p => ({ ...p, projects: [...(p.projects || []), newProj] }))
  }

  const updateProject = (index, field, value) => {
    const newProjects = [...portfolio.projects]
    newProjects[index][field] = value
    setPortfolio(p => ({ ...p, projects: newProjects }))
  }

  const removeProject = (index) => {
    const newProjects = [...portfolio.projects]
    newProjects.splice(index, 1)
    setPortfolio(p => ({ ...p, projects: newProjects }))
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const toastId = toast.loading('Uploading avatar...')
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
      window.location.reload()
    } catch(err) {
      toast.error(err.message, { id: toastId })
    }
  }

  return (
    <div className="flex h-full w-full bg-background overflow-hidden border-t border-border">
      <div className="w-full lg:w-[420px] xl:w-[480px] h-full flex flex-col border-r border-border bg-card/30 shrink-0">
        <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0 bg-background/50">
          <h2 className="font-bold text-white flex items-center gap-2"><Settings size={18}/> Editor</h2>
          <div className="flex bg-card border border-border rounded-xl p-1">
             <button onClick={()=>setActiveTab('basic')} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", activeTab==='basic' ? "bg-purple text-white shadow-md" : "text-text-muted hover:text-white")}>Basic</button>
             <button onClick={()=>setActiveTab('projects')} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", activeTab==='projects' ? "bg-purple text-white shadow-md" : "text-text-muted hover:text-white")}>Projects</button>
             <button onClick={()=>setActiveTab('appearance')} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", activeTab==='appearance' ? "bg-purple text-white shadow-md" : "text-text-muted hover:text-white")}>Style</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 hide-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'basic' && (
              <motion.div key="basic" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Profile Photo</label>
                  <div className="flex items-center gap-6 p-5 rounded-[2rem] bg-card/50 border border-border">
                    <div className="relative w-20 h-20 group cursor-pointer">
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 z-10">
                        <Upload size={20} className="text-white" />
                      </div>
                      <Image 
                        src={profile.avatar_url || 'https://srklrlzewvozsvebzgvm.supabase.co/storage/v1/object/public/avatars/icon.png'} 
                        fill
                        className="rounded-full object-cover border-2 border-purple/20 group-hover:border-purple/50 transition-colors shadow-lg" 
                        alt="avatar" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="inline-flex items-center justify-center bg-white text-black px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-200 transition-colors">
                        Change Photo
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                      <p className="text-[10px] text-text-muted mt-2 font-medium">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Short Tagline</label>
                    <input type="text" maxLength={100} value={portfolio.tagline || ''} onChange={e => handleChange('tagline', e.target.value)} className="w-full bg-background border border-border rounded-2xl p-4 text-sm text-white focus:border-purple focus:ring-1 focus:ring-purple/50 transition-all outline-none" placeholder="e.g. Building the future of web apps" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Extended Bio</label>
                    <textarea maxLength={300} value={portfolio.bio || ''} onChange={e => handleChange('bio', e.target.value)} className="w-full h-32 resize-none bg-background border border-border rounded-2xl p-4 text-sm text-white focus:border-purple focus:ring-1 focus:ring-purple/50 transition-all outline-none leading-relaxed" placeholder="Tell your professional story..." />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Social Networks</label>
                  <div className="grid gap-3">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted">
                        <Code size={16} />
                      </div>
                      <input type="url" value={portfolio.github_url || ''} onChange={e => handleChange('github_url', e.target.value)} className="w-full bg-background border border-border rounded-2xl py-3.5 pl-14 pr-4 text-sm text-white focus:border-purple outline-none" placeholder="GitHub Profile URL" />
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted">
                        <Briefcase size={16} />
                      </div>
                      <input type="url" value={portfolio.linkedin_url || ''} onChange={e => handleChange('linkedin_url', e.target.value)} className="w-full bg-background border border-border rounded-2xl py-3.5 pl-14 pr-4 text-sm text-white focus:border-purple outline-none" placeholder="LinkedIn Profile URL" />
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted">
                        <MessageCircle size={16} />
                      </div>
                      <input type="url" value={portfolio.twitter_url || ''} onChange={e => handleChange('twitter_url', e.target.value)} className="w-full bg-background border border-border rounded-2xl py-3.5 pl-14 pr-4 text-sm text-white focus:border-purple outline-none" placeholder="Twitter URL" />
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted">
                        <Globe size={16} />
                      </div>
                      <input type="url" value={portfolio.website_url || ''} onChange={e => handleChange('website_url', e.target.value)} className="w-full bg-background border border-border rounded-2xl py-3.5 pl-14 pr-4 text-sm text-white focus:border-purple outline-none" placeholder="Personal Website URL" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div key="projects" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-6">
                {portfolio.projects?.map((proj, i) => (
                  <div key={i} className="p-6 rounded-[2rem] bg-card border border-border space-y-4 relative group hover:border-purple/30 transition-colors shadow-sm">
                    <button onClick={() => removeProject(i)} className="absolute top-6 right-6 text-text-muted hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    <input type="text" value={proj.title} onChange={e => updateProject(i, 'title', e.target.value)} className="w-[85%] bg-transparent border-none text-xl font-display font-bold text-white outline-none focus:ring-0 p-0" placeholder="Project Name" />
                    <textarea value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} className="w-full h-20 resize-none bg-background/50 border border-border rounded-xl p-3 text-sm text-text-secondary focus:border-purple outline-none" placeholder="Describe what you built..." />
                    <input type="text" value={(proj.tech_stack||[]).join(', ')} onChange={e => updateProject(i, 'tech_stack', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} className="w-full bg-background/50 border border-border rounded-xl p-3 text-xs text-text-muted focus:border-purple outline-none font-mono" placeholder="Stack (React, Node.js...)" />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="relative">
                        <Code className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                        <input type="url" value={proj.github_link||''} onChange={e => updateProject(i, 'github_link', e.target.value)} className="w-full bg-background border border-border rounded-xl py-2 pl-9 pr-3 text-[10px] text-white focus:border-purple outline-none" placeholder="Source Code" />
                      </div>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                        <input type="url" value={proj.live_link||''} onChange={e => updateProject(i, 'live_link', e.target.value)} className="w-full bg-background border border-border rounded-xl py-2 pl-9 pr-3 text-[10px] text-white focus:border-purple outline-none" placeholder="Live Demo" />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" fullWidth onClick={handleAddProject} className="border-dashed border-2 border-border hover:border-purple hover:bg-purple/5 h-16 rounded-[2rem] text-text-secondary hover:text-purple transition-all group">
                  <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform" /> Add New Project
                </Button>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div key="appearance" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Theme Template</label>
                   <div className="grid gap-4">
                     {[
                       { id: 'minimal', name: 'Minimalist Professional', desc: 'Clean, focused, high contrast', free: true },
                       { id: 'glassmorphism', name: 'Cyber Glass', desc: 'Modern floating elements', free: false },
                       { id: 'terminal', name: 'Binary Terminal', desc: 'Pure developer aesthetic', free: false }
                     ].map(t => {
                       const isPremium = profile?.is_premium
                       const locked = !t.free && !isPremium
                       const active = portfolio.template_id === t.id
                       return (
                         <div key={t.id} onClick={() => !locked && handleChange('template_id', t.id)} className={cn("p-6 rounded-[2rem] border-2 flex items-center justify-between cursor-pointer transition-all relative overflow-hidden", active ? "border-purple bg-purple/10 shadow-[0_0_20px_rgba(108,99,255,0.1)]" : locked ? "border-border bg-background/50 opacity-60" : "border-border bg-card hover:border-purple/30")}>
                           <div>
                             <p className="font-bold text-white text-base">{t.name}</p>
                             <p className="text-xs text-text-muted mt-0.5">{t.desc}</p>
                           </div>
                           {locked ? <Lock size={16} className="text-text-muted"/> : active ? <CheckCircle2 size={20} className="text-purple" /> : <div className="w-5 h-5 rounded-full border-2 border-border" />}
                         </div>
                       )
                     })}
                   </div>
                </div>

                <div className="pt-8 border-t border-border space-y-6">
                  <div className="flex items-center justify-between p-6 rounded-[2rem] bg-card/40 border border-border">
                    <div className="flex items-center gap-4">
                       <div className={cn("p-3 rounded-2xl", portfolio.is_public ? "bg-green/10 text-green" : "bg-red-500/10 text-red-500")}>
                         {portfolio.is_public ? <Eye size={20}/> : <EyeOff size={20}/>}
                       </div>
                       <div>
                         <p className="font-bold text-white text-sm">Public Visibility</p>
                         <p className="text-[10px] text-text-muted uppercase font-black tracking-tighter mt-1">{portfolio.is_public ? 'VISIBLE TO RECRUITERS' : 'PRIVATE PORTFOLIO'}</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer scale-110">
                      <input type="checkbox" checked={portfolio.is_public} onChange={e => handleChange('is_public', e.target.checked)} className="sr-only peer" />
                      <div className="w-12 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1 mb-2 block">Custom Vanity URL</label>
                  <div className="flex items-center gap-3 bg-background border border-border p-3 rounded-2xl">
                    <span className="text-text-muted text-[10px] font-bold uppercase pl-2 select-none hidden sm:inline border-r border-border pr-3">unfoldd.me/</span>
                    <input type="text" value={portfolio.public_slug} onChange={e => handleChange('public_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="flex-1 bg-transparent text-sm text-purple-light font-bold outline-none" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-20 px-6 border-t border-border bg-background/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Auto-save active</span>
            <span className="text-[10px] text-green font-bold">Synced at {lastSaved}</span>
          </div>
          <Button onClick={() => handleSave(false)} isLoading={isSaving} className="bg-purple text-white font-black h-11 px-8 rounded-xl shadow-[0_0_20px_rgba(108,99,255,0.3)] border-0">
            <Save size={18} className="mr-2" /> Publish
          </Button>
        </div>
      </div>

      {/* Right Preview Panel */}
      <div className="hidden lg:flex flex-1 flex-col bg-[#050508] relative">
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-10 bg-black/40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-text-muted font-bold uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-green" /> Live Preview
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="flex bg-white/5 rounded-lg p-1">
               <button onClick={()=>setViewMode('desktop')} className={cn("p-1.5 rounded transition-all", viewMode==='desktop' ? "bg-white/10 text-white" : "text-text-muted hover:text-white")}><Monitor size={14}/></button>
               <button onClick={()=>setViewMode('mobile')} className={cn("p-1.5 rounded transition-all", viewMode==='mobile' ? "bg-white/10 text-white" : "text-text-muted hover:text-white")}><Smartphone size={14}/></button>
            </div>
          </div>
          <a href={`/portfolio/${portfolio.public_slug}`} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-widest text-cyan hover:text-cyan-light transition-colors flex items-center gap-2">
            Full Site View <ExternalLink size={12}/>
          </a>
        </div>
        
        <div className="flex-1 overflow-hidden relative flex items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple/5 to-transparent">
           <div className={cn(
             "h-full bg-background border border-white/10 shadow-2xl transition-all duration-500 overflow-y-auto hide-scrollbar rounded-t-[2rem] rounded-b-lg",
             viewMode === 'desktop' ? "w-full" : "w-[375px] max-h-[812px]"
           )}>
              <PortfolioViewer 
                portfolio={portfolio} 
                profile={profile} 
                skills={skills} 
                badges={badges} 
                roadmap={roadmap} 
              />
           </div>
        </div>
      </div>
    </div>
  )
}