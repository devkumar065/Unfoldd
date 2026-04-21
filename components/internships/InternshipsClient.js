'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, MapPin, Clock, IndianRupee, Briefcase, CheckCircle2, Zap, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { ApplyModal } from './ApplyModal'
import { ApplicationTracker } from './ApplicationTracker'
import { cn } from '@/lib/utils/cn'

export function InternshipsClient({ internships, applications, profile, skills }) {
  const [searchTerm, setSearchSearchTerm] = useState('')
  const [activeRole, setActiveRole] = useState('All')
  const [activeLocation, setActiveLocation] = useState('All')
  const [selectedInternship, setSelectedId] = useState(null)
  const [view, setView] = useState('listings') // listings | applications

  const roles = ['All', 'Full Stack', 'SDE', 'Cybersecurity', 'Data Science', 'DevOps', 'UI/UX']
  
  const filteredInternships = useMemo(() => {
    return internships.filter(item => {
      const matchesSearch = item.company_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.role.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = activeRole === 'All' || item.role.toLowerCase().includes(activeRole.toLowerCase())
      const matchesLocation = activeLocation === 'All' || 
                             (activeLocation === 'Remote' && item.is_remote) ||
                             (activeLocation === 'On-site' && !item.is_remote)
      
      return matchesSearch && matchesRole && matchesLocation
    })
  }, [internships, searchTerm, activeRole, activeLocation])

  const appliedIds = new Set(applications.map(a => a.internship_id))

  const stats = {
    total: internships.length,
    applied: applications.length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    greatMatches: internships.filter(i => i.match_percentage >= 90).length
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Matched Internships 🎯</h1>
          <p className="text-text-secondary">Ranked by your verified skill match</p>
        </div>
        <div className="flex bg-card border border-border rounded-xl p-1 shrink-0">
          <button onClick={() => setView('listings')} className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", view === 'listings' ? "bg-purple text-white shadow-lg" : "text-text-muted hover:text-white")}>Opportunities</button>
          <button onClick={() => setView('applications')} className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", view === 'applications' ? "bg-purple text-white shadow-lg" : "text-text-muted hover:text-white")}>My Applications</button>
        </div>
      </div>

      {view === 'listings' ? (
        <>
          {/* Stats pills */}
          <div className="flex flex-wrap gap-4">
            <StatPill label="Opportunities" value={stats.total} color="purple" />
            <StatPill label="Applied" value={stats.applied} color="cyan" />
            <StatPill label="Shortlisted" value={stats.shortlisted} color="green" />
            <StatPill label="90%+ Matches" value={stats.greatMatches} color="orange" />
          </div>

          {/* Filters */}
          <div className="glass p-4 rounded-2xl border border-border bg-card/50 flex flex-col md:flex-row gap-4 sticky top-24 z-30">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search company or role..." 
                value={searchTerm}
                onChange={(e) => setSearchSearchTerm(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-purple outline-none"
              />
            </div>
            <select 
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple min-w-[160px]"
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select 
              value={activeLocation}
              onChange={(e) => setActiveLocation(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple min-w-[140px]"
            >
              <option value="All">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredInternships.map((item) => (
                <InternshipCard 
                  key={item.id} 
                  internship={item} 
                  isApplied={appliedIds.has(item.id)}
                  studentSkills={skills}
                  onApply={() => setSelectedId(item)}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {filteredInternships.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No matching internships</h3>
              <p className="text-text-secondary">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </>
      ) : (
        <ApplicationTracker applications={applications} />
      )}

      {selectedInternship && (
        <ApplyModal 
          internship={selectedInternship} 
          onClose={() => setSelectedId(null)}
          skills={skills}
        />
      )}
    </div>
  )
}

function StatPill({ label, value, color }) {
  const colors = {
    purple: "text-purple bg-purple/10 border-purple/20",
    cyan: "text-cyan bg-cyan/10 border-cyan/20",
    green: "text-green bg-green/10 border-green/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20"
  }
  return (
    <div className={cn("px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 shadow-sm", colors[color])}>
      <span className="opacity-70 font-medium uppercase text-[10px] tracking-widest">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function InternshipCard({ internship, isApplied, studentSkills, onApply }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const matchColor = internship.match_percentage >= 90 ? 'bg-green/10 text-green border-green/20' :
                   internship.match_percentage >= 70 ? 'bg-cyan/10 text-cyan border-cyan/20' :
                   internship.match_percentage >= 50 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                   'bg-white/5 text-text-muted border-white/10'

  const studentSkillNames = studentSkills.map(s => s.skill_name.toLowerCase())
  const verifiedNames = studentSkills.filter(s => s.is_verified).map(s => s.skill_name.toLowerCase())

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "glass rounded-3xl border transition-all duration-300 bg-card/60 overflow-hidden flex flex-col h-full",
        isApplied ? "border-white/10 opacity-80" : "border-border hover:border-purple/30 shadow-lg"
      )}
    >
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple/20 to-cyan/20 flex items-center justify-center text-xl font-bold text-white border border-white/10 shrink-0">
              {internship.company_name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{internship.company_name}</h3>
              <p className="text-purple-light font-medium text-sm">{internship.role}</p>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-tighter mt-1">Posted {formatDistanceToNow(new Date(internship.created_at))} ago</p>
            </div>
          </div>
          <div className={cn("px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 shadow-sm", matchColor)}>
            <Zap size={14} className="fill-current" /> {internship.match_percentage}% Match
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <MapPin size={16} className="text-text-muted" /> {internship.is_remote ? 'Remote' : internship.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <IndianRupee size={16} className="text-text-muted" /> ₹{internship.stipend_min / 1000}k-{internship.stipend_max / 1000}k
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock size={16} className="text-text-muted" /> {internship.duration_months} Months
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
             <Briefcase size={16} className="text-text-muted" /> Internship
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {internship.required_skills?.slice(0, 4).map((s, i) => {
            const hasSkill = studentSkillNames.some(name => name.includes(s.toLowerCase()))
            const isVerified = verifiedNames.some(name => name.includes(s.toLowerCase()))
            return (
              <span key={i} className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md border",
                isVerified ? "bg-green/10 text-green border-green/20" :
                hasSkill ? "bg-cyan/10 text-cyan border-cyan/20" :
                "bg-background text-text-muted border-border"
              )}>
                {s}
              </span>
            )
          })}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border mt-4 pt-4">
              <h4 className="text-xs font-bold text-white uppercase mb-2">Job Description</h4>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">{internship.description}</p>
              <h4 className="text-xs font-bold text-white uppercase mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                 {internship.required_skills?.map((s,i)=><span key={i} className="text-[10px] px-2 py-1 bg-background border border-border rounded text-text-muted">{s}</span>)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-background/40 border-t border-border flex items-center gap-3">
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-bold text-text-muted hover:text-white px-2">
          {isExpanded ? 'Show Less' : 'View Details'}
        </button>
        {isApplied ? (
           <Button disabled fullWidth className="bg-white/10 text-text-muted cursor-not-allowed border-0">
             Applied &checkmark;
           </Button>
        ) : (
          <Button onClick={onApply} fullWidth className="bg-gradient-to-r from-purple to-purple-dark text-white border-0 shadow-lg shadow-purple/20">
            Apply Now &rarr;
          </Button>
        )}
      </div>
    </motion.div>
  )
}
