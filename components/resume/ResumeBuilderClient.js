'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, Save, Sparkles, AlertCircle, Plus, Trash2, CheckCircle2, X, Briefcase, GraduationCap, User, Layout, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { ResumePreview } from './ResumePreview'
import { ATSScore } from './ATSScore'
import { cn } from '@/lib/utils/cn'

export function ResumeBuilderClient({ profile, portfolio, skills, internships, existingResume }) {
  const [activeTab, setActiveTab] = useState('personal')
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [atsScore, setAtsScore] = useState(existingResume?.ats_score || 0)

  const verifiedSkills = skills.filter(s => s.is_verified)
  const otherSkills = skills.filter(s => !s.is_verified)

  const defaultExp = internships.map(app => ({
    company: app.internships?.company_name,
    role: app.internships?.role,
    duration: '2025 - Present',
    description: app.internships?.description || 'Worked on key features.'
  }))

  const calcGradYear = (year) => {
    const map = { '1st': 2028, '2nd': 2027, '3rd': 2026, '4th': 2025 }
    return map[year] || 2026
  }

  const [resumeData, setResumeData] = useState(existingResume?.resume_data || {
    personal: {
      name: profile?.full_name || '',
      email: profile?.email || '',
      phone: '',
      location: '',
      linkedin: portfolio?.linkedin_url || '',
      github: portfolio?.github_url || '',
      website: portfolio?.website_url || ''
    },
    summary: '',
    skills: {
      verified: verifiedSkills.map(s => s.skill_name),
      other: otherSkills.map(s => s.skill_name)
    },
    projects: portfolio?.projects || [],
    education: {
      institution: profile?.college || '',
      degree: 'Bachelor of Technology',
      branch: profile?.branch || '',
      year: profile?.year || '',
      graduation_year: calcGradYear(profile?.year)
    },
    experience: defaultExp || []
  })

  const [templateId, setTemplateId] = useState(existingResume?.template_id || 'classic')

  const updateSection = (section, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }))
  }

  const calculateAtsCall = useCallback(async () => {
    try {
      const res = await fetch('/api/resume/ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, targetRole: profile.target_role })
      })
      const data = await res.json()
      if (data.score !== undefined) setAtsScore(data.score)
    } catch(e) {}
  }, [resumeData, profile.target_role])

  useEffect(() => {
    const timer = setTimeout(() => {
       calculateAtsCall()
    }, 2000)
    return () => clearTimeout(timer)
  }, [calculateAtsCall])

  const handleSave = async (silent = false) => {
    if (isSaving) return
    if (!silent) setIsSaving(true)
    try {
      const res = await fetch('/api/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, atsScore, templateId })
      })
      if (!res.ok) throw new Error('Failed to save')
      if (!silent) toast.success('Resume saved successfully')
    } catch (e) {
      if (!silent) toast.error(e.message)
    } finally {
      if (!silent) setIsSaving(false)
    }
  }

  const handleDownload = async () => {
    setIsGenerating(true)
    const toastId = toast.loading('Generating PDF. This may take a few seconds...')
    await handleSave(true)
    try {
      const res = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, template: templateId })
      })
      if (!res.ok) throw new Error('Failed to generate PDF')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resumeData.personal.name.replace(/\s+/g, '-')}-resume.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      toast.success('PDF Downloaded!', { id: toastId })
    } catch(e) {
      toast.error(e.message, { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateAISummary = async () => {
    setIsAiLoading(true)
    try {
      // In a real app we'd call the AI route
      setTimeout(() => {
        setResumeData(p => ({...p, summary: `Dedicated ${profile.year} year BTech student specializing in ${profile.target_role} with verified expertise in ${resumeData.skills.verified[0] || 'core technologies'}. Proven ability to build robust applications and eager to contribute to innovative teams.`}))
        setIsAiLoading(false)
        toast.success("AI Summary Generated")
      }, 1500)
    } catch(e) { setIsAiLoading(false) }
  }

  return (
    <div className="flex h-full w-full bg-background overflow-hidden border-t border-border">
      
      <div className="w-full lg:w-[420px] xl:w-[480px] h-full flex flex-col border-r border-border bg-card/30 shrink-0">
        
        <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0 bg-background/50">
          <h2 className="font-bold text-white flex items-center gap-2"><FileText size={18}/> Builder</h2>
          <div className="flex bg-card border border-border rounded-xl p-1 overflow-x-auto hide-scrollbar max-w-[65%]">
             {[
               { id: 'personal', label: 'Info' },
               { id: 'summary', label: 'Bio' },
               { id: 'skills', label: 'Skills' },
               { id: 'projects', label: 'Exp' },
               { id: 'edu', label: 'Edu' }
             ].map(t => (
               <button key={t.id} onClick={()=>setActiveTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shrink-0", activeTab===t.id ? "bg-purple text-white shadow-md" : "text-text-muted hover:text-white")}>{t.label}</button>
             ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 hide-scrollbar">
          
          <ATSScore score={atsScore} targetRole={profile?.target_role} />

          <AnimatePresence mode="wait">
            
            {activeTab === 'personal' && (
              <motion.div key="personal" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Contact Information</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Full Name</label>
                      <input type="text" value={resumeData.personal.name} onChange={e => updateSection('personal', 'name', e.target.value)} className="w-full bg-background border border-border rounded-xl p-3.5 text-sm text-white focus:border-purple outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Email</label>
                      <input type="email" value={resumeData.personal.email} onChange={e => updateSection('personal', 'email', e.target.value)} className="w-full bg-background border border-border rounded-xl p-3.5 text-sm text-white focus:border-purple outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Phone</label>
                      <input type="tel" value={resumeData.personal.phone} onChange={e => updateSection('personal', 'phone', e.target.value)} className="w-full bg-background border border-border rounded-xl p-3.5 text-sm text-white focus:border-purple outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Location</label>
                      <input type="text" value={resumeData.personal.location} onChange={e => updateSection('personal', 'location', e.target.value)} className="w-full bg-background border border-border rounded-xl p-3.5 text-sm text-white focus:border-purple outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Online Presence</label>
                  <div className="grid gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase ml-1">LinkedIn Profile</label>
                      <input type="url" value={resumeData.personal.linkedin} onChange={e => updateSection('personal', 'linkedin', e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-sm text-white focus:border-purple outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase ml-1">GitHub / Portfolio</label>
                      <input type="url" value={resumeData.personal.github} onChange={e => updateSection('personal', 'github', e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-sm text-white focus:border-purple outline-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'summary' && (
              <motion.div key="summary" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-6">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em]">Professional Summary</label>
                  <button onClick={generateAISummary} disabled={isAiLoading} className="text-[10px] font-black uppercase tracking-widest text-purple hover:text-purple-light flex items-center gap-1.5 transition-colors">
                    <Sparkles size={12}/> {isAiLoading ? 'Writing...' : 'AI Rewrite'}
                  </button>
                </div>
                <div className="relative">
                  <textarea maxLength={300} value={resumeData.summary} onChange={e => setResumeData(p => ({...p, summary: e.target.value}))} className="w-full h-48 resize-none bg-background border border-border rounded-2xl p-5 text-sm text-white focus:border-purple outline-none leading-relaxed" placeholder="Brief overview of your skills and goals..." />
                  <div className="absolute bottom-4 right-4 text-[10px] font-bold text-text-muted bg-background/80 px-2 py-1 rounded-md border border-border">{resumeData.summary.length}/300</div>
                </div>
                <div className="p-5 rounded-2xl bg-purple/5 border border-purple/10 flex items-start gap-4">
                   <AlertCircle size={18} className="text-purple shrink-0 mt-0.5" />
                   <p className="text-[11px] text-text-muted leading-relaxed italic">Keep it short and impactful. Recruiters spend average 6 seconds per resume.</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'skills' && (
               <motion.div key="skills" initial={{opacity:0, y:10}} animate={{opacity:1, x:0}} exit={{opacity:0, y:-10}} className="space-y-10">
                 <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Official Certifications</label>
                   <div className="flex flex-wrap gap-2.5 p-5 rounded-2xl bg-green/5 border border-green/10">
                     {resumeData.skills.verified.map(s => (
                       <span key={s} className="px-3 py-1.5 bg-green/10 border border-green/20 text-green rounded-xl text-xs font-black flex items-center gap-2 shadow-sm">
                         {s} <CheckCircle2 size={12}/>
                       </span>
                     ))}
                     {resumeData.skills.verified.length === 0 && <p className="text-[11px] text-text-muted italic px-2">Complete official Unfoldd exams to add verified badges.</p>}
                   </div>
                 </div>
                 
                 <div className="space-y-4 pt-6 border-t border-border">
                   <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">General Technical Skills</label>
                   <div className="flex flex-wrap gap-2.5">
                     {resumeData.skills.other.map((s, i) => (
                       <span key={i} className="px-3 py-1.5 bg-card/60 border border-border text-text-secondary hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors group">
                         {s} <button onClick={() => setResumeData(p => ({...p, skills: {...p.skills, other: p.skills.other.filter((_, idx)=>idx!==i)}}))} className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={12}/></button>
                       </span>
                     ))}
                     <button className="px-3 py-1.5 rounded-xl border border-dashed border-border text-text-muted hover:text-purple hover:border-purple text-xs font-bold transition-all flex items-center gap-2">
                       <Plus size={12}/> Add Skill
                     </button>
                   </div>
                 </div>
               </motion.div>
            )}

            {activeTab === 'projects' && (
               <motion.div key="projects" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-6">
                 <div className="p-5 rounded-2xl bg-card/40 border border-border flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple/10 text-purple">
                       <Briefcase size={20}/>
                    </div>
                    <div>
                       <p className="font-bold text-white text-sm">Experience Sync</p>
                       <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter mt-0.5">AUTO-SYNCED FROM PORTFOLIO</p>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                   {resumeData.projects.map((p, i) => (
                     <div key={i} className="p-6 bg-card/60 border border-border rounded-[2rem] hover:border-purple/20 transition-all">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white">{p.title}</h4>
                          <span className="text-[9px] font-black uppercase text-purple-light tracking-widest">Project</span>
                       </div>
                       <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 italic mb-3">&quot;{p.description}&quot;</p>
                       <div className="flex flex-wrap gap-1.5">
                          {(p.tech_stack||[]).map((s, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-background border border-border rounded text-text-muted font-mono">{s}</span>
                          ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </motion.div>
            )}

            {activeTab === 'edu' && (
              <motion.div key="edu" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Institution</label>
                      <input type="text" value={resumeData.education.institution} onChange={e => updateSection('education', 'institution', e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 text-sm text-white focus:border-purple outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Degree & Major</label>
                      <input type="text" value={resumeData.education.branch} onChange={e => updateSection('education', 'branch', e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 text-sm text-white focus:border-purple outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Batch Start</label>
                        <input type="text" value={resumeData.education.year} onChange={e => updateSection('education', 'year', e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 text-sm text-white focus:border-purple outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Expected Grad</label>
                        <input type="text" value={resumeData.education.graduation_year} onChange={e => updateSection('education', 'graduation_year', e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 text-sm text-white focus:border-purple outline-none" />
                      </div>
                    </div>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <div className="h-32 px-6 border-t border-border bg-background/80 backdrop-blur-xl flex flex-col justify-center gap-4 shrink-0 z-10">
          <div className="flex bg-card border border-border rounded-xl p-1 shrink-0">
             {[
               { id: 'classic', label: 'Classic' },
               { id: 'modern', label: 'Modern' },
               { id: 'creative', label: 'Creative' }
             ].map(t => (
               <button key={t.id} onClick={()=>setTemplateId(t.id)} className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", templateId===t.id ? "bg-purple text-white shadow-lg" : "text-text-muted hover:text-white")}>{t.label}</button>
             ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => handleSave(false)} isLoading={isSaving} className="border-border text-white hover:bg-white/5 font-bold rounded-xl h-10">
              <Save size={16} className="mr-2" /> Draft
            </Button>
            <Button onClick={handleDownload} isLoading={isGenerating} className="bg-white text-black hover:bg-gray-200 font-black rounded-xl h-10 border-0 shadow-lg">
              <Download size={16} className="mr-2" /> Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gray-950 items-start justify-center p-12 overflow-y-auto hide-scrollbar relative">
         <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
         <div className="relative z-10 w-full flex justify-center">
            <ResumePreview resumeData={resumeData} template={templateId} />
         </div>
      </div>
    </div>
  )
}