'use client'

import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

export function ResumePreview({ resumeData, template }) {
  const getTemplate = () => {
    switch (template) {
      case 'modern': return <ModernResume data={resumeData} />
      case 'creative': return <CreativeResume data={resumeData} />
      default: return <ClassicResume data={resumeData} />
    }
  }

  return (
    <div className="w-full flex justify-center py-10">
      <div className="w-full max-w-[21cm] bg-white shadow-[0_30px_70px_rgba(0,0,0,0.5)] transform origin-top transition-transform duration-500 rounded-sm scale-[0.6] sm:scale-[0.75] md:scale-[0.85] lg:scale-[0.9] xl:scale-[1.0]">
        {getTemplate()}
      </div>
    </div>
  )
}

function ClassicResume({ data }) {
  return (
    <div className="min-h-[29.7cm] bg-white text-black p-12 sm:p-16 font-serif flex flex-col relative overflow-hidden">
      <div className="text-center border-b-2 border-gray-900 pb-8 mb-10">
        <h1 className="text-5xl font-bold uppercase tracking-[0.2em] text-gray-900 mb-4">{data.personal.name}</h1>
        <div className="text-xs uppercase font-bold text-gray-600 flex justify-center gap-6 flex-wrap tracking-wider">
          <span>{data.personal.email}</span>
          {data.personal.phone && <span>• {data.personal.phone}</span>}
          {data.personal.location && <span>• {data.personal.location}</span>}
        </div>
        <div className="text-[10px] text-gray-500 mt-3 flex justify-center gap-4 italic opacity-80">
           {data.personal.linkedin && <span>LinkedIn: {data.personal.linkedin}</span>}
           {data.personal.github && <span>GitHub: {data.personal.github}</span>}
        </div>
      </div>

      <div className="space-y-10 flex-1">
        {data.summary && (
          <section>
            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-gray-900 border-b border-gray-200 pb-2 mb-4">Professional Summary</h2>
            <p className="text-[13px] text-gray-700 leading-relaxed text-justify">{data.summary}</p>
          </section>
        )}

        <section>
          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-gray-900 border-b border-gray-200 pb-2 mb-5">Technical Expertise</h2>
          <div className="flex flex-wrap gap-2.5">
            {data.skills?.verified?.map((s,i) => <span key={i} className="text-[11px] font-black bg-gray-900 text-white px-3 py-1 rounded-sm uppercase tracking-tight">{s} ✓</span>)}
            {data.skills?.other?.map((s,i) => <span key={i} className="text-[11px] font-bold border border-gray-200 text-gray-700 px-3 py-1 rounded-sm uppercase tracking-tight">{s}</span>)}
          </div>
        </section>

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-gray-900 border-b border-gray-200 pb-2 mb-6">Selected Projects</h2>
            <div className="space-y-8">
              {data.projects.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[15px] font-black text-gray-900 uppercase tracking-tight">{p.title}</span>
                    <span className="text-[10px] text-gray-500 font-mono tracking-tighter italic">{(p.tech_stack||[]).join(' | ')}</span>
                  </div>
                  <p className="text-[13px] text-gray-700 leading-relaxed pl-4 border-l border-gray-100">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-gray-900 border-b border-gray-200 pb-2 mb-5">Education</h2>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[15px] font-black text-gray-900 uppercase">{data.education.institution}</span>
            <span className="text-[11px] font-bold text-gray-600">{data.education.year} — {data.education.graduation_year}</span>
          </div>
          <p className="text-[13px] text-gray-700 italic font-medium">{data.education.degree} in {data.education.branch}</p>
        </section>
      </div>
      
      <div className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-center opacity-30">
         <p className="text-[9px] font-black uppercase tracking-[0.2em]">Verified by Unfoldd Career Platform</p>
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-900" />
            <div className="w-2 h-2 rounded-full bg-gray-600" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
         </div>
      </div>
    </div>
  )
}

function ModernResume({ data }) {
  return (
    <div className="min-h-[29.7cm] bg-white text-black flex font-sans overflow-hidden">
      <div className="w-[35%] bg-[#0F0F15] text-white p-12 flex flex-col h-full shrink-0 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple/10 to-transparent" />
        
        <div className="mb-16 relative z-10">
          <div className="w-16 h-1 bg-purple mb-6" />
          <h1 className="text-3xl font-black mb-3 uppercase tracking-tighter leading-none">{data.personal.name}</h1>
          <p className="text-[11px] text-purple-light font-bold tracking-[0.3em] uppercase opacity-80">Certified Professional</p>
        </div>
        
        <div className="space-y-10 flex-1 relative z-10">
          <div className="space-y-4">
             <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/40 border-b border-white/10 pb-2">Contact</h2>
             <div className="space-y-2.5 text-[11px] font-medium text-white/80">
               <p className="truncate flex items-center gap-2"><span>✉</span> {data.personal.email}</p>
               <p className="flex items-center gap-2"><span>✆</span> {data.personal.phone}</p>
               <p className="flex items-center gap-2"><span>⚲</span> {data.personal.location}</p>
             </div>
          </div>

          <div className="space-y-6">
             <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/40 border-b border-white/10 pb-2">Verified</h2>
             <div className="flex flex-col gap-3">
               {data.skills?.verified?.map((s,i)=><span key={i} className="text-[10px] text-green-400 font-black uppercase flex items-center gap-2 tracking-tight bg-green-400/10 p-2 rounded-md border border-green-400/20">{s} <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" /></span>)}
             </div>
          </div>

          <div className="space-y-4">
             <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/40 border-b border-white/10 pb-2">Skills</h2>
             <div className="flex flex-wrap gap-2">
               {data.skills?.other?.map((s,i)=><span key={i} className="text-[9px] bg-white/5 text-white/70 px-2 py-1 rounded-md uppercase font-bold border border-white/10">{s}</span>)}
             </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/10 opacity-30 flex items-center gap-3 relative z-10">
           <Image src="/logo.png" width={20} height={20} className="grayscale invert" alt="logo" />
           <p className="text-[9px] font-black tracking-[0.2em] uppercase">Verified Portfolio</p>
        </div>
      </div>
      <div className="w-[65%] p-16 bg-white flex flex-col h-full">
         <div className="mb-14">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-300 mb-6 border-b border-gray-100 pb-2">Summary</h2>
            <p className="text-[13px] text-gray-600 leading-relaxed font-medium">{data.summary}</p>
         </div>
         
         <div className="mb-14 flex-1">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-300 mb-8 border-b border-gray-100 pb-2">Practical Experience</h2>
            <div className="space-y-10">
               {data.projects?.map((p, i) => (
                 <div key={i} className="relative pl-6 border-l-2 border-purple/10">
                   <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-purple" />
                   <h3 className="text-[16px] font-black text-gray-900 uppercase mb-2 tracking-tight">{p.title}</h3>
                   <p className="text-[10px] text-purple font-mono mb-3 font-bold">{(p.tech_stack||[]).join(' • ')}</p>
                   <p className="text-[13px] text-gray-600 leading-relaxed">{p.description}</p>
                 </div>
               ))}
            </div>
         </div>

         <div className="mt-auto">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-300 mb-6 border-b border-gray-100 pb-2">Education</h2>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-[15px] font-black text-gray-900 uppercase tracking-tight">{data.education.institution}</p>
              <p className="text-[13px] text-gray-600 font-bold mt-1.5">{data.education.degree} — {data.education.branch}</p>
              <p className="text-[11px] text-gray-400 mt-1 uppercase font-bold">{data.education.year} to {data.education.graduation_year}</p>
            </div>
         </div>
      </div>
    </div>
  )
}

function CreativeResume({ data }) {
  return (
    <div className="min-h-[29.7cm] bg-white text-black p-20 font-sans relative overflow-hidden">
       <div className="absolute top-0 right-0 w-64 h-64 bg-purple/5 rounded-full -mr-32 -mt-32" />
       
       <div className="grid grid-cols-[1.2fr_2fr] gap-20 relative z-10">
          <div className="space-y-16">
             <div className="w-32 h-32 bg-purple text-white flex items-center justify-center text-6xl font-black rounded-[2.5rem] rotate-6 shadow-2xl shadow-purple/30">
                {data.personal.name.charAt(0)}
             </div>
             
             <div className="space-y-10">
                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple border-b-2 border-purple/10 pb-2">Connect</p>
                   <div className="space-y-2">
                     <p className="text-[13px] font-bold text-gray-900 leading-tight">{data.personal.email}</p>
                     <p className="text-[13px] font-bold text-gray-800 leading-tight">{data.personal.phone}</p>
                     <p className="text-[12px] font-medium text-gray-500 leading-tight mt-4">{data.personal.location}</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple border-b-2 border-purple/10 pb-2">Expertise</p>
                   <div className="flex flex-wrap gap-2">
                      {data.skills?.verified?.map((s,i)=><span key={i} className="text-[10px] bg-purple text-white px-2.5 py-1 rounded-full font-black uppercase tracking-tight shadow-md shadow-purple/20">{s}</span>)}
                      {data.skills?.other?.map((s,i)=><span key={i} className="text-[10px] border-2 border-gray-100 text-gray-400 px-2.5 py-1 rounded-full font-bold uppercase">{s}</span>)}
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple border-b-2 border-purple/10 pb-2">Online</p>
                   <div className="flex flex-col gap-2 text-[11px] font-bold text-gray-600">
                      {data.personal.linkedin && <span className="truncate">in: {data.personal.linkedin.split('/').pop()}</span>}
                      {data.personal.github && <span className="truncate">gh: {data.personal.github.split('/').pop()}</span>}
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-6">
             <div className="mb-20">
               <h1 className="text-7xl font-black text-gray-900 uppercase tracking-tighter leading-[0.75] mb-4">
                 {data.personal.name.split(' ').map((n,i)=><span key={i} className={i===1 ? "block text-purple" : "block"}>{n}</span>)}
               </h1>
               <div className="h-2 w-24 bg-purple-light" />
             </div>

             <div className="space-y-20">
                <section>
                   <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300 mb-6 flex items-center gap-4">Bio <div className="h-px bg-gray-100 flex-1" /></h2>
                   <p className="text-[16px] text-gray-600 leading-relaxed font-medium italic">&quot;{data.summary}&quot;</p>
                </section>

                <section>
                   <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300 mb-10 flex items-center gap-4">Projects <div className="h-px bg-gray-100 flex-1" /></h2>
                   <div className="space-y-16">
                      {data.projects?.map((p, i) => (
                        <div key={i} className="group">
                          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-3 transition-colors group-hover:text-purple">{p.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-4">
                             {p.tech_stack?.map((s, idx) => <span key={idx} className="text-[9px] font-black text-purple-light uppercase">{s}</span>)}
                          </div>
                          <p className="text-[14px] text-gray-500 leading-relaxed">{p.description}</p>
                        </div>
                      ))}
                   </div>
                </section>
             </div>
          </div>
       </div>
       
       <div className="absolute top-10 right-10 flex items-center gap-2">
          <div className="border-4 border-gray-900 p-3 transform rotate-12 bg-white">
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 leading-none text-center">UNFOLDD<br/>CERTIFIED<br/>2026</p>
          </div>
       </div>
    </div>
  )
}
