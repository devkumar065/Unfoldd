'use client'

import { motion } from 'framer-motion'
import { MapPin, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function InternshipWidget({ internships = [] }) {
  return (
    <div className="glass p-6 rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Matched For You 🎯
        </h3>
        <a href="/internships" className="text-xs font-bold text-cyan hover:underline">View All →</a>
      </div>

      {internships.length === 0 ? (
        <div className="py-8 text-center text-text-secondary text-sm border-2 border-dashed border-border rounded-xl">
          Complete more missions to unlock internship matches tailored to your skills.
        </div>
      ) : (
        <div className="space-y-4">
          {internships.map((internship, i) => (
            <motion.div 
              key={internship.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-background border border-border hover:border-cyan/30 transition-colors group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-cyan transition-colors">{internship.role}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                    <Building2 size={12} /> {internship.company_name}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green/10 text-green border border-green/20 whitespace-nowrap">
                  90% Match
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
                <span className="flex items-center gap-1"><MapPin size={12} /> {internship.is_remote ? 'Remote' : internship.location}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>₹{internship.stipend_min / 1000}k-{internship.stipend_max / 1000}k</span>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" className="w-full h-8 text-xs font-bold bg-white text-black hover:bg-gray-200 border-0">
                  Apply Now
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
